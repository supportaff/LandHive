// api/payu-webhook.js — POST /api/payu-webhook
// PayU IPN (Instant Payment Notification) — called server-to-server by PayU
//
// Env vars:
//   LH_PAYU_KEY   — PayU merchant key
//   LH_PAYU_SALT  — PayU merchant salt
//   LH_PAYU_ENV   — "true" = live | "false" = test

import crypto from 'crypto'
import { ObjectId } from 'mongodb'
import { Resend } from 'resend'
import { getDb } from './lib/db.js'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // ── Verify PayU reverse hash ───────────────────────────────────────────
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
      console.warn(`PayU webhook: hash mismatch for txnid=${txnid}. Possible tamper.`)
    }

    const db  = await getDb()
    const now = new Date()

    // ── Update payment record ─────────────────────────────────────────────
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

    // ── SUCCESS: unlock listing + notify ─────────────────────────────────
    if (status === 'success' && hashValid && udf1) {
      try {
        // Update listing: mark payment as paid, move to pending_kyc
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

        // Increment totalPaid on user profile
        if (udf2) {
          await db.collection('users').updateOne(
            { clerkId: udf2 },
            {
              $inc: { totalPaid: parseFloat(amount) },
              $set: { updatedAt: now },
            }
          )
        }

        // ── Payment receipt email to seller ──────────────────────────────
        await resend.emails.send({
          from: `LandHive <${process.env.RESEND_FROM_EMAIL || 'hello@landhive.in'}>`,
          to:   [email],
          subject: `\u2705 Payment Confirmed \u2014 \u20B9${parseFloat(amount).toLocaleString('en-IN')} received`,
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#16a34a;padding:24px;border-radius:16px 16px 0 0;text-align:center">
                <h1 style="color:white;margin:0">LandHive \uD83C\uDF3F</h1>
                ${!isLive ? '<p style="color:#fde047;margin:6px 0 0;font-size:12px">[TEST MODE]</p>' : ''}
              </div>
              <div style="background:white;border:1px solid #e2e8f0;padding:32px;border-radius:0 0 16px 16px">
                <h2 style="color:#15803d;margin-top:0">\u2705 Payment Successful!</h2>
                <p style="color:#64748b">Hi ${firstname},</p>
                <p style="color:#64748b">We received your listing fee of
                  <strong style="color:#1e293b">\u20B9${parseFloat(amount).toLocaleString('en-IN')}</strong>.
                </p>
                <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0">
                  <p style="margin:0 0 12px;font-weight:700;color:#15803d">\uD83D\uDCCB Payment Receipt</p>
                  <table style="width:100%;font-size:13px;color:#374151;border-collapse:collapse">
                    <tr><td style="padding:5px 0;color:#6b7280">Transaction ID</td>
                        <td style="text-align:right;font-weight:600">${txnid}</td></tr>
                    <tr><td style="padding:5px 0;color:#6b7280">PayU Payment ID</td>
                        <td style="text-align:right;font-weight:600">${mihpayid}</td></tr>
                    <tr><td style="padding:5px 0;color:#6b7280">Amount Paid</td>
                        <td style="text-align:right;font-weight:700;color:#15803d">\u20B9${parseFloat(amount).toLocaleString('en-IN')}</td></tr>
                    <tr><td style="padding:5px 0;color:#6b7280">Payment Mode</td>
                        <td style="text-align:right">${paymentMode || 'Online'}</td></tr>
                    ${bank_ref_num
                      ? `<tr><td style="padding:5px 0;color:#6b7280">Bank Ref No.</td>
                             <td style="text-align:right">${bank_ref_num}</td></tr>`
                      : ''}
                    <tr><td style="padding:5px 0;color:#6b7280">Listing Ref</td>
                        <td style="text-align:right;font-size:11px">${udf1}</td></tr>
                    <tr><td style="padding:5px 0;color:#6b7280">Environment</td>
                        <td style="text-align:right">${isLive ? 'Live' : 'Test'}</td></tr>
                  </table>
                </div>
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px">
                  <p style="margin:0;color:#92400e">
                    \u23F3 Your listing will go <strong>live within 24\u201348 hours</strong> after KYC verification.
                  </p>
                </div>
                <p style="color:#64748b;font-size:13px;margin-top:20px">
                  Keep this email as your payment receipt.
                  Questions? <a href="mailto:hello@landhive.in" style="color:#16a34a">hello@landhive.in</a>
                </p>
              </div>
            </div>`,
        }).catch(e => console.error('Receipt email failed:', e))

        // Admin notification
        await resend.emails.send({
          from: `LandHive System <${process.env.RESEND_FROM_EMAIL || 'hello@landhive.in'}>`,
          to:   ['admin@landhive.in'],
          subject: `[Admin]${!isLive ? ' [TEST]' : ''} Payment \u20B9${amount} — Listing ${udf1} → pending KYC`,
          html: `
            <p>Payment confirmed${!isLive ? ' <strong>(TEST MODE)</strong>' : ''}:</p>
            <ul>
              <li><strong>Txn ID:</strong> ${txnid}</li>
              <li><strong>PayU ID:</strong> ${mihpayid}</li>
              <li><strong>Amount:</strong> \u20B9${amount}</li>
              <li><strong>Seller:</strong> ${firstname} (${email})</li>
              <li><strong>Listing ID:</strong> ${udf1}</li>
              <li><strong>Mode:</strong> ${paymentMode || 'N/A'}</li>
              ${bank_ref_num ? `<li><strong>Bank Ref:</strong> ${bank_ref_num}</li>` : ''}
              <li><strong>Hash Valid:</strong> ${hashValid}</li>
              <li><strong>Environment:</strong> ${isLive ? 'LIVE' : 'TEST'}</li>
            </ul>
            <p><a href="https://landhive.in/admin">Review KYC in Admin Panel \u2192</a></p>`,
        }).catch(e => console.error('Admin email failed:', e))

      } catch (updateErr) {
        console.error('Post-payment update error:', updateErr)
      }
    }

    // ── FAILURE: reset listing to pending ─────────────────────────────────
    if (status === 'failure' && udf1) {
      await db.collection('listings').updateOne(
        { _id: new ObjectId(udf1) },
        {
          $set: {
            'payment.status': 'failed',
            status:           'pending',
            updatedAt:        now,
          },
        }
      ).catch(e => console.error('Listing failure update error:', e))
    }

    return res.status(200).json({ received: true, hashValid, env: isLive ? 'live' : 'test' })
  } catch (error) {
    console.error('PayU webhook error:', error)
    return res.status(500).json({ error: 'Webhook processing failed' })
  }
}
