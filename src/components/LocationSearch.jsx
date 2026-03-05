import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin } from 'lucide-react'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function LocationSearch({
  onSelect,
  placeholder = 'Search location in Tamil Nadu…',
  inputClassName = '',
  value,
  onChange,
}) {
  const inputRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key') return
    const loader = new Loader({
      apiKey: MAPS_KEY,
      version: 'weekly',
      libraries: ['places'],
    })
    loader.load().then(() => setReady(true)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!ready || !inputRef.current) return
    const G = window.google.maps.places

    const ac = new G.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['geometry', 'formatted_address', 'name'],
      types: ['geocode'],
    })

    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (place?.geometry?.location) {
        const name = place.formatted_address || place.name
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        onSelect({ name, lat, lng })
        if (onChange) onChange({ target: { value: name } })
      }
    })

    return () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.removeListener(listener)
      }
    }
  }, [ready])

  return (
    <div className="relative w-full">
      <MapPin
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-3 border border-slate-200 rounded-xl py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white transition-all ${inputClassName}`}
      />
    </div>
  )
}
