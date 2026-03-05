// api/submit-inquiry.js — POST /api/submit-inquiry
// Saves buyer inquiry to MongoDB and notifies seller + buyer via email
import { createClerkClient } from '@clerk/backend'
import { ObjectId } from 'mongodb'
import { getDb } from './lib/db.js'
import { mail } from './lib/mailer.js'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Auth optional — logged-in buyers tracked, guests allowed
  let buyerId = null
  const sessionToken = req.headers.authorization?.replace('Bearer ', '')
  if (sessionToken) {
    try {
      const session = await clerk.sessions.verifySession(sessionToken, sessionToken)
      buyerId = session.userId
    } catch { /* guest inquiry — ok */ }
  }

  try {
    const { listingId, buyerName, buyerPhone, buyerEmail, message } = req.body

    if (!listingId || !buyerName || !buyerPhone) {
      return res.status(400).json({ error: 'listingId, buyerName and buyerPhone are required' })
    }

    const db = await getDb()

    // Fetch listing to get seller details
    const listing = await db.collection('listings').findOne(
      { _id: new ObjectId(listingId) },
      { projection: { title: 1, 'seller.name': 1, 'seller.email': 1, 'seller.phone': 1, 'seller.whatsapp': 1, 'seller.userId': 1, 'location.district': 1 } }
    )

    if (!listing) return res.status(404).json({ error: 'Listing not found' })

    const inquiry = {
      listingId,
      listingTitle:  listing.title,
      sellerId:      listing.seller.userId,
      buyerId,
      buyerName,
      buyerPhone,
      buyerEmail:    buyerEmail || '',
      message:       message   || '',
      status:        'new',   // new | contacted | closed
      createdAt:     new Date(),
    }

    await db.collection('inquiries').insertOne(inquiry)

    // Increment inquiry count on listing
    await db.collection('listings').updateOne(
      { _id: new ObjectId(listingId) },
      { $inc: { inquiryCount: 1 }, $set: { updatedAt: new Date() } }
    )

    // Send emails in parallel
    await Promise.allSettled([
      // Seller notification
      mail.newInquiry(listing.seller.email, {
        sellerName:   listing.seller.name,
        listingTitle: listing.title,
        listingId,
        buyerName,
        buyerPhone,
        buyerEmail:   buyerEmail || '',
        message,
      }),
      // Buyer confirmation (only if email provided)
      buyerEmail ? mail.inquiryConfirmation(buyerEmail, {
        buyerName,
        listingTitle: listing.title,
        listingId,
        district:     listing.location?.district || 'Tamil Nadu',
        sellerPhone:  listing.seller.phone,
      }) : Promise.resolve(),
      // Admin log
      mail.adminInquiry({
        listingTitle: listing.title,
        listingId,
        buyerName,
        buyerEmail:   buyerEmail || '',
        buyerPhone,
        sellerName:   listing.seller.name,
        message,
      }),
    ])

    return res.status(201).json({ success: true, message: 'Inquiry sent to seller' })
  } catch (error) {
    console.error('Submit inquiry error:', error)
    return res.status(500).json({ error: 'Failed to submit inquiry' })
  }
}
