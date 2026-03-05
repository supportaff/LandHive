// api/get-listing.js — GET /api/get-listing?id=<listingId>
// Returns a single approved listing by MongoDB _id
// Also increments viewCount

import { ObjectId } from 'mongodb'
import { getDb } from './lib/db.js'

const SAFE_PROJECTION = {
  'kyc.aadhaarNumber': 0,
  'kyc.panNumber':     0,
  'kyc.aadhaarName':   0,
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const { id } = req.query
  if (!id) return res.status(400).json({ error: 'Listing ID is required' })

  // Validate ObjectId format
  if (!ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid listing ID' })

  try {
    const db = await getDb()

    const listing = await db.collection('listings').findOneAndUpdate(
      { _id: new ObjectId(id), status: 'approved' },
      { $inc: { viewCount: 1 }, $set: { updatedAt: new Date() } },
      { projection: SAFE_PROJECTION, returnDocument: 'after' }
    )

    if (!listing) return res.status(404).json({ error: 'Listing not found' })

    return res.status(200).json({
      listing: { ...listing, _id: listing._id.toString() },
    })
  } catch (error) {
    console.error('get-listing error:', error)
    return res.status(500).json({ error: 'Failed to fetch listing' })
  }
}
