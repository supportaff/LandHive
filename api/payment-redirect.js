// api/payment-redirect.js
// PayU surl / furl handler.
// PayU POSTs the payment result here (surl for success, furl for failure).
// We parse the POST body, then 302-redirect to the React payment page.
//
// Set in payu-initiate.js:
//   surl: APP_URL + '/api/payment-redirect?r=success'
//   furl: APP_URL + '/api/payment-redirect?r=failure'

export default function handler(req, res) {
  // PayU sends application/x-www-form-urlencoded POST
  const result = req.query.r || 'failure'

  const body       = req.body || {}
  const status     = body.status     || result
  const txnid      = body.txnid      || ''
  const mihpayid   = body.mihpayid   || ''
  const amount     = body.amount     || ''
  const error_Message = body.error_Message || body.error_message || ''

  const qs = new URLSearchParams()
  if (txnid)    qs.set('txnid',    txnid)
  if (mihpayid) qs.set('mihpayid', mihpayid)
  if (amount)   qs.set('amount',   amount)
  if (status)   qs.set('status',   status)
  if (error_Message) qs.set('error', error_Message)

  const isSuccess = status === 'success' && result === 'success'
  const dest = isSuccess
    ? `/payment/success?${qs.toString()}`
    : `/payment/failure?${qs.toString()}`

  // 302 redirect to React SPA route
  res.setHeader('Location', dest)
  return res.status(302).end()
}
