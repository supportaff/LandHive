import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, LayoutDashboard, Home, Download } from 'lucide-react'

export default function PaymentSuccess() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const [seconds, setSeconds] = useState(8)

  const txnid    = params.get('txnid')    || ''
  const mihpayid = params.get('mihpayid') || ''
  const amount   = params.get('amount')   || ''
  const status   = params.get('status')   || 'success'

  // Auto-redirect to dashboard after 8s
  useEffect(() => {
    if (seconds <= 0) { navigate('/dashboard/seller'); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds, navigate])

  const amountFormatted = amount
    ? `\u20B9${parseFloat(amount).toLocaleString('en-IN')}`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center px-4 pt-20 pb-16">
      <div className="max-w-lg w-full">

        {/* Success card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-primary-100 overflow-hidden">

          {/* Green header */}
          <div className="bg-gradient-to-r from-primary-600 to-emerald-500 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={44} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-1">Payment Successful!</h1>
            {amountFormatted && (
              <p className="text-white/80 text-lg">{amountFormatted} received</p>
            )}
          </div>

          <div className="p-8">
            {/* Transaction details */}
            {(txnid || mihpayid) && (
              <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Payment Receipt</p>
                <div className="space-y-2">
                  {txnid && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Transaction ID</span>
                      <span className="text-sm font-mono font-semibold text-slate-800">{txnid}</span>
                    </div>
                  )}
                  {mihpayid && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">PayU Payment ID</span>
                      <span className="text-sm font-mono font-semibold text-slate-800">{mihpayid}</span>
                    </div>
                  )}
                  {amountFormatted && (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-sm font-semibold text-slate-700">Amount Paid</span>
                      <span className="text-lg font-bold text-primary-600">{amountFormatted}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Next steps */}
            <div className="space-y-3 mb-6">
              {[
                { icon: '\uD83D\uDD0D', step: '1. KYC Verification',       desc: 'Admin will verify your documents (1–2 business days)' },
                { icon: '\u2705',       step: '2. Listing Review',           desc: 'Admin reviews and approves your listing' },
                { icon: '\uD83D\uDE80', step: '3. Go Live',                  desc: 'Your listing goes live on LandHive within 24–48 hrs' },
                { icon: '\uD83D\uDCF2', step: '4. WhatsApp Alerts',          desc: 'Get notified for every buyer inquiry instantly' },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-3">
                  <span className="text-lg shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{item.step}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* A receipt email note */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 mb-6 text-center">
              <p className="text-xs text-primary-700">
                \uD83D\uDCE7 A payment receipt has been sent to your registered email address.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard/seller"
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-xl transition-all active:scale-95">
                <LayoutDashboard size={17} /> Go to Dashboard
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl hover:bg-slate-50 transition-all">
                <Home size={17} /> Back to Home
              </Link>
            </div>

            {/* Auto-redirect countdown */}
            <p className="text-center text-xs text-slate-400 mt-4">
              Redirecting to dashboard in <strong>{seconds}s</strong>…
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
