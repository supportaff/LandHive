// api/get-listings.js — GET /api/get-listings
// Returns approved listings from MongoDB with filter + pagination support
//
// Query params:
//   district, landType, maxPrice, minPrice
//   lat, lng, radius (km, default 50)
//   page (default 1), limit (default 20)
//   featured ("true" to return only featured)

import { getDb } from './lib/db.js'

// Fields to strip from public listing response
const SAFE_PROJECTION = {
  'kyc.aadhaarNumber':  0,
  'kyc.panNumber':      0,
  'seller.whatsapp':    0,
  'kyc.aadhaarName':    0,
}

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

    // Only show approved listings publicly
    const filter = { status: 'approved' }

    if (state)    filter['location.state']    = state
    if (district) filter['location.district'] = district
    if (landType) filter.landType             = landType
    if (featured === 'true') filter.featured  = true

    // Price range
    if (maxPrice || minPrice) {
      filter['price.total'] = {}
      if (maxPrice) filter['price.total'].$lte = parseFloat(maxPrice)
      if (minPrice) filter['price.total'].$gte = parseFloat(minPrice)
    }

    // Bounding box radius filter (no 2dsphere index needed)
    if (lat && lng) {
      const km      = parseFloat(radius) || 50
      const latF    = parseFloat(lat)
      const lngF    = parseFloat(lng)
      const latDeg  = km / 111
      const lngDeg  = km / (111 * Math.cos(latF * Math.PI / 180))
      filter['location.lat'] = { $gte: latF - latDeg, $lte: latF + latDeg }
      filter['location.lng'] = { $gte: lngF - lngDeg, $lte: lngF + lngDeg }
    }

    const db       = await getDb()
    const pageNum  = Math.max(1, parseInt(page))
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)))
    const skip     = (pageNum - 1) * limitNum

    const [listings, total] = await Promise.all([
      db.collection('listings')
        .find(filter, { projection: SAFE_PROJECTION })
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('listings').countDocuments(filter),
    ])

    return res.status(200).json({
      listings: listings.map(l => ({ ...l, _id: l._id.toString() })),
      total,
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
    })
  } catch (error) {
    console.error('get-listings error:', error)
    return res.status(500).json({ error: 'Failed to fetch listings' })
  }
}
