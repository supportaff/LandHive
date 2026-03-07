import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { MapPin, SlidersHorizontal, X, BadgeCheck, LayoutList, Map, Navigation, Search as SearchIcon, Loader2 } from 'lucide-react'
import GoogleMapView from '../components/GoogleMapView'
import { STATES, LAND_TYPES, formatPrice, formatArea } from '../data/listings'

export default function Search() {
  const [searchParams] = useSearchParams()

  const urlLat      = searchParams.get('lat')
  const urlLng      = searchParams.get('lng')
  const urlLocation = searchParams.get('location')
  const [mapCenter, setMapCenter] = useState(
    urlLat && urlLng ? { lat: parseFloat(urlLat), lng: parseFloat(urlLng) } : null
  )

  const [filters, setFilters] = useState({
    state:        searchParams.get('state')    || '',
    district:     searchParams.get('district') || '',
    landType:     searchParams.get('landType') || '',
    minPrice:     '',
    maxPrice:     searchParams.get('maxPrice') || '',
    verifiedOnly: false,
  })
  const [selectedId, setSelectedId] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [showFilters, setShowFilters] = useState(false)
  const [locationInput, setLocationInput] = useState(urlLocation || '')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const locationInputRef = useRef(null)
  const autocompleteRef = useRef(null)

  // Google Places Autocomplete
  useEffect(() => {
    if (!window.google?.maps?.places || !locationInputRef.current) return
    
    const autocomplete = new window.google.maps.places.Autocomplete(
      locationInputRef.current,
      { types: ['(cities)'], componentRestrictions: { country: 'in' } }
    )

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (!place.geometry?.location) return
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      setMapCenter({ lat, lng })
      setLocationInput(place.formatted_address || place.name || '')
      setMobileView('map')
    })

    autocompleteRef.current = autocomplete
  }, [])

  // Fetch listings from Supabase API
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.state) params.append('state', filters.state)
        if (filters.district) params.append('district', filters.district)
        if (filters.landType) params.append('landType', filters.landType)
        if (filters.minPrice) params.append('minPrice', Number(filters.minPrice) * 100000)
        if (filters.maxPrice) params.append('maxPrice', Number(filters.maxPrice) * 100000)
        if (filters.verifiedOnly) params.append('featured', 'true')
        if (mapCenter) {
          params.append('lat', mapCenter.lat)
          params.append('lng', mapCenter.lng)
          params.append('radius', '50')
        }

        const res = await fetch(`/api/get-listings?${params.toString()}`)
        const data = await res.json()
        
        if (data.listings) {
          // Transform Supabase data to match old format
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
              lat: l.location_lat,
              lng: l.location_lng,
            },
            photos: l.photos || [],
            verified: l.verified || false,
            featured: l.featured || false,
            viewCount: l.view_count || 0,
            createdAt: l.created_at,
          }))
          setListings(transformed)
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [filters, mapCenter])

  const update = (k, v) => setFilters(f => ({ ...f, [k]: v }))
  const clear  = () => {
    setFilters({ state: '', district: '', landType: '', minPrice: '', maxPrice: '', verifiedOnly: false })
    setLocationInput('')
    setMapCenter(null)
  }
  const activeCount = Object.values(filters).filter(v => v && v !== false).length

  const FiltersUI = () => (
    <div className="space-y-3 p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
          <SlidersHorizontal size={14} className="text-primary-600" />
          Filters
          {activeCount > 0 && (
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-bold">{activeCount}</span>
          )}
        </h3>
        {activeCount > 0 && (
          <button onClick={clear} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1 font-medium">
            <X size={11} /> Clear all
          </button>
        )}
      </div>

      <div>
        <label className="label">Search Location</label>
        <div className="relative">
          <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            ref={locationInputRef}
            type="text"
            placeholder="e.g. Coimbatore, Chennai..."
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            className="input text-sm pl-9"
          />
        </div>
        {locationInput && (
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Navigation size={10} className="text-primary-500" />
            Showing listings near this location
          </p>
        )}
      </div>

      <div>
        <label className="label">State</label>
        <select value={filters.state} onChange={e => update('state', e.target.value)} className="input text-sm">
          <option value="">All States</option>
          {STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="label">District</label>
        <input type="text" placeholder="e.g. Coimbatore" value={filters.district}
          onChange={e => update('district', e.target.value)} className="input text-sm" />
      </div>
      <div>
        <label className="label">Land Type</label>
        <select value={filters.landType} onChange={e => update('landType', e.target.value)} className="input text-sm">
          <option value="">All Types</option>
          {LAND_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Min (₹L)</label>
          <input type="number" placeholder="0" value={filters.minPrice}
            onChange={e => update('minPrice', e.target.value)} className="input text-sm" />
        </div>
        <div>
          <label className="label">Max (₹L)</label>
          <input type="number" placeholder="Any" value={filters.maxPrice}
            onChange={e => update('maxPrice', e.target.value)} className="input text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2.5 p-2.5 bg-primary-50 rounded-xl">
        <input type="checkbox" id="ver" checked={filters.verifiedOnly}
          onChange={e => update('verifiedOnly', e.target.checked)} className="w-4 h-4 accent-primary-600" />
        <label htmlFor="ver" className="text-xs font-semibold text-primary-700 cursor-pointer flex items-center gap-1.5">
          <BadgeCheck size={13} className="text-primary-600" /> Verified Only
        </label>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col" style={{ height: '100dvh', paddingTop: 64 }}>
      <div className="md:hidden flex items-center justify-between px-3 py-2.5 bg-white border-b border-slate-100 shadow-sm shrink-0">
        <span className="text-sm font-bold text-slate-700">{listings.length} listings</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
              ${showFilters ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-700 border-slate-200'}`}>
            <SlidersHorizontal size={12} /> Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            <button
              onClick={() => setMobileView('list')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all
                ${mobileView === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600'}`}>
              <LayoutList size={13} />
              <span className="hidden xs:inline">List</span>
            </button>
            <button
              onClick={() => setMobileView('map')}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold transition-all
                ${mobileView === 'map' ? 'bg-primary-600 text-white' : 'bg-white text-slate-600'}`}>
              <Map size={13} />
              <span className="hidden xs:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="md:hidden bg-white border-b border-slate-200 shadow-lg z-30 shrink-0 overflow-y-auto max-h-[70vh]">
          <FiltersUI />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className={`
          md:w-[340px] lg:w-[380px] md:shrink-0 md:flex md:flex-col md:border-r md:border-slate-100 md:bg-white md:overflow-hidden
          ${mobileView === 'list' ? 'flex flex-col w-full' : 'hidden'}
        `}>
          <div className="hidden md:block border-b border-slate-100 overflow-y-auto">
            <FiltersUI />
          </div>
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-slate-500">{listings.length} listings found</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={24} className="animate-spin text-primary-600" />
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-6">
                <div className="text-4xl sm:text-5xl mb-4">🏞️</div>
                <p className="text-slate-500 text-sm font-medium">No listings match your filters</p>
                <button onClick={clear} className="mt-3 text-primary-600 text-sm font-semibold hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {listings.map(l => (
                  <MiniCard
                    key={l.id}
                    listing={l}
                    isSelected={l.id === selectedId}
                    onClick={() => { setSelectedId(l.id === selectedId ? null : l.id); setMobileView('map') }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`
          flex-1 relative
          ${mobileView === 'map' ? 'flex flex-col w-full' : 'hidden md:block'}
        `}>
          <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-md border border-slate-100 pointer-events-none">
            <span className="text-xs font-bold text-slate-700">{listings.length} on map</span>
          </div>

          <GoogleMapView
            listings={listings}
            selectedId={selectedId}
            onMarkerClick={l => setSelectedId(l.id === selectedId ? null : l.id)}
            height="100%"
            center={mapCenter}
          />

          {selectedId && (() => {
            const l = listings.find(x => x.id === selectedId)
            if (!l) return null
            return (
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(340px,calc(100vw-20px))] sm:w-[min(360px,calc(100vw-32px))]">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/30 hover:bg-black/40 rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
                    <X size={13} className="text-white" strokeWidth={2.5} />
                  </button>
                  <div className="flex">
                    {l.photos[0] && <img src={l.photos[0]} alt="" className="w-24 sm:w-28 h-20 sm:h-24 object-cover shrink-0" />}
                    <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug pr-5">{l.title}</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <MapPin size={9} /> {l.location.district}, {l.location.state}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span className="font-bold text-primary-600 text-sm sm:text-base">{formatPrice(l.price.total)}</span>
                        <Link
                          to={`/listing/${l.id}`}
                          className="text-[11px] sm:text-xs bg-primary-600 text-white px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors shrink-0">
                          View →
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
    </div>
  )
}

function MiniCard({ listing, isSelected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`p-2.5 sm:p-3 cursor-pointer transition-all duration-150 active:bg-slate-100 ${isSelected ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
      style={{ borderLeft: `3px solid ${isSelected ? '#16a34a' : 'transparent'}` }}>
      <div className="flex gap-2.5 sm:gap-3">
        <div className="relative shrink-0">
          {listing.photos[0] && <img src={listing.photos[0]} alt="" className="w-20 sm:w-24 h-14 sm:h-16 object-cover rounded-xl" />}
          {listing.verified && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
              <BadgeCheck size={11} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">{listing.title}</p>
          <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-0.5 sm:mt-1">
            <MapPin size={9} /> {listing.location.district}, {listing.location.state}
          </p>
          <div className="flex items-center justify-between mt-1.5 gap-1">
            <span className="text-sm sm:text-base font-bold text-primary-600">{formatPrice(listing.price.total)}</span>
            <span className="text-[10px] sm:text-xs text-slate-400 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">{formatArea(listing.area)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
