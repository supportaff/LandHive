import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">L</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Land<span className="text-primary-400">Hive</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 mb-5">
              India's most trusted land marketplace. Connecting buyers and sellers with verified listings across all states.
            </p>
            <div className="flex gap-3">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Buyers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Buyers</h4>
            <ul className="space-y-2.5">
              {['Browse Listings', 'Map Search', 'Agricultural Land', 'Residential Plots', 'Farm Land', 'Commercial Land'].map(item => (
                <li key={item}>
                  <Link to="/search" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h4 className="font-semibold text-white mb-4">For Sellers</h4>
            <ul className="space-y-2.5">
              {['Post Your Land', 'Pricing (₹999)', 'Seller Dashboard', 'How It Works', 'Verification Process', 'FAQs'].map(item => (
                <li key={item}>
                  <Link to="/post" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company + Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2.5 mb-6">
              {['About Us', 'Contact', 'Privacy Policy', 'Terms of Service', 'Refund Policy'].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-slate-400 hover:text-primary-400 transition-colors">{item}</a>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <MapPin size={14} className="text-primary-400 shrink-0" />
                Chennai, Tamil Nadu, India
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Phone size={14} className="text-primary-400 shrink-0" />
                +91 44 1234 5678
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail size={14} className="text-primary-400 shrink-0" />
                hello@landhive.in
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">© 2024 LandHive Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-500">Secured by 256-bit SSL • DPDP Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
