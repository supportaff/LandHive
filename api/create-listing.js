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
    const supabase = getDb()

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
      user_id:            userId,
      title,
      land_type:          landType,
      area_value:         parseFloat(areaValue),
      area_unit:          areaUnit,
      survey_number:      surveyNumber || '',
      price_total:        price,
      price_per_acre:     parseFloat(perAcre) || 0,
      description:        description || '',
      location_state:     'Tamil Nadu',
      location_district:  district,
      location_village:   village  || '',
      location_landmark:  landmark || '',
      location_lat:       parseFloat(lat) || null,
      location_lng:       parseFloat(lng) || null,
      photos:             photos    || [],
      documents:          documents || [],
      seller_name:        sellerName,
      seller_email:       toEmail,
      seller_phone:       sellerPhone,
      seller_whatsapp:    sellerPhone?.replace(/\D/g, ''),
      kyc_status:         'pending',
      kyc_aadhaar_name:   kycAadhaarName   || '',
      kyc_aadhaar_number: kycAadhaarNumber?.replace(/\s/g, '') || '',
      kyc_pan_number:     kycPanNumber     || '',
      kyc_submitted_at:   new Date().toISOString(),
      payment_status:     'pending',
      listing_fee:        listingFee,
      status:             'pending',
      verified:           false,
      kyc_verified:       false,
      featured:           false,
      view_count:         0,
      inquiry_count:      0,
      expires_at:         expiresAt.toISOString(),
    }

    const { data, error } = await supabase
      .from('listings')
      .insert([listing])
      .select('id')
      .single()

    if (error) throw error
    const listingId = data.id

    // ── Upsert user profile ─────────────────────────────────────────────────
    await supabase
      .from('users')
      .upsert(
        {
          clerk_id:       userId,
          name:           sellerName,
          email:          toEmail,
          phone:          sellerPhone,
          role:           'seller',
        },
        { onConflict: 'clerk_id', ignoreDuplicates: false }
      )

    // Increment total_listings
    await supabase.rpc('increment_user_listings', { user_clerk_id: userId })
      .catch(() => {
        // Fallback if RPC doesn't exist: manual read-update
        supabase.from('users')
          .select('total_listings')
          .eq('clerk_id', userId)
          .single()
          .then(({ data: u }) => {
            if (u) {
              supabase.from('users')
                .update({ total_listings: (u.total_listings || 0) + 1 })
                .eq('clerk_id', userId)
                .then(() => {})
            }
          })
      })

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
