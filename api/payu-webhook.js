// api/payu-webhook.js — POST /api/payu-webhook
// PayU IPN handler — called server-to-server by PayU after every payment
import crypto from 'crypto'
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

    const supabase = getDb()
    const now = new Date().toISOString()

    // ── Update payment record ────────────────────────────────────────────────
    await supabase
      .from('payments')
      .update({
        mihpayid:      mihpayid     || null,
        status,
        payment_mode:  paymentMode  || null,
        bank_code:     bankCode     || null,
        bank_ref_num:  bank_ref_num || null,
        card_num:      cardnum ? cardnum.replace(/\d(?=\d{4})/g, '*') : null,
        name_on_card:  name_on_card || null,
        issuing_bank:  issuing_bank || null,
        error_code:    error_code   || null,
        error_message: error_Message || null,
        response_hash: responseHash || null,
        hash_valid:    hashValid,
        mode:          isLive ? 'live' : 'test',
        raw_response:  body,
        completed_at:  now,
      })
      .eq('txnid', txnid)

    // ── SUCCESS ──────────────────────────────────────────────────────────────
    if (status === 'success' && hashValid && udf1) {
      try {
        await supabase
          .from('listings')
          .update({
            payment_status:   'paid',
            payment_txnid:    txnid,
            payment_mihpayid: mihpayid,
            payment_amount:   parseFloat(amount),
            payment_mode:     paymentMode || 'online',
            payment_paid_at:  now,
            status:           'pending_kyc',
          })
          .eq('id', udf1)

        if (udf2) {
          // Increment total_paid for user
          const { data: user } = await supabase
            .from('users')
            .select('total_paid')
            .eq('clerk_id', udf2)
            .single()

          if (user) {
            await supabase
              .from('users')
              .update({ total_paid: (user.total_paid || 0) + parseFloat(amount) })
              .eq('clerk_id', udf2)
          }
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
      await supabase
        .from('listings')
        .update({ payment_status: 'failed', status: 'pending' })
        .eq('id', udf1)
        .catch(e => console.error('Listing failure update error:', e))
    }

    return res.status(200).json({ received: true, hashValid, env: isLive ? 'live' : 'test' })
  } catch (error) {
    console.error('PayU webhook error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
