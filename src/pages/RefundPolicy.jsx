import { Link } from 'react-router-dom'
import { RefreshCw, ChevronRight, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'

const REFUND_CASES = [
  {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50 border-red-100',
    title: 'Not Eligible for Refund',
    items: [
      'Listing rejected by admin due to policy violation or false information',
      'Change of mind after successful payment',
      'Listing approved but not receiving enough inquiries',
      'Seller decides not to sell the property after posting',
      'Duplicate listing posted by the same seller',
      'Account suspended due to violation of Terms & Conditions',
    ],
  },
  {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-100',
    title: 'Eligible for Full Refund',
    items: [
      'Payment deducted but listing was never created due to a technical error on our platform',
      'Double payment charged for the same listing due to a payment gateway error',
      'Service unavailable for more than 7 consecutive days preventing listing access',
    ],
  },
]

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Refund Policy</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shrink-0">
              <RefreshCw size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Refund Policy</h1>
              <p className="text-slate-400 text-sm mt-1">Last updated: March 2026 &bull; Applies to all listing payments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Summary box */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800 mb-1">Key Summary</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                LandHive charges a <strong>one-time, non-refundable listing fee of &#8377;999</strong> per listing. This fee is collected at the time of posting and covers document review, platform maintenance, and listing visibility.
                Refunds are only granted in exceptional cases of verified technical errors on our side.
              </p>
            </div>
          </div>
        </div>

        {/* Refund cases */}
        {REFUND_CASES.map(c => {
          const Icon = c.icon
          return (
            <div key={c.title} className={`bg-white rounded-2xl border p-6 ${c.bg}`}>
              <div className="flex items-center gap-2 mb-4">
                <Icon size={18} className={c.color} />
                <h2 className="font-bold text-slate-800">{c.title}</h2>
              </div>
              <ul className="space-y-2">
                {c.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}

        {/* Process */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock size={18} className="text-primary-600" />
            <h2 className="font-bold text-slate-800">How to Request a Refund</h2>
          </div>
          <ol className="space-y-4">
            {[
              { step: '1', title: 'Email us within 7 days', desc: 'Send an email to refunds@landhive.in within 7 days of payment with your registered email, transaction ID (from PayU), and a description of the issue.' },
              { step: '2', title: 'Verification', desc: 'Our team will verify the issue against our payment and system logs within 2 business days.' },
              { step: '3', title: 'Decision', desc: 'We will notify you via email of the refund decision. Eligible refunds will be processed within 5&ndash;7 business days to the original payment method.' },
              { step: '4', title: 'Credit', desc: 'The refunded amount will appear in your original payment account (bank/UPI/card) within the processing period depending on your bank.' },
            ].map(s => (
              <li key={s.step} className="flex gap-4">
                <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{s.title}</p>
                  <p className="text-sm text-slate-500 mt-0.5" dangerouslySetInnerHTML={{ __html: s.desc }} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Payment gateway note */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
          <h2 className="font-bold text-slate-800 mb-2 text-sm">Payment Gateway (PayU)</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            All payments are processed securely by PayU. LandHive does not store card or bank details. In case of a payment gateway failure (money debited but listing not created), please also report the issue directly to PayU using your transaction ID. LandHive will co-operate fully to resolve such cases.
          </p>
        </div>

        {/* Contact */}
        <div className="bg-primary-50 border border-primary-100 rounded-2xl p-6 text-center">
          <p className="font-semibold text-primary-900 mb-1">Refund Queries</p>
          <p className="text-sm text-primary-700 mb-4">Contact us within 7 days of your payment for refund-eligible issues.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:refunds@landhive.in"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
              refunds@landhive.in
            </a>
            <a href="tel:+914412345678"
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              +91 44 1234 5678
            </a>
          </div>
          <p className="text-xs text-primary-500 mt-3">Mon&ndash;Sat, 9 AM &ndash; 6 PM IST</p>
        </div>

        <div className="text-center">
          <Link to="/terms" className="text-sm text-primary-600 hover:underline font-medium">Also read: Terms &amp; Conditions &rarr;</Link>
        </div>
      </div>
    </div>
  )
}
