import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, Shield } from 'lucide-react'
import { useAuth, DEMO_USERS } from '../hooks/useAuth'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, setUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navClass = isHome && !scrolled
    ? 'bg-transparent'
    : 'bg-white shadow-sm border-b border-slate-100'

  const textClass = isHome && !scrolled ? 'text-white' : 'text-slate-700'
  const logoClass = isHome && !scrolled ? 'text-white' : 'text-primary-600'

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-display font-bold text-lg">L</span>
            </div>
            <span className={`font-display font-bold text-xl ${logoClass}`}>
              Land<span className="text-primary-500">Hive</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/search" className={`text-sm font-medium hover:text-primary-500 transition-colors ${textClass}`}>
              Browse Lands
            </Link>
            <Link to="/post" className={`text-sm font-medium hover:text-primary-500 transition-colors ${textClass}`}>
              Post Land
            </Link>
            {!user ? (
              <>
                <Link to="/sign-in" className={`text-sm font-medium hover:text-primary-500 transition-colors ${textClass}`}>
                  Login
                </Link>
                <Link to="/post" className="btn-primary text-sm py-2 px-5">
                  List Your Land
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 text-sm font-medium hover:text-primary-500 transition-colors ${textClass}`}
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary-600" />
                  </div>
                  <span>{user.name.split(' ')[0]}</span>
                  <ChevronDown size={14} />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                      <span className="badge badge-green capitalize">{user.role}</span>
                    </div>
                    {user.role === 'seller' && (
                      <Link to="/dashboard/seller" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600">
                        <LayoutDashboard size={15} /> Seller Dashboard
                      </Link>
                    )}
                    {user.role === 'buyer' && (
                      <Link to="/dashboard/buyer" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600">
                        <LayoutDashboard size={15} /> Buyer Dashboard
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-600">
                        <Shield size={15} /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { setUser(null); setUserMenuOpen(false); navigate('/') }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full">
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden ${textClass}`}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-4">
            <Link to="/search" onClick={() => setMenuOpen(false)} className="text-slate-700 font-medium">Browse Lands</Link>
            <Link to="/post" onClick={() => setMenuOpen(false)} className="text-slate-700 font-medium">Post Land</Link>
            {!user ? (
              <>
                <Link to="/sign-in" onClick={() => setMenuOpen(false)} className="text-slate-700 font-medium">Login</Link>
                <Link to="/post" onClick={() => setMenuOpen(false)} className="btn-primary text-center text-sm py-2.5">List Your Land</Link>
              </>
            ) : (
              <>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500 mb-3">{user.email}</p>
                  {user.role === 'seller' && <Link to="/dashboard/seller" onClick={() => setMenuOpen(false)} className="block text-slate-700 font-medium mb-2">Seller Dashboard</Link>}
                  {user.role === 'buyer' && <Link to="/dashboard/buyer" onClick={() => setMenuOpen(false)} className="block text-slate-700 font-medium mb-2">Buyer Dashboard</Link>}
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setMenuOpen(false)} className="block text-slate-700 font-medium mb-2">Admin Panel</Link>}
                  <button onClick={() => { setUser(null); setMenuOpen(false); navigate('/') }} className="text-red-600 font-medium">Sign Out</button>
                </div>
              </>
            )}
            {/* Demo login shortcuts */}
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400 mb-2">Demo Login:</p>
              <div className="flex gap-2">
                {Object.entries(DEMO_USERS).map(([role, u]) => (
                  <button key={role} onClick={() => { setUser(u); setMenuOpen(false) }}
                    className="text-xs px-2 py-1 bg-primary-50 text-primary-600 rounded-lg capitalize font-medium">
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop demo login bar */}
      {!user && (
        <div className="hidden md:block bg-primary-800 py-1 text-center">
          <span className="text-xs text-primary-200">Demo: Login as </span>
          {Object.entries(DEMO_USERS).map(([role, u]) => (
            <button key={role} onClick={() => setUser(u)}
              className="text-xs text-white underline underline-offset-2 mx-2 hover:text-primary-200 capitalize font-medium">
              {role}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
