// api/lib/db.js — MongoDB Atlas connection for LandHive on Vercel
//
// Uses Vercel's attachDatabasePool() for proper connection lifecycle:
// — Gracefully suspends/resumes the client during Vercel Fluid Compute
// — Prevents connection leaks on serverless cold starts
//
// Env var: LH_MONGODB_URI
// Format:  mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?retryWrites=true&w=majority

import { MongoClient } from 'mongodb'
import { attachDatabasePool } from '@vercel/functions'

const uri = process.env.LH_MONGODB_URI
if (!uri) throw new Error('\u274C LH_MONGODB_URI is not set in environment variables')

const options = {
  appName:       'landhive.vercel',  // shows in Atlas monitoring
  maxIdleTimeMS: 5000,               // close idle connections after 5s (Vercel serverless friendly)
  maxPoolSize:   10,                 // max concurrent connections per function instance
  serverSelectionTimeoutMS: 5000,    // fail fast if Atlas is unreachable
  socketTimeoutMS: 45000,
}

const client = new MongoClient(uri, options)

// Register with Vercel — automatically calls client.close() on function
// suspension and allows reconnect on resume (Fluid Compute support)
attachDatabasePool(client)

/**
 * Returns a connected MongoDB database instance.
 * client.connect() is idempotent in MongoDB driver v6:
 *   — No-op if already connected
 *   — Reconnects automatically after a close (Vercel suspend/resume)
 *
 * @param {string} dbName — defaults to 'landhive'
 * @returns {Promise<import('mongodb').Db>}
 */
export async function getDb(dbName = 'landhive') {
  await client.connect()
  return client.db(dbName)
}

/**
 * MongoDB Collections used in LandHive:
 *
 *  landhive.listings    — property listings (status: pending|pending_kyc|approved|rejected)
 *  landhive.payments    — PayU transactions (mirrored from webhook)
 *  landhive.users       — extended Clerk user profiles + roles
 *  landhive.inquiries   — buyer inquiries to sellers
 *
 * Indexes to create in Atlas:
 *  listings: { status:1, 'location.district':1, landType:1, 'price.total':1, createdAt:-1 }
 *  listings: { 'location.lat':1, 'location.lng':1 } — for geo filtering
 *  users:    { clerkId:1 } unique
 *  payments: { txnid:1  } unique
 */

export default client
