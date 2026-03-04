import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Filter, MapPin, SlidersHorizontal, X, BadgeCheck, Eye, MessageCircle } from 'lucide-react'
import MapPlaceholder from '../components/MapPlaceholder'
import { LISTINGS, STATES, LAND_TYPES, formatPrice, formatArea } from '../data/listings'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    state: searchParams.get('state') || '',
    district: '',
    landType: searchParams.get('landType') || '',
    minArea: '',
    maxArea: '',
    minPrice: '',
    maxPrice: searchParams.get('maxPrice') || '',
    verifiedOnly: false,
  })
  const [selectedId, setSelectedId] = useState(null)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = LISTINGS.filter(l => {
    if (filters.state && l.location.state !== filters.state) return false
    if (filters.district && !l.location.district.toLowerCase().includes(filters.district.toLowerCase())) return false
    if (filters.landType && l.landType !== filters.landType) return false
    if (filters.verifiedOnly && !l.verified) return false
    if (filters.minPrice && l.price.total < Number(filters.minPrice) * 100000) return false
    if (filters.maxPrice && l.price.total > Number(filters.maxPrice) * 100000) return false
    return true
  })

  const updateFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))
  const clearFilters = () => setFilters({ state: '', district: '', landType: '', minArea: '', maxArea: '', minPrice: '', maxPrice: '', verifiedOnly: false })

  const activeCount = Object.values(filters).filter(v => v && v !== false).length

  const FilterPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-primary-600" />
          Filters
          {activeCount > 0 && (
            <span className="badge badge-green">{activeCount}</span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      <div>
        <label className="label">State</label>
        <select value={filters.state} onChange={e => updateFilter('state', e.target.value)} className="input text-sm">
          <option value="">All States</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="label">District</label>
        <input type="text" placeholder="e.g. Coimbatore" value={filters.district} onChange={e => updateFilter('district', e.target.value)} className="input text-sm" />
      </div>

      <div>
        <label className="label">Land Type</label>
        <select value={filters.landType} onChange={e => updateFilter('landType', e.target.value)} className="input text-sm">
          <option value="">All Types</option>
          {LAND_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Min Price (₹L)</label>
          <input type="number" placeholder="0" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="input text-sm" />
        </div>
        <div>
          <label className="label">Max Price (₹L)</label>
          <input type="number" placeholder="Any" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="input text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
        <input type="checkbox" id="verified" checked={filters.verifiedOnly}
          onChange={e => updateFilter('verifiedOnly', e.target.checked)}
          className="w-4 h-4 accent-primary-600" />
        <label htmlFor="verified" className="text-sm font-medium text-primary-700 cursor-pointer flex items-center gap-1">
          <BadgeCheck size={15} className="text-primary-600" />
          Verified Listings Only
        </label>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen pt-[72px]" style={{ height: '100dvh' }}>
      {/* Left Panel */}
      <div className="w-[340px] shrink-0 flex flex-col border-r border-slate-100 bg-white overflow-hidden">
        {/* Filter header */}
        <div className="p-4 border-b border-slate-100">
          <FilterPanel />
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">{filtered.length} listings found</span>
            <button onClick={() => setShowFilters(!showFilters)} className="md:hidden text-xs text-primary-600 flex items-center gap-1">
              <Filter size={12} /> Filters
            </button>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🏞️</div>
              <p className="text-slate-500 text-sm">No listings match your filters</p>
              <button onClick={clearFilters} className="mt-3 text-primary-600 text-sm font-medium">Clear filters</button>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(listing => (
                <MiniCard
                  key={listing.id}
                  listing={listing}
                  isSelected={listing.id === selectedId}
                  onClick={() => setSelectedId(listing.id === selectedId ? null : listing.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Panel */}
      <div className="flex-1 relative">
        {/* Result count overlay */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md border border-slate-100">
          <span className="text-sm font-semibold text-slate-700">{filtered.length} properties on map</span>
        </div>

        <MapPlaceholder
          listings={filtered}
          selectedId={selectedId}
          onMarkerClick={(l) => setSelectedId(l.id === selectedId ? null : l.id)}
          height="100%"
        />

        {/* Selected listing info window */}
        {selectedId && (() => {
          const listing = filtered.find(l => l.id === selectedId)
          if (!listing) return null
          return (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-80">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="flex">
                  <img src={listing.photos[0]} alt="" className="w-28 h-24 object-cover shrink-0" />
                  <div className="p-3 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1">{listing.title}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {listing.location.district}, {listing.location.state}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-primary-600 text-base">{formatPrice(listing.price.total)}</span>
                      <Link to={`/listing/${listing.id}`}
                        className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary-700">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function MiniCard({ listing, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 cursor-pointer transition-all duration-150 ${isSelected ? 'bg-primary-50 border-l-3 border-primary-600' : 'hover:bg-slate-50'}`}
      style={{ borderLeft: isSelected ? '3px solid #16a34a' : '3px solid transparent' }}
    >
      <div className="flex gap-3">
        <div className="relative shrink-0">
          <img src={listing.photos[0]} alt="" className="w-20 h-16 object-cover rounded-lg" />
          {listing.verified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
              <BadgeCheck size={11} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">{listing.title}</p>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin size={10} /> {listing.location.district}
          </p>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-sm font-bold text-primary-600">{formatPrice(listing.price.total)}</span>
            <span className="text-xs text-slate-400">{formatArea(listing.area)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
