import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth, DEMO_USERS } from '../hooks/useAuth'

export function SignIn() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    // Demo: match by email
    const found = Object.values(DEMO_USERS).find(u => u.email === email)
    if (found) {
      setUser(found)
      navigate(found.role === 'seller' ? '/dashboard/seller' : found.role === 'admin' ? '/admin' : '/dashboard/buyer')
    } else {
      setError('Invalid email or password. Try the demo buttons below.')
    }
    setLoading(false)
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your LandHive account">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            <AlertCircle size={15} className="shrink-0" /> {error}
          </div>
        )}
        <div>
          <label className="label">Email address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" className="input" required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" className="input pr-10" required />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
        <div className="relative text-center"><span className="bg-white px-3 text-xs text-slate-400">Or use a demo account</span></div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Object.entries(DEMO_USERS).map(([role, u]) => (
          <button key={role} onClick={() => {
            setUser(u)
            navigate(u.role === 'seller' ? '/dashboard/seller' : u.role === 'admin' ? '/admin' : '/dashboard/buyer')
          }}
            className="flex flex-col items-center gap-1 p-3 border border-slate-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all text-xs font-medium capitalize text-slate-600">
            <span className="text-xl">{role === 'buyer' ? '🏠' : role === 'seller' ? '👨‍🌾' : '🛡️'}</span>
            {role}
          </button>
        ))}
      </div>

      <p className="text-center text-sm text-slate-500 mt-5">
        Don't have an account?{' '}
        <Link to="/sign-up" className="text-primary-600 font-medium hover:underline">Sign up free</Link>
      </p>
    </AuthLayout>
  )
}

export function SignUp() {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setLoading(false)
    navigate('/role-select')
  }

  return (
    <AuthLayout title="Create account" subtitle="Join 50,000+ users on LandHive — it's free">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Full Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ramesh Kumar" className="input" required />
        </div>
        <div>
          <label className="label">Email address</label>
          <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            placeholder="you@example.com" className="input" required />
        </div>
        <div>
          <label className="label">Phone Number</label>
          <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+91 98765 43210" className="input" required />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Min 8 characters" className="input pr-10" required />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
        <p className="text-xs text-slate-400 text-center">
          By signing up, you agree to our{' '}
          <a href="#" className="text-primary-600">Terms of Service</a> and{' '}
          <a href="#" className="text-primary-600">Privacy Policy</a>
        </p>
      </form>
      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-primary-600 font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f8fafc 100%)' }}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-display font-bold text-xl">L</span>
            </div>
            <span className="font-display font-bold text-2xl text-slate-800">
              Land<span className="text-primary-600">Hive</span>
            </span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-slate-800 mb-1">{title}</h1>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default SignIn
