// api/create-listing.js — POST /api/create-listing
import { createClerkClient } from '@clerk/backend'
import { getDb } from './lib/db.js'
import { mail } from './lib/mailer.js'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const sessionToken = req.headers.authorization?.replace('Bearer ', '')
  if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' })

  let userId, userEmail
  try {
    const session = await clerk.sessions.verifySession(sessionToken, sessionToken)
    userId = session.userId
    const user = await clerk.users.getUser(userId)
    userEmail = user.emailAddresses[0]?.emailAddress || ''
  } catch {
    return res.status(401).json({ error: 'Invalid session' })
  }

  try {
    const db = await getDb()

    const {
      title, landType, areaValue, areaUnit, surveyNumber,
      totalPrice, perAcre, description,
      district, village, landmark, lat, lng,
      photos, documents,
      sellerName, sellerPhone, sellerEmail,
      kycAadhaarName, kycAadhaarNumber, kycPanNumber,
    } = req.body

    // ── Listing fee tiers ──────────────────────────────────────────────────
    const price = parseFloat(totalPrice) || 0
    let listingFee = 2499
    if (price > 10000000)    listingFee = 14999
    else if (price >= 5000000) listingFee = 9999
    else if (price >= 2500000) listingFee = 4999

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    const toEmail = sellerEmail || userEmail

    const listing = {
      userId,
      title,
      landType,
      area:         { value: parseFloat(areaValue), unit: areaUnit },
      surveyNumber: surveyNumber || '',
      price:        { total: price, perAcre: parseFloat(perAcre) || 0 },
      description:  description || '',
      location: {
        state:    'Tamil Nadu',
        district,
        village:  village  || '',
        landmark: landmark || '',
        lat:      parseFloat(lat) || null,
        lng:      parseFloat(lng) || null,
      },
      photos:    photos    || [],
      documents: documents || [],
      seller: {
        userId,
        name:     sellerName,
        email:    toEmail,
        phone:    sellerPhone,
        whatsapp: sellerPhone?.replace(/\D/g, ''),
      },
      kyc: {
        status:         'pending',
        aadhaarName:    kycAadhaarName   || '',
        aadhaarNumber:  kycAadhaarNumber?.replace(/\s/g, '') || '',
        panNumber:      kycPanNumber     || '',
        submittedAt:    new Date(),
        verifiedAt:     null,
        rejectedAt:     null,
        rejectedReason: null,
      },
      payment: {
        status:   'pending',
        txnid:    null,
        mihpayid: null,
        amount:   null,
        mode:     null,
        paidAt:   null,
      },
      listingFee,
      status:       'pending',
      verified:     false,
      kycVerified:  false,
      featured:     false,
      viewCount:    0,
      inquiryCount: 0,
      expiresAt,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    }

    const result    = await db.collection('listings').insertOne(listing)
    const listingId = result.insertedId.toString()

    // ── Upsert user profile ─────────────────────────────────────────────────
    await db.collection('users').updateOne(
      { clerkId: userId },
      {
        $setOnInsert: { clerkId: userId, createdAt: new Date() },
        $set: { name: sellerName, email: toEmail, phone: sellerPhone, role: 'seller', updatedAt: new Date() },
        $inc: { totalListings: 1 },
      },
      { upsert: true }
    )

    // ── Emails (non-blocking) ────────────────────────────────────────────────
    await Promise.allSettled([
      mail.listingSubmitted(toEmail, {
        name: sellerName, title, listingId,
        district, areaValue, areaUnit, price, listingFee,
      }),
      mail.adminNewListing({
        listingId, title, sellerName,
        sellerPhone, sellerEmail: toEmail,
        district, price, listingFee,
      }),
    ])

    return res.status(201).json({
      success:    true,
      listingId,
      listingFee,
      message:    'Listing submitted — complete payment to activate',
    })
  } catch (error) {
    console.error('Create listing error:', error)
    return res.status(500).json({ error: 'Failed to create listing' })
  }
}
