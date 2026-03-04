import { useNavigate } from 'react-router-dom'
import { Home, Sprout, ArrowRight } from 'lucide-react'
import { useAuth, DEMO_USERS } from '../hooks/useAuth'

export default function RoleSelect() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const selectRole = (role) => {
    setUser(DEMO_USERS[role])
    navigate(role === 'seller' ? '/post' : '/search')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7, #f8fafc)' }}>
      <div className="max-w-xl w-full text-center">
        <div className="mb-10">
          <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">How will you use LandHive?</h1>
          <p className="text-slate-500">Choose your role to personalize your experience</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <button onClick={() => selectRole('buyer')}
            className="group bg-white rounded-3xl border-2 border-slate-200 hover:border-primary-400 p-8 text-left shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-200 rounded-2xl flex items-center justify-center mb-5 transition-colors">
              <Home size={26} className="text-blue-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">I'm a Buyer</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Looking to buy agricultural, residential, or commercial land across India.
            </p>
            <div className="flex items-center gap-1 text-primary-600 text-sm font-medium mt-4 group-hover:gap-2 transition-all">
              Browse listings <ArrowRight size={15} />
            </div>
          </button>

          <button onClick={() => selectRole('seller')}
            className="group bg-white rounded-3xl border-2 border-slate-200 hover:border-primary-400 p-8 text-left shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-primary-100 group-hover:bg-primary-200 rounded-2xl flex items-center justify-center mb-5 transition-colors">
              <Sprout size={26} className="text-primary-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-slate-800 mb-2">I'm a Seller</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              I want to list my land and reach 50,000+ verified buyers nationwide.
            </p>
            <div className="flex items-center gap-1 text-primary-600 text-sm font-medium mt-4 group-hover:gap-2 transition-all">
              Post listing (₹999) <ArrowRight size={15} />
            </div>
          </button>
        </div>

        <p className="text-xs text-slate-400">
          You can change this later in your account settings
        </p>
      </div>
    </div>
  )
}
