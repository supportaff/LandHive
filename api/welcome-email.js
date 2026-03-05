// api/welcome-email.js — POST /api/welcome-email
// Called from frontend after Clerk sign-up to send welcome email
// and upsert user document in MongoDB
import { createClerkClient } from '@clerk/backend'
import { getDb } from './lib/db.js'
import { mail } from './lib/mailer.js'

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

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
    const { name, email, role = 'buyer' } = req.body

    const db = await getDb()

    // Upsert user (idempotent — safe to call multiple times)
    await db.collection('users').updateOne(
      { clerkId: userId },
      {
        $setOnInsert: { clerkId: userId, createdAt: new Date(), totalPaid: 0, totalListings: 0 },
        $set: { name, email, role, updatedAt: new Date() },
      },
      { upsert: true }
    )

    // Send welcome email (fire-and-forget)
    await mail.welcome(email, { name, role })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Welcome email error:', error)
    return res.status(500).json({ error: 'Failed' })
  }
}
