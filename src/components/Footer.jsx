import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react'

const TN_DISTRICTS = ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy', 'Tirunelveli']

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <MapPin size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Land<span className="text-primary-400">Hive</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-3">
              Tamil Nadu&apos;s most trusted land marketplace. Connecting buyers and sellers with verified land listings across all 38 districts.
            </p>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs px-3 py-1.5 rounded-full mb-4 font-medium">
              &#127759; Currently: Tamil Nadu &bull; More states soon
            </div>
            <div className="flex gap-2.5">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Buyers */}
          <div>
            <h4 className="font-semibold text-white mb-4">Browse by District</h4>
            <ul className="space-y-2.5">
              {TN_DISTRICTS.map(d => (
                <li key={d}>
                  <Link
                    to={`/search?state=Tamil+Nadu&district=${d}`}
                    className="text-sm text-slate-400 hover:text-primary-400 transition-colors flex items-center gap-1.5">
                    <MapPin size={11} className="text-slate-600 shrink-0" /> {d}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/search?state=Tamil+Nadu" className="text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium">
                  View all districts &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Sellers</h4>
            <ul className="space-y-2.5">
              <li><Link to="/post" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Post Your Land</Link></li>
              <li><Link to="/post" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Pricing (&#8377;999 / listing)</Link></li>
              <li><Link to="/dashboard/seller" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Seller Dashboard</Link></li>
              <li><Link to="/" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">How It Works</Link></li>
              <li><Link to="/" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Verification Process</Link></li>
              <li><Link to="/refund" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Company + Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 mb-6">
              <li><Link to="/terms" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link to="/refund" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Refund Policy</Link></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">About Us</a></li>
              <li><a href="mailto:hello@landhive.in" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">Contact Us</a></li>
            </ul>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={13} className="text-primary-400 shrink-0" />
                Chennai, Tamil Nadu 600 001
              </div>
              <a href="tel:+914412345678" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Phone size={13} className="text-primary-400 shrink-0" />
                +91 44 1234 5678
              </a>
              <a href="mailto:hello@landhive.in" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <Mail size={13} className="text-primary-400 shrink-0" />
                hello@landhive.in
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">&copy; 2025 LandHive Technologies Pvt. Ltd. All rights reserved. &bull; Made with &#10084; in Tamil Nadu</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/terms" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">Terms &amp; Conditions</Link>
            <Link to="/refund" className="text-xs text-slate-500 hover:text-primary-400 transition-colors">Refund Policy</Link>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500">256-bit SSL &bull; DPDP Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
