import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, MapPin, Plus, Search, LayoutDashboard, ChevronDown } from 'lucide-react'
import {
  SignedIn, SignedOut, UserButton, SignInButton,
  useUser,
} from '@clerk/clerk-react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useUser()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  const transparent = isHome && !scrolled
  const navBg = transparent
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100'

  const linkCls = transparent
    ? 'text-white/85 hover:text-white hover:bg-white/10'
    : 'text-slate-600 hover:text-primary-700 hover:bg-primary-50'

  const role = user?.publicMetadata?.role || 'buyer'
  const dashPath = role === 'seller' ? '/dashboard/seller'
    : role === 'admin' ? '/admin'
    : '/dashboard/buyer'

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow">
                <MapPin size={17} className="text-white" strokeWidth={2.5} />
              </div>
              <span className={`font-display font-bold text-xl ${transparent ? 'text-white' : 'text-slate-800'}`}>
                Land<span className="text-primary-500">Hive</span>
              </span>
              <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ml-1
                ${transparent ? 'bg-white/10 border-white/20 text-white/70' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                Tamil Nadu
              </span>
            </Link>

            {/* Desktop centre nav */}
            <div className="hidden md:flex items-center gap-0.5">
              <Link to="/search" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${linkCls}`}>
                <Search size={14} /> Browse Lands
              </Link>
              <Link to="/post" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${linkCls}`}>
                <Plus size={14} /> Sell Land
              </Link>
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${linkCls}`}>
                    Login
                  </button>
                </SignInButton>
                <Link to="/post"
                  className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-primary-500/30 transition-all">
                  <Plus size={15} /> List Your Land
                </Link>
              </SignedOut>

              <SignedIn>
                <Link to={dashPath}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${linkCls}`}>
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-9 h-9 ring-2 ring-primary-500/30',
                    },
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile right */}
            <div className="flex md:hidden items-center gap-2">
              <SignedIn>
                <Link to={dashPath}
                  className={`p-2 rounded-xl transition-all ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <LayoutDashboard size={20} />
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <button
                onClick={() => setMenuOpen(v => !v)}
                className={`p-2 rounded-xl transition-all ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-2xl">
            <div className="px-4 py-3 space-y-1">
              <Link to="/search" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50">
                <Search size={17} className="text-primary-500" /> Browse Lands
              </Link>
              <Link to="/post" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50">
                <Plus size={17} className="text-primary-500" /> Sell Land
              </Link>

              <SignedOut>
                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <SignInButton mode="modal">
                    <button onClick={() => setMenuOpen(false)}
                      className="w-full text-center px-4 py-3 rounded-xl text-slate-700 font-medium border border-slate-200 hover:bg-slate-50">
                      Login
                    </button>
                  </SignInButton>
                  <Link to="/post" onClick={() => setMenuOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700">
                    List Your Land
                  </Link>
                </div>
              </SignedOut>

              <SignedIn>
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <Link to={dashPath} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700">
                    <LayoutDashboard size={17} className="text-primary-500" /> Dashboard
                  </Link>
                  {role === 'seller' && (
                    <Link to="/post" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700">
                      <Plus size={17} className="text-primary-500" /> Post New Listing
                    </Link>
                  )}
                </div>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
