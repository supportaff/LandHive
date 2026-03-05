// api/payments.js — GET /api/payments
// Returns payment history for the authenticated user
import { createClerkClient } from '@clerk/backend'
import { getDb } from './lib/db.js'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const sessionToken = req.headers.authorization?.replace('Bearer ', '')
  if (!sessionToken) return res.status(401).json({ error: 'Unauthorized' })

  let userId
  try {
    const session = await clerk.sessions.verifySession(sessionToken, sessionToken)
    userId = session.userId
  } catch {
    return res.status(401).json({ error: 'Invalid session' })
  }

  try {
    const db = await getDb()
    const payments = await db.collection('payments')
      .find(
        { userId },
        {
          projection: {
            txnid: 1, mihpayid: 1, status: 1, amount: 1, currency: 1,
            productinfo: 1, paymentMode: 1, bankRefNum: 1,
            listingId: 1, errorCode: 1, errorMessage: 1,
            initiatedAt: 1, completedAt: 1, createdAt: 1,
            // Exclude sensitive fields from client
            rawResponse: 0, payuHash: 0, responseHash: 0, hashValid: 0,
          },
        }
      )
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return res.status(200).json({ payments })
  } catch (error) {
    console.error('Payments fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch payments' })
  }
}
