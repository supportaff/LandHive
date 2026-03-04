import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, TrendingUp, Shield, Users, ArrowRight, Star, CheckCircle2,
  TreePine, Home as HomeIcon, Building2, Sprout, ChevronRight } from 'lucide-react'
import ListingCard from '../components/ListingCard'
import { LISTINGS, STATS, STATES, LAND_TYPES } from '../data/listings'

const STEPS = [
  { icon: Search, title: 'Search & Discover', desc: 'Filter by state, type, area, and budget to find your perfect land across India.', color: 'bg-blue-50 text-blue-600' },
  { icon: MapPin, title: 'View on Map', desc: 'See listings plotted on Google Maps with satellite view and nearby amenities.', color: 'bg-purple-50 text-purple-600' },
  { icon: Shield, title: 'Verified Listings', desc: 'EC, patta, chitta documents verified. Buy with complete peace of mind.', color: 'bg-amber-50 text-amber-600' },
  { icon: CheckCircle2, title: 'Close the Deal', desc: 'Connect directly with seller, visit the land, complete registration hassle-free.', color: 'bg-primary-50 text-primary-600' },
]

const LAND_CATEGORIES = [
  { icon: Sprout, label: 'Agricultural', value: 'agricultural', count: '4,280+', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { icon: HomeIcon, label: 'Residential', value: 'residential', count: '3,150+', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { icon: Building2, label: 'Commercial', value: 'commercial', count: '1,840+', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { icon: TreePine, label: 'Farm Land', value: 'farm', count: '2,010+', color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
]

export default function Home() {
  const [state, setState] = useState('')
  const [landType, setLandType] = useState('')
  const [budget, setBudget] = useState('')
  const navigate = useNavigate()

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (state) params.set('state', state)
    if (landType) params.set('landType', landType)
    if (budget) params.set('maxPrice', budget)
    navigate(`/search?${params.toString()}`)
  }

  const featured = LISTINGS.filter(l => l.featured)

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center" style={{
        background: 'linear-gradient(135deg, #14532d 0%, #15803d 40%, #166534 70%, #1a3a2a 100%)'
      }}>
        {/* Decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 pt-40">
          <div className="max-w-3xl">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm px-4 py-2 rounded-full mb-6 animate-fade-in">
              <Star size={14} className="text-amber-400 fill-amber-400" />
              India's Most Trusted Land Marketplace
              <ChevronRight size={14} />
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6"
              style={{ animationDelay: '0.1s' }}>
              Find Your <br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #86efac, #4ade80)' }}>
                Perfect Land
              </span>
            </h1>
            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl">
              Discover verified agricultural, residential, and commercial land across 27 states.
              12,000+ listings. 100% transparent. Direct from sellers.
            </p>

            {/* Search bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-3">
              <select value={state} onChange={e => setState(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">📍 All States</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <select value={landType} onChange={e => setLandType(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">🌱 Land Type</option>
                {LAND_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>

              <input
                type="text"
                placeholder="💰 Max Budget (e.g. 50L)"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />

              <button onClick={handleSearch}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shrink-0 shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5">
                <Search size={18} />
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {['Tamil Nadu', 'Maharashtra', 'Karnataka', 'Andhra Pradesh'].map(s => (
                <button key={s} onClick={() => { setState(s); navigate(`/search?state=${s}`) }}
                  className="text-xs text-white/70 border border-white/20 px-3 py-1 rounded-full hover:bg-white/10 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-slate-100">
            {[
              { value: `${STATS.totalListings.toLocaleString()}+`, label: 'Total Listings', icon: '🏞️' },
              { value: `${STATS.statesCovered}`, label: 'States Covered', icon: '🗺️' },
              { value: `${STATS.activeSellers.toLocaleString()}+`, label: 'Active Sellers', icon: '👨‍🌾' },
              { value: `${STATS.riskReduced}%`, label: 'Risk Reduced via Docs', icon: '🛡️' },
            ].map(stat => (
              <div key={stat.label} className="text-center px-4">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-3xl font-display font-bold text-primary-600">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Land categories */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">Browse by Category</h2>
            <p className="text-slate-500 text-sm">Find the right land for your needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LAND_CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button key={cat.value} onClick={() => navigate(`/search?landType=${cat.value}`)}
                  className={`flex flex-col items-center gap-3 p-6 rounded-2xl font-semibold transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cat.color}`}>
                  <Icon size={28} />
                  <div className="text-center">
                    <div className="text-sm">{cat.label}</div>
                    <div className="text-xs font-normal opacity-70 mt-0.5">{cat.count} listings</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title mb-1">Featured Listings</h2>
              <p className="text-slate-500 text-sm">Handpicked verified properties across India</p>
            </div>
            <button onClick={() => navigate('/search')}
              className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.slice(0, 6).map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">How LandHive Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A simple, transparent process designed to protect both buyers and sellers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-1/3 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-primary-200 -translate-y-1/2" />
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className={`step-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center relative`}>
                  <div className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                    <Icon size={24} />
                  </div>
                  <div className="absolute top-3 right-3 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-400">
                    {i + 1}
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg, #15803d, #16a34a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Own Land? Post for just ₹999 per listing
              </h2>
              <p className="text-white/80 text-lg mb-2">Reach 50,000+ verified buyers. No subscription. Pay only per listing.</p>
              <div className="flex flex-wrap gap-4 mt-4">
                {['✅ No hidden fees', '✅ WhatsApp alerts', '✅ 24-48hr approval', '✅ Admin verified'].map(item => (
                  <span key={item} className="text-white/90 text-sm">{item}</span>
                ))}
              </div>
            </div>
            <div className="shrink-0">
              <button onClick={() => navigate('/post')}
                className="bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl hover:shadow-white/20 hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
                Post Your Land Now
                <ArrowRight size={20} />
              </button>
              <p className="text-center text-white/60 text-xs mt-2">One-time ₹999 · No subscription</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Suresh Babu', role: 'Buyer, Coimbatore', text: 'Found my dream farm land through LandHive. The verification badges gave me complete confidence. Documents were all clear!', stars: 5, avatar: '👨‍🌾' },
              { name: 'Anita Sharma', role: 'Seller, Pune', text: 'Posted my 5 acre plot and got 12 genuine inquiries in the first week. Worth every rupee of the ₹999 listing fee.', stars: 5, avatar: '👩‍💼' },
              { name: 'Gopal Krishnan', role: 'Buyer, Chennai', text: 'The map search feature is brilliant — I could see all listings near my target area with one glance. Saved me so much time.', stars: 5, avatar: '👨‍💻' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <div className="flex gap-1 mb-3">
                  {Array(t.stars).fill(0).map((_, j) => <Star key={j} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-xl">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
