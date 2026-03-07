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
    const supabase = getDb()
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        txnid, mihpayid, status, amount,
        productinfo, payment_mode, bank_ref_num,
        listing_id, error_code, error_message,
        created_at, completed_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return res.status(200).json({ payments: payments || [] })
  } catch (error) {
    console.error('Payments fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch payments' })
  }
}
