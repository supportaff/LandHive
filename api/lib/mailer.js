// api/lib/mailer.js
// Centralised Resend email module for LandHive
// All transactional emails live here — import sendMail() and use a template key.
//
// Env vars required:
//   RESEND_API_KEY      — Resend API key
//   RESEND_FROM_EMAIL   — sender address  (default: hello@landhive.in)
//   ADMIN_EMAIL         — admin inbox     (default: admin@landhive.in)
//   APP_URL             — base URL        (default: https://landhive.in)

import { Resend } from 'resend'

const resend   = new Resend(process.env.RESEND_API_KEY)
const FROM     = process.env.RESEND_FROM_EMAIL || 'hello@landhive.in'
const FROM_SYS = `LandHive <${FROM}>`
const ADMIN    = process.env.ADMIN_EMAIL       || 'admin@landhive.in'
const APP_URL  = process.env.APP_URL           || 'https://landhive.in'

// ─── Shared HTML primitives ────────────────────────────────────────────────
const wrap = (body, testMode = false) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>LandHive</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#15803d,#16a34a);padding:28px 32px;border-radius:16px 16px 0 0;text-align:center">
            <p style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px">
              &#127807; LandHive
            </p>
            <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.6);letter-spacing:2px;text-transform:uppercase">
              Tamil Nadu&apos;s Land Marketplace
            </p>
            ${testMode ? '<p style="margin:8px 0 0;background:#fde047;color:#78350f;font-size:11px;font-weight:700;padding:4px 12px;border-radius:999px;display:inline-block">TEST MODE</p>' : ''}
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#fff;padding:36px 32px;border-radius:0 0 16px 16px;border:1px solid #e2e8f0;border-top:none">
            ${body}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 0;text-align:center">
            <p style="margin:0;font-size:12px;color:#94a3b8">
              &copy; 2026 LandHive &nbsp;&bull;&nbsp;
              <a href="${APP_URL}/terms"   style="color:#64748b">Terms</a> &nbsp;&bull;&nbsp;
              <a href="${APP_URL}/refund"  style="color:#64748b">Refund Policy</a> &nbsp;&bull;&nbsp;
              <a href="${APP_URL}/privacy" style="color:#64748b">Privacy</a>
            </p>
            <p style="margin:6px 0 0;font-size:11px;color:#cbd5e1">LandHive, Tamil Nadu, India</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

const h2 = (text, color = '#15803d') =>
  `<h2 style="margin:0 0 16px;font-size:22px;font-weight:700;color:${color}">${text}</h2>`

const para = (text) =>
  `<p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.6">${text}</p>`

const card = (title, rows, bg = '#f0fdf4', border = '#bbf7d0', titleColor = '#15803d') => `
  <div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:20px;margin:20px 0">
    <p style="margin:0 0 14px;font-weight:700;font-size:14px;color:${titleColor}">${title}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#374151">
      ${rows.map(([label, value]) => `
        <tr>
          <td style="padding:5px 0;color:#6b7280;width:45%">${label}</td>
          <td style="padding:5px 0;font-weight:600;text-align:right">${value ?? '—'}</td>
        </tr>`).join('')}
    </table>
  </div>`

const alert = (text, bg = '#fffbeb', border = '#fde68a', color = '#92400e') =>
  `<div style="background:${bg};border:1px solid ${border};border-radius:12px;padding:16px;margin:16px 0">
    <p style="margin:0;font-size:13px;color:${color}">${text}</p>
  </div>`

const btn = (label, url, bg = '#16a34a') =>
  `<div style="text-align:center;margin:24px 0">
    <a href="${url}" style="display:inline-block;background:${bg};color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:12px;text-decoration:none">${label}</a>
  </div>`

const greeting = (name) => para(`Hi <strong>${name}</strong>,`)

const sign = () => para(
  `Regards,<br/><strong>Team LandHive</strong> &nbsp;&#8231;&nbsp;
  <a href="mailto:${FROM}" style="color:#16a34a">${FROM}</a>`
)

// ─── Templates ─────────────────────────────────────────────────────────────

/**
 * 1. Listing submitted — sent to seller after form submission (pre-payment)
 */
export function tplListingSubmitted({ name, title, listingId, district, areaValue, areaUnit, price, listingFee }) {
  return wrap(`
    ${h2('&#x1F4CB; Listing Submitted!')}
    ${greeting(name)}
    ${para(`Your listing <strong>"${title}"</strong> has been received and is awaiting payment.`)}
    ${card('&#x1F4CC; Listing Details', [
      ['Listing ID',   listingId],
      ['District',     `${district}, Tamil Nadu`],
      ['Area',         `${areaValue} ${areaUnit}`],
      ['Price',        `&#8377;${Number(price / 100000).toFixed(1)}L`],
      ['Listing Fee',  `&#8377;${Number(listingFee).toLocaleString('en-IN')}`],
    ])}
    ${alert('&#9888;&#65039; <strong>Next step:</strong> Complete payment of &#8377;' + Number(listingFee).toLocaleString('en-IN') + ' in your dashboard to activate your listing.')}
    ${btn('Go to Dashboard', `${APP_URL}/dashboard/seller`)}
    ${sign()}
  `)
}

/**
 * 2. Payment confirmed — receipt email to seller after PayU success
 */
export function tplPaymentConfirmed({ name, amount, txnid, mihpayid, paymentMode, bankRefNum, listingId, isLive = true }) {
  return wrap(`
    ${h2('&#x2705; Payment Confirmed!')}
    ${greeting(name)}
    ${para(`We received your listing fee of <strong style="color:#15803d">&#8377;${Number(amount).toLocaleString('en-IN')}</strong>. Your listing is now under KYC review.`)}
    ${card('&#x1F9FE; Payment Receipt', [
      ['Transaction ID',   txnid],
      ['PayU Payment ID',  mihpayid],
      ['Amount Paid',      `&#8377;${Number(amount).toLocaleString('en-IN')}`],
      ['Payment Mode',     paymentMode || 'Online'],
      bankRefNum ? ['Bank Ref No.', bankRefNum] : null,
      ['Listing Ref',      listingId],
      ['Environment',      isLive ? 'Live' : 'Test'],
    ].filter(Boolean))}
    ${alert('&#x23F3; Your listing will go <strong>live within 24–48 hours</strong> after KYC verification.')}
    ${btn('View Listing Status', `${APP_URL}/dashboard/seller`)}
    ${para('<small>Keep this email as your payment receipt.</small>')}
    ${sign()}
  `, !isLive)
}

/**
 * 3. KYC Approved — sent to seller when admin marks KYC as verified
 */
export function tplKycApproved({ name, title, listingId }) {
  return wrap(`
    ${h2('&#x2705; KYC Verified!')}
    ${greeting(name)}
    ${para(`Great news! Your KYC has been verified for the listing <strong>"${title}"</strong>.`)}
    ${alert(
      '&#x1F7E2; Your listing is now <strong>live on LandHive</strong> and visible to buyers across Tamil Nadu.',
      '#f0fdf4', '#bbf7d0', '#166534'
    )}
    ${card('&#x1F4CC; Next Steps', [
      ['Status',         'Live &#x1F7E2;'],
      ['Listing ID',     listingId],
      ['Valid for',      '90 days from today'],
      ['Inquiries',      'WhatsApp alerts enabled'],
    ])}
    ${btn('View Your Live Listing', `${APP_URL}/listing/${listingId}`)}
    ${sign()}
  `)
}

/**
 * 4. KYC Rejected — sent to seller with reason
 */
export function tplKycRejected({ name, title, reason }) {
  return wrap(`
    ${h2('&#x274C; KYC Verification Failed', '#dc2626')}
    ${greeting(name)}
    ${para(`Unfortunately, your KYC for listing <strong>"${title}"</strong> could not be verified.`)}
    ${card('&#x1F6AB; Rejection Reason', [
      ['Reason', reason || 'Documents unclear or mismatch'],
    ], '#fef2f2', '#fecaca', '#dc2626')}
    ${alert('&#x1F4DE; Please contact us at <a href="mailto:${FROM}" style="color:#16a34a">${FROM}</a> to resubmit correct documents.')}
    ${btn('Contact Support', `mailto:${FROM}`, '#dc2626')}
    ${sign()}
  `)
}

/**
 * 5. Listing approved & live
 */
export function tplListingApproved({ name, title, listingId, district, expiresAt }) {
  return wrap(`
    ${h2('&#x1F389; Your Listing is Live!')}
    ${greeting(name)}
    ${para(`Your listing <strong>"${title}"</strong> is now live on LandHive and visible to thousands of buyers across Tamil Nadu!`)}
    ${card('&#x1F4CC; Listing Details', [
      ['Listing ID',   listingId],
      ['District',     `${district}, Tamil Nadu`],
      ['Status',       'Live &#x1F7E2;'],
      ['Expires On',   expiresAt ? new Date(expiresAt).toLocaleDateString('en-IN') : 'In 90 days'],
    ])}
    ${alert(
      '&#x1F4F2; You will receive a WhatsApp alert for every buyer inquiry.',
      '#f0fdf4', '#bbf7d0', '#166534'
    )}
    ${btn('View Live Listing', `${APP_URL}/listing/${listingId}`)}
    ${sign()}
  `)
}

/**
 * 6. Listing rejected by admin
 */
export function tplListingRejected({ name, title, reason }) {
  return wrap(`
    ${h2('&#x1F4CB; Listing Not Approved', '#dc2626')}
    ${greeting(name)}
    ${para(`Your listing <strong>"${title}"</strong> could not be approved at this time.`)}
    ${card('&#x274C; Reason', [
      ['Reason', reason || 'Does not meet listing guidelines'],
    ], '#fef2f2', '#fecaca', '#dc2626')}
    ${alert('Questions? Email us at <a href="mailto:${FROM}" style="color:#16a34a">${FROM}</a> and we will help you resubmit.')}
    ${btn('Contact Support', `mailto:${FROM}`, '#64748b')}
    ${sign()}
  `)
}

/**
 * 7. New inquiry — to seller when a buyer sends inquiry
 */
export function tplNewInquiry({ sellerName, listingTitle, listingId, buyerName, buyerPhone, buyerEmail, message }) {
  return wrap(`
    ${h2('&#x1F514; New Buyer Inquiry!')}
    ${greeting(sellerName)}
    ${para(`A buyer is interested in your listing <strong>"${listingTitle}"</strong>.`)}
    ${card('&#x1F464; Buyer Details', [
      ['Name',    buyerName],
      ['Phone',   `<a href="tel:${buyerPhone}" style="color:#16a34a">${buyerPhone}</a>`],
      ['Email',   `<a href="mailto:${buyerEmail}" style="color:#16a34a">${buyerEmail}</a>`],
      ['Message', message || 'Interested in this property'],
    ])}
    ${btn(`WhatsApp ${buyerName}`, `https://wa.me/${buyerPhone?.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(buyerName)}%2C%20I%20am%20${encodeURIComponent(sellerName)}%20from%20LandHive%20regarding%20your%20inquiry%20on%20${encodeURIComponent(listingTitle)}`)}
    ${btn('View Listing', `${APP_URL}/listing/${listingId}`, '#475569')}
    ${sign()}
  `)
}

/**
 * 8. Inquiry confirmation — to buyer after they submit inquiry
 */
export function tplInquiryConfirmation({ buyerName, listingTitle, listingId, district, sellerPhone }) {
  return wrap(`
    ${h2('&#x2705; Inquiry Sent!')}
    ${greeting(buyerName)}
    ${para(`Your inquiry for <strong>"${listingTitle}"</strong> has been sent to the seller. They will contact you shortly.`)}
    ${card('&#x1F4CC; Inquiry Details', [
      ['Property',   listingTitle],
      ['Location',   `${district}, Tamil Nadu`],
      ['Status',     'Sent to seller'],
    ])}
    ${alert('&#x1F4F2; The seller may reach out via <strong>phone or WhatsApp</strong>. Keep your phone handy.')}
    ${btn('View Listing', `${APP_URL}/listing/${listingId}`)}
    ${sign()}
  `)
}

/**
 * 9. Welcome email — sent when a new user registers
 */
export function tplWelcome({ name, role = 'buyer' }) {
  const isSeller = role === 'seller'
  return wrap(`
    ${h2(`&#x1F44B; Welcome to LandHive, ${name}!`)}
    ${para(`You&apos;ve joined Tamil Nadu&apos;s most trusted land marketplace. Here&apos;s what you can do as a <strong>${role}</strong>:`)}
    ${isSeller
      ? card('&#x1F3E1; As a Seller', [
          ['List a Property', 'Post verified land for &#8377;2,499+'],
          ['Reach Buyers',    '20,000+ active buyers'],
          ['Go Live',         'Within 24–48hrs after KYC'],
          ['Get Alerts',      'WhatsApp inquiry notifications'],
        ])
      : card('&#x1F50E; As a Buyer', [
          ['Search Listings',  '6,200+ verified properties'],
          ['All 38 Districts', 'Tamil Nadu wide coverage'],
          ['Google Maps',      'See all listings on map'],
          ['Direct Contact',   'Connect with sellers directly'],
        ])
    }
    ${btn(isSeller ? 'Post Your First Listing' : 'Browse Listings', isSeller ? `${APP_URL}/post` : `${APP_URL}/search`)}
    ${sign()}
  `)
}

// ─── Admin notification templates (plain HTML, no need for full wrap) ──────

export function tplAdminNewListing({ listingId, title, sellerName, sellerPhone, sellerEmail, district, price, listingFee }) {
  return `
    <p style="font-family:system-ui;font-size:14px;color:#374151">New listing submitted and awaiting payment:</p>
    <table style="font-size:13px;color:#374151;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Listing ID</td><td><strong>${listingId}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Title</td><td>${title}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Seller</td><td>${sellerName} &bull; ${sellerPhone}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Email</td><td>${sellerEmail}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">District</td><td>${district}, Tamil Nadu</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Price</td><td>&#8377;${(price / 100000).toFixed(1)}L</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Listing Fee</td><td>&#8377;${Number(listingFee).toLocaleString('en-IN')}</td></tr>
    </table>
    <p><a href="${APP_URL}/admin" style="color:#16a34a;font-weight:bold">Review in Admin Panel &rarr;</a></p>`
}

export function tplAdminPayment({ txnid, mihpayid, amount, firstname, email, listingId, paymentMode, bankRefNum, hashValid, isLive }) {
  return `
    <p style="font-family:system-ui;font-size:14px;color:#374151">
      Payment confirmed${!isLive ? ' <strong style="color:#d97706">(TEST MODE)</strong>' : ''}:
    </p>
    <table style="font-size:13px;color:#374151;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Txn ID</td><td><strong>${txnid}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">PayU ID</td><td>${mihpayid}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Amount</td><td><strong>&#8377;${amount}</strong></td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Seller</td><td>${firstname} &bull; ${email}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Listing ID</td><td>${listingId}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Mode</td><td>${paymentMode || 'N/A'}</td></tr>
      ${bankRefNum ? `<tr><td style="padding:4px 12px 4px 0;color:#6b7280">Bank Ref</td><td>${bankRefNum}</td></tr>` : ''}
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Hash Valid</td><td>${hashValid ? '&#x2705; Yes' : '&#x26A0;&#xFE0F; NO — investigate!'}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Environment</td><td>${isLive ? 'LIVE' : 'TEST'}</td></tr>
    </table>
    <p><a href="${APP_URL}/admin" style="color:#16a34a;font-weight:bold">Review KYC in Admin Panel &rarr;</a></p>`
}

export function tplAdminInquiry({ listingTitle, listingId, buyerName, buyerEmail, buyerPhone, sellerName, message }) {
  return `
    <p style="font-family:system-ui;font-size:14px;color:#374151">New buyer inquiry received:</p>
    <table style="font-size:13px;color:#374151;border-collapse:collapse">
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Listing</td><td>${listingTitle}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Listing ID</td><td>${listingId}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Seller</td><td>${sellerName}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Buyer</td><td>${buyerName} &bull; ${buyerPhone}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Buyer Email</td><td>${buyerEmail}</td></tr>
      <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Message</td><td>${message || 'No message'}</td></tr>
    </table>`
}

// ─── Core send function ─────────────────────────────────────────────────────

/**
 * sendMail({ to, subject, html, replyTo? })
 * Thin wrapper around Resend — always non-throwing (logs on failure).
 */
export async function sendMail({ to, subject, html, replyTo, from = FROM_SYS }) {
  try {
    const payload = { from, to: Array.isArray(to) ? to : [to], subject, html }
    if (replyTo) payload.replyTo = replyTo
    const result = await resend.emails.send(payload)
    return { ok: true, id: result.id }
  } catch (err) {
    console.error(`[mailer] Failed to send "${subject}" to ${to}:`, err?.message)
    return { ok: false, error: err?.message }
  }
}

/**
 * Convenience helpers — one call per email event
 */

export const mail = {
  /** Seller: listing submitted, awaiting payment */
  listingSubmitted: (to, data) => sendMail({
    to, subject: `&#x1F4CB; LandHive — Listing submitted: ${data.title}`,
    html: tplListingSubmitted(data),
  }),

  /** Seller: payment received */
  paymentConfirmed: (to, data) => sendMail({
    to, subject: `&#x2705; LandHive — Payment confirmed &#8377;${Number(data.amount).toLocaleString('en-IN')}`,
    html: tplPaymentConfirmed(data),
  }),

  /** Seller: KYC verified */
  kycApproved: (to, data) => sendMail({
    to, subject: `&#x2705; LandHive — KYC Verified, listing is live!`,
    html: tplKycApproved(data),
  }),

  /** Seller: KYC rejected */
  kycRejected: (to, data) => sendMail({
    to, subject: `&#x274C; LandHive — KYC Verification Failed`,
    html: tplKycRejected(data),
  }),

  /** Seller: listing approved and live */
  listingApproved: (to, data) => sendMail({
    to, subject: `&#x1F389; LandHive — Your listing is live: ${data.title}`,
    html: tplListingApproved(data),
  }),

  /** Seller: listing rejected by admin */
  listingRejected: (to, data) => sendMail({
    to, subject: `&#x1F4CB; LandHive — Listing not approved`,
    html: tplListingRejected(data),
  }),

  /** Seller: new buyer inquiry */
  newInquiry: (to, data) => sendMail({
    to, subject: `&#x1F514; LandHive — New inquiry on "${data.listingTitle}"`,
    html: tplNewInquiry(data),
  }),

  /** Buyer: inquiry confirmation */
  inquiryConfirmation: (to, data) => sendMail({
    to, subject: `&#x2705; LandHive — Inquiry sent for "${data.listingTitle}"`,
    html: tplInquiryConfirmation(data),
  }),

  /** User: welcome on signup */
  welcome: (to, data) => sendMail({
    to, subject: `&#x1F44B; Welcome to LandHive, ${data.name}!`,
    html: tplWelcome(data),
  }),

  /** Admin: new listing submitted */
  adminNewListing: (data) => sendMail({
    to: ADMIN,
    subject: `[Admin] New listing pending payment: ${data.title}`,
    html: tplAdminNewListing(data),
    from: `LandHive System <${FROM}>`,
  }),

  /** Admin: payment received */
  adminPayment: (data) => sendMail({
    to: ADMIN,
    subject: `[Admin]${!data.isLive ? ' [TEST]' : ''} Payment &#8377;${data.amount} — Listing ${data.listingId} → pending KYC`,
    html: tplAdminPayment(data),
    from: `LandHive System <${FROM}>`,
  }),

  /** Admin: new inquiry */
  adminInquiry: (data) => sendMail({
    to: ADMIN,
    subject: `[Admin] New inquiry on "${data.listingTitle}"`,
    html: tplAdminInquiry(data),
    from: `LandHive System <${FROM}>`,
  }),
}
