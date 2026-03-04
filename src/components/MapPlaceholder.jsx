import { MapPin } from 'lucide-react'

// Simulated map with marker pins
export default function MapPlaceholder({ listings = [], selectedId, onMarkerClick, height = '100%', showMarkers = true }) {
  return (
    <div className="map-placeholder relative w-full" style={{ height }}>
      {/* Grid overlay already in CSS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/80 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            <MapPin size={28} className="text-primary-600" />
          </div>
          <p className="text-primary-700 font-semibold text-sm">Google Maps Integration</p>
          <p className="text-primary-600 text-xs mt-1">Add GOOGLE_MAPS_API_KEY to .env</p>
        </div>
      </div>

      {/* Simulated marker pins */}
      {showMarkers && listings.map((listing, i) => {
        const left = 10 + (i * 15) % 80
        const top = 15 + (i * 23) % 65
        const isSelected = listing.id === selectedId
        return (
          <button
            key={listing.id}
            onClick={() => onMarkerClick && onMarkerClick(listing)}
            className={`absolute z-10 transition-all duration-200 ${isSelected ? 'scale-125 z-20' : 'hover:scale-110'}`}
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            <div className={`map-marker relative text-xs font-bold px-2 py-1 rounded-full shadow-lg
              ${isSelected ? 'bg-primary-700 ring-2 ring-white' : 'bg-primary-600'}
              text-white whitespace-nowrap`}>
              ₹{listing.price.total >= 10000000
                ? `${(listing.price.total / 10000000).toFixed(1)}Cr`
                : `${(listing.price.total / 100000).toFixed(0)}L`}
            </div>
          </button>
        )
      })}
    </div>
  )
}
