import { Link } from 'react-router-dom'
import { FileText, ChevronRight } from 'lucide-react'

const SECTIONS = [
  {
    id: 'intro',
    title: '1. Introduction',
    content: `LandHive ("Platform", "we", "us", "our") is an online land listing marketplace operated by LandHive Technologies Pvt. Ltd., registered in Chennai, Tamil Nadu, India. By accessing or using landhive.in, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the platform.

LandHive currently operates exclusively in Tamil Nadu and will expand to additional states as announced.`,
  },
  {
    id: 'accounts',
    title: '2. User Accounts',
    content: `You must be at least 18 years of age to create an account. You are responsible for maintaining the confidentiality of your login credentials. You must provide accurate and current information during registration. LandHive reserves the right to suspend or terminate accounts that violate these terms.

Two roles are available:
• Buyer – Free to register. Can browse, save, and contact sellers.
• Seller – Free to register. Pays ₹999 per listing at the time of posting.`,
  },
  {
    id: 'listings',
    title: '3. Listing Policy',
    content: `Sellers must ensure all listing information is accurate, truthful, and not misleading. Listings must relate to actual land located within Tamil Nadu (or announced states). Prohibited listings include:
• Land under active legal dispute without disclosure
• Fraudulent or duplicate listings
• Properties you do not own or have authority to sell
• Listings with fabricated documents

LandHive reserves the right to remove any listing without notice if it violates these policies. Removal of a listing does not entitle the seller to a refund of the listing fee.`,
  },
  {
    id: 'payment',
    title: '4. Payment Terms',
    content: `The listing fee is ₹999 (Nine Hundred Ninety-Nine Rupees) per listing, charged at the time of submission via PayU payment gateway.

• Each listing requires a separate ₹999 payment.
• There is no subscription or recurring charge.
• Payments are processed securely through PayU. LandHive does not store your card or banking details.
• A listing becomes active only after successful payment AND admin approval.
• The ₹999 fee covers listing publication, document review, and platform maintenance.
• Please refer to our Refund Policy for applicable refund scenarios.`,
  },
  {
    id: 'verification',
    title: '5. Verification Process',
    content: `LandHive performs a basic document review (EC, patta, chitta, survey number) to award the "Verified" badge. This verification:
• Does NOT constitute a legal guarantee of title
• Does NOT replace independent legal due diligence by the buyer
• Is based solely on documents provided by the seller

Buyers are strongly advised to engage a qualified lawyer and conduct independent verification before completing any land transaction. LandHive is a discovery and connection platform only.`,
  },
  {
    id: 'conduct',
    title: '6. User Conduct',
    content: `All users agree not to:
• Use the platform for any illegal purpose under Indian law
• Harass, abuse, or threaten other users
• Post false, misleading, or fraudulent information
• Attempt to scrape, copy, or reproduce platform data without permission
• Use automated bots or scripts to access the platform
• Impersonate another person or entity

Violation may result in immediate account termination without refund.`,
  },
  {
    id: 'disclaimer',
    title: '7. Disclaimer of Warranties',
    content: `LandHive provides the platform on an "as is" and "as available" basis. We do not warrant:
• The accuracy or completeness of any listing
• That the platform will be uninterrupted or error-free
• The legal title or encumbrance-free status of any listed property

All transactions are between the buyer and seller directly. LandHive is not a party to any land sale agreement.`,
  },
  {
    id: 'liability',
    title: '8. Limitation of Liability',
    content: `To the maximum extent permitted by applicable law, LandHive shall not be liable for:
• Any financial loss arising from a land transaction facilitated through the platform
• Loss of data, profits, or business opportunity
• Indirect, incidental, or consequential damages

In any event, LandHive's total liability shall not exceed the listing fee (₹999) paid by the user for the specific listing in question.`,
  },
  {
    id: 'ip',
    title: '9. Intellectual Property',
    content: `All content on LandHive — including logos, UI design, text, graphics, and software — is the property of LandHive Technologies Pvt. Ltd. and is protected under Indian copyright law. You may not reproduce, distribute, or create derivative works without prior written consent.

Sellers grant LandHive a non-exclusive, royalty-free licence to display their listing content (photos, descriptions) on the platform for the duration the listing is active.`,
  },
  {
    id: 'privacy',
    title: '10. Privacy & Data Protection',
    content: `LandHive collects and processes personal data in accordance with India's Digital Personal Data Protection Act, 2023 (DPDP Act). Seller contact details (phone number) are revealed only to registered buyers who are logged in. We do not sell your personal data to third parties. For full details, refer to our Privacy Policy.`,
  },
  {
    id: 'governing',
    title: '11. Governing Law & Jurisdiction',
    content: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu. Before initiating legal proceedings, parties agree to attempt resolution through good-faith mediation for a period of 30 days.`,
  },
  {
    id: 'changes',
    title: '12. Changes to Terms',
    content: `LandHive reserves the right to update these Terms at any time. Material changes will be communicated via email or a prominent notice on the platform. Continued use of the platform after changes constitutes acceptance of the updated Terms. The "Last Updated" date at the top of this page reflects the most recent revision.`,
  },
  {
    id: 'contact',
    title: '13. Contact Us',
    content: `For questions about these Terms, please contact:

LandHive Technologies Pvt. Ltd.
Email: legal@landhive.in
Phone: +91 44 1234 5678
Address: Chennai, Tamil Nadu 600 001, India`,
  },
]

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Terms &amp; Conditions</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shrink-0">
              <FileText size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Terms &amp; Conditions</h1>
              <p className="text-slate-400 text-sm mt-1">Last updated: March 2026 &bull; Effective immediately</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Table of contents */}
          <aside className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 p-4 lg:sticky lg:top-24">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contents</p>
              <nav className="space-y-1">
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                    className="block text-xs text-slate-600 hover:text-primary-600 py-1 px-2 rounded-lg hover:bg-primary-50 transition-colors">
                    {s.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-8">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm text-amber-800 font-medium">
                &#9888; Important: LandHive is a listing platform only. We do not facilitate or guarantee any land sale transaction. Always conduct independent legal due diligence before purchasing land.
              </p>
            </div>

            {SECTIONS.map(s => (
              <section key={s.id} id={s.id} className="bg-white rounded-2xl border border-slate-100 p-6 scroll-mt-24">
                <h2 className="text-lg font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100">{s.title}</h2>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{s.content}</div>
              </section>
            ))}

            <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-center">
              <p className="text-sm text-primary-800 font-medium mb-3">Have questions about these terms?</p>
              <a href="mailto:legal@landhive.in"
                className="inline-flex items-center gap-2 bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
                Contact Legal Team
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
