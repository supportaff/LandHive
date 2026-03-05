import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, MapPin, Plus, Search, LayoutDashboard } from 'lucide-react'
import {
  SignedIn, SignedOut, UserButton, SignInButton,
  useUser,
} from '@clerk/clerk-react'

function NavLink({ to, children, icon, transparent }) {
  const location = useLocation()
  const isActive = location.pathname === to
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        transparent
          ? isActive
            ? 'bg-white/15 text-white'
            : 'text-white/80 hover:text-white hover:bg-white/10'
          : isActive
            ? 'bg-primary-50 text-primary-700 font-semibold'
            : 'text-slate-600 hover:text-primary-700 hover:bg-primary-50'
      }`}>
      {icon}{children}
    </Link>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled]  = useState(false)
  const { user } = useUser()
  const location  = useLocation()
  const isHome    = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const transparent = isHome && !scrolled
  const role    = user?.publicMetadata?.role || 'buyer'
  const dashPath = role === 'seller' ? '/dashboard/seller'
    : role === 'admin' ? '/admin'
    : '/dashboard/buyer'

  return (
    <>
      {/* 2px brand accent line at very top */}
      <div className="fixed top-0 inset-x-0 z-[51] h-0.5 bg-gradient-to-r from-primary-600 via-primary-400 to-emerald-400" />

      <nav className={`fixed top-0.5 inset-x-0 z-50 transition-all duration-300 ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/96 backdrop-blur-xl shadow-[0_2px_24px_rgba(0,0,0,0.07)] border-b border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-[62px]">

            {/* ── Logo ── */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${
                transparent
                  ? 'bg-white/20 backdrop-blur-sm border border-white/30'
                  : 'bg-gradient-to-br from-primary-500 to-primary-700'
              }`}>
                <MapPin size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`font-display font-bold text-[19px] ${
                  transparent ? 'text-white' : 'text-slate-800'
                }`}>
                  Land<span className="text-primary-500">Hive</span>
                </span>
                <span className={`text-[9px] font-semibold tracking-widest uppercase mt-0.5 ${
                  transparent ? 'text-white/45' : 'text-slate-400'
                }`}>
                  Tamil Nadu
                </span>
              </div>
            </Link>

            {/* ── Desktop centre ── */}
            <div className="hidden md:flex items-center gap-0.5">
              <NavLink to="/search" transparent={transparent} icon={<Search size={14} className="mr-0.5" />}>
                Browse Lands
              </NavLink>
              <NavLink to="/post" transparent={transparent} icon={<Plus size={14} className="mr-0.5" />}>
                Sell Land
              </NavLink>
            </div>

            {/* ── Desktop right ── */}
            <div className="hidden md:flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    transparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}>
                    Sign In
                  </button>
                </SignInButton>
                <Link
                  to="/post"
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-primary-500/25 transition-all">
                  <Plus size={15} /> List Your Land
                </Link>
              </SignedOut>

              <SignedIn>
                <Link
                  to={dashPath}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    transparent
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-primary-700 hover:bg-primary-50'
                  }`}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{ elements: { avatarBox: 'w-9 h-9 ring-2 ring-primary-500/30' } }}
                />
              </SignedIn>
            </div>

            {/* ── Mobile right ── */}
            <div className="flex md:hidden items-center gap-2">
              <SignedIn>
                <Link
                  to={dashPath}
                  className={`p-2 rounded-xl transition-all ${
                    transparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
                  }`}>
                  <LayoutDashboard size={20} />
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className={`p-2 rounded-xl transition-all ${
                  transparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
                }`}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-2xl rounded-b-2xl overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/search"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors">
                <Search size={17} className="text-primary-500" /> Browse Lands
              </Link>
              <Link
                to="/post"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors">
                <Plus size={17} className="text-primary-500" /> Sell Land
              </Link>

              <SignedOut>
                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center px-4 py-3 rounded-xl text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
                      Sign In
                    </button>
                  </SignInButton>
                  <Link
                    to="/post"
                    onClick={() => setMenuOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
                    List Your Land
                  </Link>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <Link
                    to={dashPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    <LayoutDashboard size={17} className="text-primary-500" /> Dashboard
                  </Link>
                  {role === 'seller' && (
                    <Link
                      to="/post"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors">
                      <Plus size={17} className="text-primary-500" /> Post New Listing
                    </Link>
                  )}
                </div>
              </SignedIn>

              {/* Tamil Nadu badge in mobile menu */}
              <div className="pt-3 pb-1 border-t border-slate-100">
                <div className="flex items-center gap-2 px-3 py-2 bg-primary-50 rounded-xl">
                  <MapPin size={13} className="text-primary-500 shrink-0" />
                  <span className="text-xs text-primary-700 font-medium">
                    Serving Tamil Nadu &mdash; more states coming soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
