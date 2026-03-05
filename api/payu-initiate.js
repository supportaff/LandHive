// api/payu-initiate.js — POST /api/payu-initiate
// Generates PayU payment hash and saves an initiated payment record
import crypto from 'crypto'
import { createClerkClient } from '@clerk/backend'
import { getDb } from './lib/db.js'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const sessionToken = req.headers.authorization?.replace('Bearer ', '')
  if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' })

  let userId, userEmail, userName, userPhone
  try {
    const session = await clerk.sessions.verifySession(sessionToken, sessionToken)
    userId = session.userId
    const user = await clerk.users.getUser(userId)
    userEmail = user.emailAddresses[0]?.emailAddress || ''
    userName  = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'
    userPhone = user.phoneNumbers?.[0]?.phoneNumber || ''
  } catch {
    return res.status(401).json({ error: 'Invalid session' })
  }

  try {
    const KEY  = process.env.PAYU_MERCHANT_KEY
    const SALT = process.env.PAYU_MERCHANT_SALT
    if (!KEY || !SALT) return res.status(500).json({ error: 'PayU credentials not configured' })

    const { listingId, amount, productinfo, phone } = req.body
    if (!listingId || !amount) return res.status(400).json({ error: 'listingId and amount are required' })

    const contactPhone = phone || userPhone || ''

    // ── Unique transaction ID ──────────────────────────────────────────────
    const txnid = `LH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // ── PayU hash ─────────────────────────────────────────────────────────
    // Format: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    // udf1 = listingId (used in webhook to identify the listing)
    // udf2 = userId
    const hashStr = [
      KEY, txnid, amount, productinfo,
      userName, userEmail,
      listingId, userId, '', '', '', // udf1–udf5
      '', '', '', '', '',            // extra fields
      SALT,
    ].join('|')
    const hash = crypto.createHash('sha512').update(hashStr).digest('hex')

    // ── Save initiated payment record ─────────────────────────────────────
    const db = await getDb()
    await db.collection('payments').insertOne({
      txnid,
      userId,
      listingId,
      productinfo:  productinfo || `LandHive Listing Fee`,
      firstname:    userName,
      email:        userEmail,
      phone:        contactPhone,
      amount:       parseFloat(amount),
      currency:     'INR',
      status:       'initiated',       // initiated | success | failure | pending
      udf1:         listingId,
      udf2:         userId,
      payuHash:     hash,
      // Payment response fields — populated by payu-webhook
      mihpayid:     null,
      paymentMode:  null,
      bankCode:     null,
      bankRefNum:   null,
      cardNum:      null,
      nameOnCard:   null,
      issuingBank:  null,
      errorCode:    null,
      errorMessage: null,
      responseHash: null,
      hashValid:    null,
      rawResponse:  null,
      initiatedAt:  new Date(),
      completedAt:  null,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    })

    // ── Update listing status to awaiting_payment ─────────────────────────
    const { ObjectId } = await import('mongodb')
    await db.collection('listings').updateOne(
      { _id: new ObjectId(listingId) },
      { $set: { status: 'awaiting_payment', updatedAt: new Date() } }
    )

    const appUrl = process.env.APP_URL || 'https://landhive.in'

    return res.status(200).json({
      txnid,
      hash,
      key:         KEY,
      amount:      String(amount),
      productinfo: productinfo || 'LandHive Listing Fee',
      firstname:   userName,
      email:       userEmail,
      phone:       contactPhone,
      udf1:        listingId,
      udf2:        userId,
      surl:        `${appUrl}/payment/success`,
      furl:        `${appUrl}/payment/failure`,
      action:      'https://secure.payu.in/_payment', // production PayU endpoint
    })
  } catch (error) {
    console.error('PayU initiate error:', error)
    return res.status(500).json({ error: 'Payment initiation failed' })
  }
}
