// api/create-listing.js
// Vercel Serverless Function — POST /api/create-listing
// Saves a new listing to MongoDB Atlas and sends confirmation email via Resend

import { MongoClient } from 'mongodb'
import { Resend } from 'resend'
import { createClerkClient } from '@clerk/backend'

const client = new MongoClient(process.env.MONGODB_URI)
const resend = new Resend(process.env.RESEND_API_KEY)
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify Clerk session
  const sessionToken = req.headers.authorization?.replace('Bearer ', '')
  if (!sessionToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  let userId
  try {
    const session = await clerk.sessions.verifySession(sessionToken, sessionToken)
    userId = session.userId
  } catch {
    return res.status(401).json({ error: 'Invalid session' })
  }

  try {
    await client.connect()
    const db = client.db('landhive')

    const {
      title, landType, areaValue, areaUnit, surveyNumber,
      totalPrice, perAcre, description,
      district, village, landmark, lat, lng,
      photos, documents,
      sellerName, sellerPhone,
      kycAadhaarName, kycAadhaarNumber, kycPanNumber,
    } = req.body

    // ─── Listing fee tiers ───────────────────────────────────────────────────
    // < ₹25L        → ₹2,499
    // ₹25L – ₹50L   → ₹4,999
    // ₹50L – ₹1Cr   → ₹9,999
    // > ₹1Cr         → ₹14,999
    const price = parseFloat(totalPrice) || 0
    let listingFee = 2499
    if (price > 10000000) listingFee = 14999
    else if (price >= 5000000) listingFee = 9999
    else if (price >= 2500000) listingFee = 4999

    const listing = {
      userId,
      title,
      landType,
      area: { value: parseFloat(areaValue), unit: areaUnit },
      surveyNumber,
      price: { total: price, perAcre: parseFloat(perAcre) || 0 },
      description,
      location: {
        state: 'Tamil Nadu',
        district,
        village,
        landmark,
        lat: parseFloat(lat) || null,
        lng: parseFloat(lng) || null,
      },
      photos: photos || [],
      documents: documents || [],
      seller: {
        userId,
        name: sellerName,
        phone: sellerPhone,
        whatsapp: sellerPhone?.replace(/\D/g, ''),
      },
      kyc: {
        status: 'pending', // pending | verified | rejected
        aadhaarName: kycAadhaarName,
        aadhaarNumber: kycAadhaarNumber?.replace(/\s/g, ''),
        panNumber: kycPanNumber,
        submittedAt: new Date(),
      },
      status: 'pending', // pending | approved | rejected  — approved only after KYC
      listingFee,
      paymentStatus: 'pending', // pending | paid
      verified: false,
      kycVerified: false,
      featured: false,
      viewCount: 0,
      inquiryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection('listings').insertOne(listing)

    // Send confirmation email via Resend
    await resend.emails.send({
      from: `LandHive <${process.env.RESEND_FROM_EMAIL || 'hello@landhive.in'}>`,
      to: [req.body.sellerEmail || 'hello@landhive.in'],
      subject: 'Your LandHive listing has been submitted for review',
      html: `
        <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #16a34a; padding: 24px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0;">LandHive 🌿</h1>
          </div>
          <div style="background: white; border: 1px solid #e2e8f0; padding: 32px; border-radius: 0 0 16px 16px;">
            <h2 style="color: #1e293b; margin-top: 0;">Listing Submitted Successfully!</h2>
            <p style="color: #64748b;">Hi ${sellerName},</p>
            <p style="color: #64748b;">Your listing <strong style="color: #1e293b;">"${title}"</strong> has been received and is under review.</p>

            <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #854d0e; font-weight: 600;">⚠️ Important</p>
              <p style="margin: 8px 0 0; color: #92400e;">Your property will be <strong>approved only after KYC verification</strong> (1–2 business days).</p>
            </div>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #15803d; font-weight: 600;">📋 Listing Details</p>
              <p style="margin: 8px 0 0; color: #166534;">District: ${district}, Tamil Nadu</p>
              <p style="margin: 4px 0 0; color: #166534;">Area: ${areaValue} ${areaUnit}</p>
              <p style="margin: 4px 0 0; color: #166534;">Price: ₹${(price / 100000).toFixed(1)}L</p>
              <p style="margin: 4px 0 0; color: #166534;">Listing Fee: ₹${listingFee.toLocaleString('en-IN')}</p>
            </div>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
              <p style="margin: 0; color: #15803d; font-weight: 600;">⏳ Next Steps</p>
              <p style="margin: 8px 0 0; color: #92400e;">1. KYC verification in progress (1–2 business days)</p>
              <p style="margin: 4px 0 0; color: #92400e;">2. Listing review by admin team</p>
              <p style="margin: 4px 0 0; color: #92400e;">3. Live on LandHive within 24–48 hours after KYC approval</p>
              <p style="margin: 4px 0 0; color: #92400e;">4. WhatsApp alerts for every buyer inquiry</p>
            </div>

            <p style="color: #64748b;">Questions? Email us at <a href="mailto:hello@landhive.in" style="color: #16a34a;">hello@landhive.in</a></p>
          </div>
        </div>
      `,
    })

    // Notify admin via email
    await resend.emails.send({
      from: `LandHive System <${process.env.RESEND_FROM_EMAIL || 'hello@landhive.in'}>`,
      to: ['admin@landhive.in'],
      subject: `[Admin] New listing pending KYC: ${title}`,
      html: `
        <p>New listing submitted:</p>
        <ul>
          <li><strong>Title:</strong> ${title}</li>
          <li><strong>Seller:</strong> ${sellerName} (${sellerPhone})</li>
          <li><strong>District:</strong> ${district}</li>
          <li><strong>Price:</strong> ₹${(price / 100000).toFixed(1)}L</li>
          <li><strong>Listing Fee:</strong> ₹${listingFee.toLocaleString('en-IN')}</li>
          <li><strong>KYC Name:</strong> ${kycAadhaarName}</li>
          <li><strong>Listing ID:</strong> ${result.insertedId}</li>
        </ul>
        <p><a href="https://landhive.in/admin">Review in Admin Panel →</a></p>
      `,
    })

    return res.status(201).json({
      success: true,
      listingId: result.insertedId.toString(),
      listingFee,
      message: 'Listing submitted for review — will be approved after KYC verification',
    })
  } catch (error) {
    console.error('Create listing error:', error)
    return res.status(500).json({ error: 'Failed to create listing' })
  } finally {
    await client.close()
  }
}
