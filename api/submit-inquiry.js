// api/submit-inquiry.js — POST /api/submit-inquiry
// Saves buyer inquiry to Supabase and notifies seller + buyer via email
import { createClerkClient } from '@clerk/backend'
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

    const supabase = getDb()

    // Fetch listing to get seller details
    const { data: listing, error: fetchError } = await supabase
      .from('listings')
      .select('id, title, user_id, seller_name, seller_email, seller_phone, seller_whatsapp, location_district')
      .eq('id', listingId)
      .single()

    if (fetchError || !listing) return res.status(404).json({ error: 'Listing not found' })

    const inquiry = {
      listing_id:    listingId,
      listing_title: listing.title,
      seller_id:     listing.user_id,
      buyer_id:      buyerId,
      buyer_name:    buyerName,
      buyer_phone:   buyerPhone,
      buyer_email:   buyerEmail || '',
      message:       message   || '',
      status:        'new',
    }

    const { error: insertError } = await supabase.from('inquiries').insert([inquiry])
    if (insertError) throw insertError

    // Increment inquiry count on listing
    const { data: current } = await supabase
      .from('listings')
      .select('inquiry_count')
      .eq('id', listingId)
      .single()

    if (current) {
      await supabase
        .from('listings')
        .update({ inquiry_count: (current.inquiry_count || 0) + 1 })
        .eq('id', listingId)
    }

    // Send emails in parallel
    await Promise.allSettled([
      // Seller notification
      mail.newInquiry(listing.seller_email, {
        sellerName:   listing.seller_name,
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
        district:     listing.location_district || 'Tamil Nadu',
        sellerPhone:  listing.seller_phone,
      }) : Promise.resolve(),
      // Admin log
      mail.adminInquiry({
        listingTitle: listing.title,
        listingId,
        buyerName,
        buyerEmail:   buyerEmail || '',
        buyerPhone,
        sellerName:   listing.seller_name,
        message,
      }),
    ])

    return res.status(201).json({ success: true, message: 'Inquiry sent to seller' })
  } catch (error) {
    console.error('Submit inquiry error:', error)
    return res.status(500).json({ error: 'Failed to submit inquiry' })
  }
}
