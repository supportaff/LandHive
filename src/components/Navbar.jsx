import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, LogOut, LayoutDashboard, MapPin, Plus, Search } from 'lucide-react'
import { useAuth, DEMO_USERS } from '../hooks/useAuth'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, setUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setUserMenuOpen(false) }, [location.pathname])

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const transparent = isHome && !scrolled
  const navBg = transparent
    ? 'bg-transparent'
    : 'bg-white/95 backdrop-blur-lg shadow-sm border-b border-slate-100'
  const linkCls = transparent
    ? 'text-white/85 hover:text-white hover:bg-white/10'
    : 'text-slate-600 hover:text-primary-700 hover:bg-primary-50'

  const dashPath = user?.role === 'seller' ? '/dashboard/seller'
    : user?.role === 'admin' ? '/admin'
    : '/dashboard/buyer'

  const roleBadge = {
    admin: 'bg-purple-100 text-purple-700',
    seller: 'bg-amber-100 text-amber-700',
    buyer: 'bg-green-100 text-green-700',
  }

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
            </Link>

            {/* Desktop center nav */}
            <div className="hidden md:flex items-center gap-0.5">
              <Link to="/search" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${linkCls}`}>
                <Search size={14} /> Browse Lands
              </Link>
              <Link to="/post" className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${linkCls}`}>
                <Plus size={14} /> Post Land
              </Link>
            </div>

            {/* Desktop right */}
            <div className="hidden md:flex items-center gap-2">
              {!user ? (
                <>
                  <Link to="/sign-in" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${linkCls}`}>
                    Login
                  </Link>
                  <Link to="/post"
                    className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-primary-500/30 transition-all">
                    <Plus size={15} /> List Your Land
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-1.5">
                  {/* Dashboard quick link */}
                  <Link to={dashPath}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${linkCls}`}>
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>

                  {/* Avatar dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setUserMenuOpen(v => !v)}
                      className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl text-sm font-medium border transition-all
                        ${ transparent
                          ? 'bg-white/10 hover:bg-white/20 text-white border-white/25'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' }`}>
                      <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                      <ChevronDown size={12} className={`transition-transform shrink-0 ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
                        <div className="px-4 py-3.5 bg-gradient-to-br from-primary-50 to-green-50 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <span className={`mt-2.5 inline-block text-xs px-2.5 py-0.5 rounded-full font-semibold capitalize ${roleBadge[user.role] || 'bg-slate-100 text-slate-600'}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="py-1.5">
                          <Link to={dashPath} onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                            <LayoutDashboard size={15} className="text-primary-500 shrink-0" />
                            {user.role === 'admin' ? 'Admin Panel' : user.role === 'seller' ? 'Seller Dashboard' : 'Saved Listings'}
                          </Link>
                          {user.role === 'seller' && (
                            <Link to="/post" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                              <Plus size={15} className="text-primary-500 shrink-0" /> Post New Listing
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-slate-100 py-1.5">
                          <button
                            onClick={() => { setUser(null); setUserMenuOpen(false); navigate('/') }}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors">
                            <LogOut size={15} className="shrink-0" /> Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile right icons */}
            <div className="flex md:hidden items-center gap-1">
              {user && (
                <Link to={dashPath}
                  className={`p-2 rounded-xl transition-all ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}>
                  <LayoutDashboard size={20} />
                </Link>
              )}
              <button
                onClick={() => setMenuOpen(v => !v)}
                className={`p-2 rounded-xl transition-all ${transparent ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}>
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              <Link to="/search" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                <Search size={17} className="text-primary-500" /> Browse Lands
              </Link>
              <Link to="/post" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors">
                <Plus size={17} className="text-primary-500" /> Post Land
              </Link>

              {!user ? (
                <div className="pt-2 space-y-2 border-t border-slate-100">
                  <Link to="/sign-in" onClick={() => setMenuOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
                    Login
                  </Link>
                  <Link to="/post" onClick={() => setMenuOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
                    List Your Land &mdash; &#8377;999
                  </Link>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex items-center gap-3 px-3 py-3 bg-gradient-to-r from-primary-50 to-green-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{user.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize inline-block mt-0.5 ${roleBadge[user.role]}`}>{user.role}</span>
                    </div>
                  </div>
                  <Link to={dashPath} onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors">
                    <LayoutDashboard size={17} className="text-primary-500" /> Dashboard
                  </Link>
                  {user.role === 'seller' && (
                    <Link to="/post" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors">
                      <Plus size={17} className="text-primary-500" /> Post New Listing
                    </Link>
                  )}
                  <button
                    onClick={() => { setUser(null); setMenuOpen(false); navigate('/') }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 font-medium hover:bg-red-50 w-full transition-colors">
                    <LogOut size={17} /> Sign Out
                  </button>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400 px-3 mb-2 font-medium">Demo Quick Login</p>
                <div className="flex gap-2 px-1 flex-wrap">
                  {Object.entries(DEMO_USERS).map(([role, u]) => (
                    <button key={role} onClick={() => { setUser(u); setMenuOpen(false) }}
                      className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg font-semibold capitalize hover:bg-primary-100 border border-primary-100 transition-colors">
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Demo bar — desktop */}
      {!user && (
        <div className="hidden md:flex fixed top-16 inset-x-0 z-40 bg-primary-950 py-1.5 justify-center items-center gap-3">
          <span className="text-xs text-primary-300 font-medium">Demo login:</span>
          {Object.entries(DEMO_USERS).map(([role, u]) => (
            <button key={role} onClick={() => setUser(u)}
              className="text-xs text-white/90 hover:text-white border border-primary-700 hover:border-primary-500 bg-primary-900 hover:bg-primary-800 px-3 py-1 rounded-full capitalize font-semibold transition-all">
              {role}
            </button>
          ))}
        </div>
      )}
    </>
  )
}
