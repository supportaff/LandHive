// api/payu-webhook.js — POST /api/payu-webhook
// PayU IPN handler — called server-to-server by PayU after every payment
import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { getDb } from './lib/db.js'
import { mail } from './lib/mailer.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const SALT   = process.env.LH_PAYU_SALT
    const KEY    = process.env.LH_PAYU_KEY
    const isLive = process.env.LH_PAYU_ENV === 'true'

    if (!SALT || !KEY) {
      console.error('PayU webhook: LH_PAYU_KEY or LH_PAYU_SALT not set')
      return res.status(500).json({ error: 'PayU not configured' })
    }

    const body = req.body
    const {
      txnid, mihpayid, status, amount,
      productinfo, firstname, email, phone,
      udf1, udf2,
      paymentMode, bankCode, bank_ref_num,
      cardnum, name_on_card, issuing_bank,
      error_code, error_Message,
      hash: responseHash,
    } = body

    // ── Verify PayU reverse hash ─────────────────────────────────────────────
    // SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|KEY
    const reverseStr = [
      SALT, status,
      '', '', '', '',
      body.udf5 || '', body.udf4 || '', body.udf3 || '',
      udf2 || '', udf1 || '',
      email, firstname, productinfo, amount, txnid,
      KEY,
    ].join('|')
    const computedHash = crypto.createHash('sha512').update(reverseStr).digest('hex')
    const hashValid    = (computedHash === responseHash)

    if (!hashValid) {
      console.warn(`[webhook] Hash mismatch for txnid=${txnid} — possible tamper attempt`)
    }

    const db  = await getDb()
    const now = new Date()

    // ── Update payment record ────────────────────────────────────────────────
    await db.collection('payments').updateOne(
      { txnid },
      {
        $set: {
          mihpayid:     mihpayid     || null,
          status,
          paymentMode:  paymentMode  || null,
          bankCode:     bankCode     || null,
          bankRefNum:   bank_ref_num || null,
          cardNum:      cardnum ? cardnum.replace(/\d(?=\d{4})/g, '*') : null,
          nameOnCard:   name_on_card || null,
          issuingBank:  issuing_bank || null,
          errorCode:    error_code   || null,
          errorMessage: error_Message || null,
          responseHash: responseHash || null,
          hashValid,
          mode:         isLive ? 'live' : 'test',
          rawResponse:  body,
          completedAt:  now,
          updatedAt:    now,
        },
      }
    )

    // ── SUCCESS ──────────────────────────────────────────────────────────────
    if (status === 'success' && hashValid && udf1) {
      try {
        await db.collection('listings').updateOne(
          { _id: new ObjectId(udf1) },
          {
            $set: {
              'payment.status':   'paid',
              'payment.txnid':    txnid,
              'payment.mihpayid': mihpayid,
              'payment.amount':   parseFloat(amount),
              'payment.mode':     paymentMode || 'online',
              'payment.paidAt':   now,
              status:             'pending_kyc',
              updatedAt:          now,
            },
          }
        )

        if (udf2) {
          await db.collection('users').updateOne(
            { clerkId: udf2 },
            { $inc: { totalPaid: parseFloat(amount) }, $set: { updatedAt: now } }
          )
        }

        // Fire both emails in parallel, non-blocking
        await Promise.allSettled([
          mail.paymentConfirmed(email, {
            name: firstname, amount, txnid, mihpayid,
            paymentMode, bankRefNum: bank_ref_num,
            listingId: udf1, isLive,
          }),
          mail.adminPayment({
            txnid, mihpayid, amount, firstname, email,
            listingId: udf1, paymentMode,
            bankRefNum: bank_ref_num, hashValid, isLive,
          }),
        ])
      } catch (updateErr) {
        console.error('Post-payment update error:', updateErr)
      }
    }

    // ── FAILURE ──────────────────────────────────────────────────────────────
    if (status === 'failure' && udf1) {
      await db.collection('listings').updateOne(
        { _id: new ObjectId(udf1) },
        { $set: { 'payment.status': 'failed', status: 'pending', updatedAt: now } }
      ).catch(e => console.error('Listing failure update error:', e))
    }

    return res.status(200).json({ received: true, hashValid, env: isLive ? 'live' : 'test' })
  } catch (error) {
    console.error('PayU webhook error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
