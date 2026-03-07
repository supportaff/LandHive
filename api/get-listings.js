// api/get-listings.js — GET /api/get-listings
// Returns approved listings from Supabase with filter + pagination support
//
// Query params:
//   district, landType, maxPrice, minPrice
//   lat, lng, radius (km, default 50)
//   page (default 1), limit (default 20)
//   featured ("true" to return only featured)

import { getDb } from './lib/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const {
      district, landType, maxPrice, minPrice,
      lat, lng, radius,
      page  = '1',
      limit = '20',
      featured,
      state,
    } = req.query

    const supabase = getDb()
    let query = supabase
      .from('listings')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')

    // Filters
    if (state)    query = query.eq('location_state', state)
    if (district) query = query.eq('location_district', district)
    if (landType) query = query.eq('land_type', landType)
    if (featured === 'true') query = query.eq('featured', true)

    // Price range
    if (maxPrice) query = query.lte('price_total', parseFloat(maxPrice))
    if (minPrice) query = query.gte('price_total', parseFloat(minPrice))

    // Bounding box radius filter (no PostGIS needed for simple radius)
    if (lat && lng) {
      const km      = parseFloat(radius) || 50
      const latF    = parseFloat(lat)
      const lngF    = parseFloat(lng)
      const latDeg  = km / 111
      const lngDeg  = km / (111 * Math.cos(latF * Math.PI / 180))
      query = query
        .gte('location_lat', latF - latDeg)
        .lte('location_lat', latF + latDeg)
        .gte('location_lng', lngF - lngDeg)
        .lte('location_lng', lngF + lngDeg)
    }

    // Pagination
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const from     = (pageNum - 1) * limitNum
    const to       = from + limitNum - 1

    // Sort: featured first, then newest
    query = query
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })
      .range(from, to)

    const { data: listings, error, count } = await query

    if (error) throw error

    // Strip sensitive fields (KYC)
    const safeListings = (listings || []).map(l => {
      const { kyc_aadhaar_number, kyc_pan_number, kyc_aadhaar_name, seller_whatsapp, ...rest } = l
      return rest
    })

    return res.status(200).json({
      listings: safeListings,
      total:    count || 0,
      page:     pageNum,
      pages:    Math.ceil((count || 0) / limitNum),
    })
  } catch (error) {
    console.error('get-listings error:', error)
    return res.status(500).json({ error: 'Failed to fetch listings' })
  }
}
