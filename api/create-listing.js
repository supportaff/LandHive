// api/create-listing.js — POST /api/create-listing
import { Resend } from 'resend'
import { createClerkClient } from '@clerk/backend'
import { getDb } from './lib/db.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const clerk  = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

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

    // ─── Listing fee tiers ────────────────────────────────────────────────────
    const price = parseFloat(totalPrice) || 0
    let listingFee = 2499
    if (price > 10000000)    listingFee = 14999
    else if (price >= 5000000) listingFee = 9999
    else if (price >= 2500000) listingFee = 4999

    // 90-day expiry after approval
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    const listing = {
      // ── Identity ──────────────────────────────────────────────────────────
      userId,
      title,
      landType,

      // ── Property Details ──────────────────────────────────────────────────
      area:         { value: parseFloat(areaValue), unit: areaUnit },
      surveyNumber: surveyNumber || '',
      price:        { total: price, perAcre: parseFloat(perAcre) || 0 },
      description:  description || '',

      // ── Location ──────────────────────────────────────────────────────────
      location: {
        state:    'Tamil Nadu',
        district,
        village:  village  || '',
        landmark: landmark || '',
        lat:      parseFloat(lat) || null,
        lng:      parseFloat(lng) || null,
      },

      // ── Media ─────────────────────────────────────────────────────────────
      photos:    photos    || [],
      documents: documents || [],

      // ── Seller Info ───────────────────────────────────────────────────────
      seller: {
        userId,
        name:     sellerName,
        email:    sellerEmail  || userEmail,
        phone:    sellerPhone,
        whatsapp: sellerPhone?.replace(/\D/g, ''),
      },

      // ── KYC ───────────────────────────────────────────────────────────────
      kyc: {
        status:        'pending', // pending | verified | rejected
        aadhaarName:   kycAadhaarName   || '',
        aadhaarNumber: kycAadhaarNumber?.replace(/\s/g, '') || '',
        panNumber:     kycPanNumber     || '',
        submittedAt:   new Date(),
        verifiedAt:    null,
        rejectedAt:    null,
        rejectedReason: null,
      },

      // ── Payment ───────────────────────────────────────────────────────────
      // Full payment record populated by payu-webhook once payment completes
      payment: {
        status:    'pending', // pending | paid | failed
        txnid:     null,
        mihpayid:  null,
        amount:    null,
        mode:      null,
        paidAt:    null,
      },
      listingFee,

      // ── Status & Flags ────────────────────────────────────────────────────
      // pending → awaiting_payment → pending_kyc → approved | rejected
      status:       'pending',
      verified:     false,
      kycVerified:  false,
      featured:     false,

      // ── Analytics ─────────────────────────────────────────────────────────
      viewCount:    0,
      inquiryCount: 0,

      // ── Timestamps ────────────────────────────────────────────────────────
      expiresAt,
      createdAt:  new Date(),
      updatedAt:  new Date(),
    }

    const result = await db.collection('listings').insertOne(listing)
    const listingId = result.insertedId.toString()

    // ── Upsert user profile ──────────────────────────────────────────────────
    await db.collection('users').updateOne(
      { clerkId: userId },
      {
        $setOnInsert: { clerkId: userId, createdAt: new Date() },
        $set: {
          name:          sellerName,
          email:         sellerEmail || userEmail,
          phone:         sellerPhone,
          role:          'seller',
          updatedAt:     new Date(),
        },
        $inc: { totalListings: 1 },
      },
      { upsert: true }
    )

    // ── Confirmation email to seller ─────────────────────────────────────────
    await resend.emails.send({
      from: `LandHive <${process.env.RESEND_FROM_EMAIL || 'hello@landhive.in'}>`,
      to:   [sellerEmail || userEmail],
      subject: 'Your LandHive listing has been submitted — complete payment to go live',
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <div style="background:#16a34a;padding:24px;border-radius:16px 16px 0 0;text-align:center">
            <h1 style="color:white;margin:0">LandHive 🌿</h1>
          </div>
          <div style="background:white;border:1px solid #e2e8f0;padding:32px;border-radius:0 0 16px 16px">
            <h2 style="color:#1e293b;margin-top:0">Listing Submitted!</h2>
            <p style="color:#64748b">Hi ${sellerName},</p>
            <p style="color:#64748b">Your listing <strong>"${title}"</strong> has been received.</p>
            <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:0;font-weight:600;color:#854d0e">⚠️ Next Step: Complete Payment</p>
              <p style="margin:8px 0 0;color:#92400e">Pay the listing fee of <strong>\u20B9${listingFee.toLocaleString('en-IN')}</strong> in your dashboard to activate your listing.</p>
            </div>
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:16px 0">
              <p style="margin:0;font-weight:600;color:#15803d">📋 Listing Details</p>
              <p style="margin:8px 0 0;color:#166534">ID: <strong>${listingId}</strong></p>
              <p style="margin:4px 0;color:#166534">District: ${district}, Tamil Nadu</p>
              <p style="margin:4px 0;color:#166534">Area: ${areaValue} ${areaUnit}</p>
              <p style="margin:4px 0;color:#166534">Price: \u20B9${(price / 100000).toFixed(1)}L</p>
              <p style="margin:4px 0;color:#166534">Listing Fee: \u20B9${listingFee.toLocaleString('en-IN')}</p>
            </div>
            <p style="color:#64748b">Questions? Email <a href="mailto:hello@landhive.in" style="color:#16a34a">hello@landhive.in</a></p>
          </div>
        </div>`,
    }).catch(e => console.error('Seller email failed:', e))

    // ── Admin alert ──────────────────────────────────────────────────────────
    await resend.emails.send({
      from: `LandHive System <${process.env.RESEND_FROM_EMAIL || 'hello@landhive.in'}>`,
      to:   ['admin@landhive.in'],
      subject: `[Admin] New listing pending payment: ${title}`,
      html: `
        <p>New listing submitted and awaiting payment:</p>
        <ul>
          <li><strong>Listing ID:</strong> ${listingId}</li>
          <li><strong>Title:</strong> ${title}</li>
          <li><strong>Seller:</strong> ${sellerName} (${sellerPhone})</li>
          <li><strong>Email:</strong> ${sellerEmail || userEmail}</li>
          <li><strong>District:</strong> ${district}</li>
          <li><strong>Price:</strong> \u20B9${(price / 100000).toFixed(1)}L</li>
          <li><strong>Listing Fee:</strong> \u20B9${listingFee.toLocaleString('en-IN')}</li>
        </ul>
        <p><a href="https://landhive.in/admin">Review in Admin Panel →</a></p>`,
    }).catch(e => console.error('Admin email failed:', e))

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
