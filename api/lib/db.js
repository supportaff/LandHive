// api/lib/db.js — Singleton MongoDB connection for Vercel serverless
import { MongoClient } from 'mongodb'

const uri = process.env.LH_MONGODB_URI
if (!uri) throw new Error('LH_MONGODB_URI env var is not set')

let _client
let _clientPromise

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    _client = new MongoClient(uri)
    global._mongoClientPromise = _client.connect()
  }
  _clientPromise = global._mongoClientPromise
} else {
  _client = new MongoClient(uri, { maxPoolSize: 10 })
  _clientPromise = _client.connect()
}

/**
 * Returns a connected MongoDB database instance.
 * @param {string} dbName - defaults to 'landhive'
 */
export async function getDb(dbName = 'landhive') {
  await _clientPromise
  return _client.db(dbName)
}

/**
 * MongoDB Collections used across LandHive:
 *
 * landhive.listings      — property listings
 * landhive.payments      — PayU payment transactions
 * landhive.users         — extended user profiles (linked to Clerk)
 * landhive.inquiries     — buyer inquiries to sellers
 *
 * See schema reference in /docs/db-schema.md
 */
