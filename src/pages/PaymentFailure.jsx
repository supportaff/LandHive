import { useSearchParams, Link } from 'react-router-dom'
import { XCircle, RefreshCw, Home, MessageCircle } from 'lucide-react'

export default function PaymentFailure() {
  const [params] = useSearchParams()

  const txnid   = params.get('txnid')   || ''
  const amount  = params.get('amount')  || ''
  const errMsg  = params.get('error')   || 'Payment could not be completed'

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4 pt-20 pb-16">
      <div className="max-w-lg w-full">

        <div className="bg-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">

          {/* Red header */}
          <div className="bg-gradient-to-r from-red-500 to-rose-500 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle size={44} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-1">Payment Failed</h1>
            <p className="text-white/80">Don&apos;t worry — no amount was deducted</p>
          </div>

          <div className="p-8">
            {/* Error detail */}
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6">
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">What happened?</p>
              <p className="text-sm text-red-700">{errMsg}</p>
              {txnid && (
                <p className="text-xs text-red-400 mt-2">Reference: <span className="font-mono">{txnid}</span></p>
              )}
            </div>

            {/* Common reasons */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-3">Common reasons for failure:</p>
              <ul className="space-y-2">
                {[
                  'Insufficient bank balance or card limit',
                  'Bank OTP timed out or was entered incorrectly',
                  'Net banking session expired',
                  'Browser was closed during payment',
                ].map(r => (
                  <li key={r} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-red-400 shrink-0 mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>

            {/* Your listing is safe */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                \uD83D\uDCCB <strong>Your listing is saved.</strong> You can retry payment from your{' '}
                <Link to="/dashboard/seller" className="underline text-amber-700">seller dashboard</Link>{' '}
                at any time.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard/seller"
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-xl transition-all active:scale-95">
                <RefreshCw size={17} /> Retry Payment
              </Link>
              <Link
                to="/"
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl hover:bg-slate-50 transition-all">
                <Home size={17} /> Back to Home
              </Link>
            </div>

            <div className="mt-4 text-center">
              <a
                href="mailto:hello@landhive.in"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-primary-600 transition-colors">
                <MessageCircle size={13} /> Need help? Email hello@landhive.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
