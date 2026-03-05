// api/payu-initiate.js — POST /api/payu-initiate
// Generates PayU hash and saves an initiated payment record
//
// Env vars:
//   LH_PAYU_KEY   — PayU merchant key
//   LH_PAYU_SALT  — PayU merchant salt
//   LH_PAYU_ENV   — "true" = live (secure.payu.in) | "false" = test (test.payu.in)

import crypto from 'crypto'
import { createClerkClient } from '@clerk/backend'
import { getDb } from './lib/db.js'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

// ── PayU endpoints ───────────────────────────────────────────────────────────
const PAYU_LIVE_URL = 'https://secure.payu.in/_payment'
const PAYU_TEST_URL = 'https://test.payu.in/_payment'

function getPayuConfig() {
  const isLive = process.env.LH_PAYU_ENV === 'true'
  return {
    key:    process.env.LH_PAYU_KEY,
    salt:   process.env.LH_PAYU_SALT,
    url:    isLive ? PAYU_LIVE_URL : PAYU_TEST_URL,
    isLive,
  }
}

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
    const { key, salt, url, isLive } = getPayuConfig()

    if (!key || !salt) {
      return res.status(500).json({
        error: 'PayU not configured. Set LH_PAYU_KEY and LH_PAYU_SALT in Vercel env vars.',
      })
    }

    const { listingId, amount, productinfo, phone } = req.body
    if (!listingId || !amount) {
      return res.status(400).json({ error: 'listingId and amount are required' })
    }

    const contactPhone = phone || userPhone || ''

    // ── Unique transaction ID ──────────────────────────────────────────────
    const txnid = `LH${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // ── PayU hash ─────────────────────────────────────────────────────────
    // key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
    // udf1 = listingId, udf2 = userId (for webhook recovery)
    const hashStr = [
      key, txnid, amount, productinfo,
      userName, userEmail,
      listingId, userId, '', '', '',
      '', '', '', '', '',
      salt,
    ].join('|')
    const hash = crypto.createHash('sha512').update(hashStr).digest('hex')

    // ── Save payment record to MongoDB ─────────────────────────────────────
    const db = await getDb()
    await db.collection('payments').insertOne({
      txnid,
      userId,
      listingId,
      productinfo:  productinfo || 'LandHive Listing Fee',
      firstname:    userName,
      email:        userEmail,
      phone:        contactPhone,
      amount:       parseFloat(amount),
      currency:     'INR',
      mode:         isLive ? 'live' : 'test',  // track test vs live
      status:       'initiated',
      udf1:         listingId,
      udf2:         userId,
      payuHash:     hash,
      // — populated by payu-webhook after payment —
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

    // ── Mark listing as awaiting payment ──────────────────────────────────
    const { ObjectId } = await import('mongodb')
    await db.collection('listings').updateOne(
      { _id: new ObjectId(listingId) },
      { $set: { status: 'awaiting_payment', updatedAt: new Date() } }
    )

    const appUrl = process.env.APP_URL || 'https://landhive.in'

    // Return all params needed to POST to PayU
    return res.status(200).json({
      txnid,
      hash,
      key,
      amount:      String(amount),
      productinfo: productinfo || 'LandHive Listing Fee',
      firstname:   userName,
      email:       userEmail,
      phone:       contactPhone,
      udf1:        listingId,
      udf2:        userId,
      surl:        `${appUrl}/payment/success`,
      furl:        `${appUrl}/payment/failure`,
      action:      url,              // test.payu.in or secure.payu.in
      payuEnv:     isLive ? 'live' : 'test',
    })
  } catch (error) {
    console.error('PayU initiate error:', error)
    return res.status(500).json({ error: 'Payment initiation failed' })
  }
}
