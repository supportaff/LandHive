// api/get-listing.js — GET /api/get-listing?id=<listingId>
// Returns a single approved listing by UUID
// Also increments view_count

import { getDb } from './lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Listing ID is required' })

  try {
    const supabase = getDb()

    // Fetch listing
    const { data: listing, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('status', 'approved')
      .single()

    if (error || !listing) return res.status(404).json({ error: 'Listing not found' })

    // Increment view count (fire and forget, don't block response)
    supabase
      .from('listings')
      .update({ view_count: (listing.view_count || 0) + 1 })
      .eq('id', id)
      .then(() => {})

    // Strip sensitive KYC fields
    const { kyc_aadhaar_number, kyc_pan_number, kyc_aadhaar_name, ...safeListing } = listing

    return res.status(200).json({ listing: safeListing })
  } catch (error) {
    console.error('get-listing error:', error)
    return res.status(500).json({ error: 'Failed to fetch listing' })
  }
}
