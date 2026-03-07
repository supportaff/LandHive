import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, Shield, ArrowRight, Star, CheckCircle2,
  TreePine, Home as HomeIcon, Building2, Sprout, ChevronRight, MapPinned, Loader2,
} from 'lucide-react'
import ListingCard from '../components/ListingCard'
import LocationSearch from '../components/LocationSearch'
import { LAND_TYPES } from '../data/listings'

const TN_DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy',
  'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Tiruppur',
]

const STEPS = [
  { icon: Search,       title: 'Search & Discover',  desc: 'Filter by district, land type, area, and budget across all 38 districts of Tamil Nadu.',       color: 'bg-blue-50 text-blue-600' },
  { icon: MapPin,       title: 'View on Google Maps', desc: 'See every listing pinned on Google Maps with price labels. Click a pin to preview instantly.', color: 'bg-purple-50 text-purple-600' },
  { icon: Shield,       title: 'Verified Listings',   desc: 'EC, patta, chitta documents verified. Buy with full legal clarity and zero surprises.',         color: 'bg-amber-50 text-amber-600' },
  { icon: CheckCircle2, title: 'Close the Deal',      desc: 'Connect directly with sellers, visit the land, complete registration without any middlemen.', color: 'bg-primary-50 text-primary-600' },
]

const LAND_CATEGORIES = [
  { icon: Sprout,    label: 'Agricultural', value: 'agricultural', count: '2,800+', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { icon: HomeIcon,  label: 'Residential',  value: 'residential',  count: '1,640+', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { icon: Building2, label: 'Commercial',   value: 'commercial',   count: '820+',   color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { icon: TreePine,  label: 'Farm Land',    value: 'farm',         count: '940+',   color: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
]

export default function Home() {
  const [locationText, setLocationText]         = useState('')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [landType, setLandType]                 = useState('')
  const [budget, setBudget]                     = useState('')
  const [featured, setFeatured]                 = useState([])
  const [loading, setLoading]                   = useState(true)
  const navigate = useNavigate()

  // Fetch featured listings from API
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/get-listings?featured=true&limit=6')
        const data = await res.json()
        if (data.listings) {
          const transformed = data.listings.map(l => ({
            id: l.id,
            title: l.title,
            landType: l.land_type,
            area: { value: l.area_value, unit: l.area_unit },
            price: { total: l.price_total, perAcre: l.price_per_acre },
            location: {
              district: l.location_district,
              village: l.location_village,
              state: l.location_state,
            },
            photos: l.photos || [],
            verified: l.verified || false,
            featured: l.featured || false,
          }))
          setFeatured(transformed)
        }
      } catch (error) {
        console.error('Failed to fetch featured listings')
      } finally {
        setLoading(false)
      }
    }

    fetchFeatured()
  }, [])

  const handleSearch = () => {
    const p = new URLSearchParams()
    p.set('state', 'Tamil Nadu')
    if (selectedLocation) {
      p.set('lat',      selectedLocation.lat)
      p.set('lng',      selectedLocation.lng)
      p.set('location', selectedLocation.name)
    } else if (locationText.trim()) {
      p.set('district', locationText.trim())
    }
    if (landType) p.set('landType', landType)
    if (budget)   p.set('maxPrice', budget)
    navigate(`/search?${p.toString()}`)
  }

  return (
    <div className="overflow-x-hidden">

      {/* ===== HERO ===== */}
      <section
        className="relative min-h-screen flex items-center"
        style={{ background: 'linear-gradient(135deg,#14532d 0%,#15803d 40%,#166534 70%,#1a3a2a 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-32 w-[400px] h-[400px] bg-primary-400/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.05) 1px,transparent 0)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-32">
          <div className="max-w-3xl">

            {/* Status pill */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm px-4 py-2 rounded-full mb-6">
              <MapPinned size={14} className="text-amber-400" />
              Tamil Nadu&apos;s #1 Land Marketplace
              <span className="w-px h-3.5 bg-white/20" />
              <span className="text-[11px] text-white/60">More states coming soon</span>
              <ChevronRight size={14} />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              Find Your <br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg,#86efac,#4ade80)' }}>
                Perfect Land
              </span>
            </h1>

            <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl">
              Discover verified agricultural, residential, and commercial land across all 38 districts
              of Tamil Nadu. 6,200+ listings. 100% transparent. Direct from sellers.
            </p>

            {/* ===== SEARCH BOX ===== */}
            <div className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col md:flex-row gap-3">
              <LocationSearch
                value={locationText}
                onChange={e => { setLocationText(e.target.value); setSelectedLocation(null) }}
                onSelect={loc => { setSelectedLocation(loc); setLocationText(loc.name) }}
                placeholder="&#128205; Search location (e.g. Coimbatore, Salem…)"
                inputClassName="flex-1"
              />
              <select
                value={landType}
                onChange={e => setLandType(e.target.value)}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                <option value="">&#127807; Land Type</option>
                {LAND_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="&#128176; Max Budget (e.g. 50L)"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleSearch}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shrink-0 shadow-lg hover:shadow-primary-600/30 active:scale-95">
                <Search size={18} /> Search
              </button>
            </div>

            {/* Popular districts */}
            <div className="flex flex-wrap gap-2 mt-4 items-center">
              <span className="text-xs text-white/50">Popular:</span>
              {['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Trichy'].map(d => (
                <button
                  key={d}
                  onClick={() => navigate(`/search?state=Tamil+Nadu&district=${d}`)}
                  className="text-xs text-white/80 border border-white/20 px-3 py-1 rounded-full hover:bg-white/15 transition-colors">
                  {d}
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

      {/* ===== STATS ===== */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-slate-100">
            {[
              { value: '6,200+', label: 'Listings in Tamil Nadu', emoji: '\uD83C\uDFD8' },
              { value: '38',     label: 'Districts Covered',      emoji: '\uD83D\uDCCD' },
              { value: '1,400+', label: 'Active Sellers',         emoji: '\uD83D\uDC68\u200D\uD83C\uDF3E' },
              { value: '98%',    label: 'Risk Reduced via Docs',  emoji: '\uD83D\uDEE1' },
            ].map(s => (
              <div key={s.label} className="text-center px-4">
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-3xl font-display font-bold text-primary-600">{s.value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="section-title mb-2">Browse by Category</h2>
            <p className="text-slate-500 text-sm">Find the right land across Tamil Nadu</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LAND_CATEGORIES.map(cat => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.value}
                  onClick={() => navigate(`/search?state=Tamil+Nadu&landType=${cat.value}`)}
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

      {/* ===== FEATURED LISTINGS ===== */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title mb-1">Featured Listings</h2>
              <p className="text-slate-500 text-sm">Handpicked verified properties across Tamil Nadu</p>
            </div>
            <button
              onClick={() => navigate('/search?state=Tamil+Nadu')}
              className="flex items-center gap-1 text-sm text-primary-600 font-semibold hover:gap-2 transition-all">
              View All <ArrowRight size={16} />
            </button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-primary-600" />
            </div>
          ) : featured.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <div className="text-4xl mb-3">🏞️</div>
              <p className="text-slate-600 font-medium">No featured listings yet</p>
              <p className="text-sm text-slate-400 mt-1">Check back soon for verified properties</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map(l => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-16 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">How LandHive Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              A simple, transparent process designed to protect both buyers and sellers in Tamil Nadu.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center relative hover:shadow-md transition-shadow">
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

      {/* ===== CTA BANNER ===== */}
      <section className="py-16" style={{ background: 'linear-gradient(135deg,#15803d,#16a34a)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-white">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
                Own Land in Tamil Nadu? List it Today
              </h2>
              <p className="text-white/80 text-lg mb-2">
                Reach 20,000+ active buyers. Flexible pricing plans. Admin verified.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                {[
                  '&#9989; No hidden fees',
                  '&#9989; WhatsApp alerts',
                  '&#9989; 24&#8211;48hr approval',
                  '&#9989; Admin verified',
                ].map((item, i) => (
                  <span key={i} className="text-white/90 text-sm" dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </div>
            </div>
            <div className="shrink-0 text-center">
              <button
                onClick={() => navigate('/post')}
                className="bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl text-lg shadow-2xl hover:-translate-y-1 transition-all duration-200 flex items-center gap-2">
                Post Your Land <ArrowRight size={20} />
              </button>
              <p className="text-white/60 text-xs mt-2">Plans starting at &#8377;1,499 &middot; No subscription required</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-10">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Suresh Babu',    role: 'Buyer, Coimbatore', text: 'Found my dream farm land through LandHive. The verification badges gave me complete confidence. Patta and EC documents were all clear!', stars: 5, avatar: '\uD83D\uDC68\u200D\uD83C\uDF3E' },
              { name: 'Anita Krishnan', role: 'Seller, Salem',     text: 'Posted my 5 acre plot and got 12 genuine inquiries in the first week. Worth every rupee. Very smooth process and great dashboard.',    stars: 5, avatar: '\uD83D\uDC69\u200D\uD83D\uDCBC' },
              { name: 'Gopal Sundaram', role: 'Buyer, Chennai',    text: 'The Google Maps feature is brilliant \u2014 I could see all listings near Trichy with one glance. Saved so much time.',              stars: 5, avatar: '\uD83D\uDC68\u200D\uD83D\uDCBB' },
            ].map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-3">
                  {Array(t.stars).fill(0).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
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

      {/* ===== DISTRICTS STRIP ===== */}
      <section className="py-10 bg-primary-50 border-y border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-primary-700 mb-5">
            &#128205; Land listings available across Tamil Nadu districts
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              'Chennai','Coimbatore','Madurai','Salem','Trichy','Tirunelveli','Erode','Vellore',
              'Thanjavur','Tiruppur','Dindigul','Kanchipuram','Namakkal','Theni','Cuddalore',
              'Pudukkottai','Sivaganga','Virudhunagar','Ramanathapuram','Thoothukudi',
            ].map(d => (
              <button
                key={d}
                onClick={() => navigate(`/search?state=Tamil+Nadu&district=${d}`)}
                className="text-xs px-3 py-1.5 bg-white border border-primary-200 text-primary-700 rounded-full hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all font-medium">
                {d}
              </button>
            ))}
            <span className="text-xs px-3 py-1.5 bg-primary-100 text-primary-500 rounded-full font-medium">+18 more</span>
          </div>
        </div>
      </section>

    </div>
  )
}
