import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
let _mapsPromise = null

function loadGMaps() {
  if (!_mapsPromise) {
    _mapsPromise = new Promise((resolve, reject) => {
      if (window.google?.maps) { resolve(window.google.maps); return }
      const cb = '__gmCB' + Date.now()
      window[cb] = () => resolve(window.google.maps)
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&callback=${cb}&libraries=places`
      s.async = true
      s.defer = true
      s.onerror = () => {
        _mapsPromise = null
        reject(new Error('Failed to load Google Maps'))
      }
      document.head.appendChild(s)
    })
  }
  return _mapsPromise
}

export default function GoogleMapView({
  listings = [],
  selectedId = null,
  onMarkerClick,
  height = '100%',
  singleMarker = null,
  mode = 'search',
  onMapClick = null,
}) {
  const ref = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const iwRef = useRef(null)
  const pickerMarkerRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key') {
      setErr('Add VITE_GOOGLE_MAPS_API_KEY to .env (Vercel dashboard)')
      return
    }
    loadGMaps().then(() => setReady(true)).catch(e => setErr(e.message))
  }, [])

  // Init map
  useEffect(() => {
    if (!ready || !ref.current) return
    const G = window.google.maps
    const center = singleMarker
      ? { lat: singleMarker.lat, lng: singleMarker.lng }
      : { lat: 20.5937, lng: 78.9629 }
    mapRef.current = new G.Map(ref.current, {
      center,
      zoom: singleMarker ? 14 : 5,
      mapTypeControl: mode === 'detail',
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
      ],
    })
    iwRef.current = new G.InfoWindow()

    if (singleMarker) {
      new G.Marker({
        position: { lat: singleMarker.lat, lng: singleMarker.lng },
        map: mapRef.current,
        title: singleMarker.title || '',
        icon: {
          path: G.SymbolPath.CIRCLE,
          scale: 11,
          fillColor: '#16a34a',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2.5,
        },
        animation: G.Animation.DROP,
      })
    }

    if (mode === 'picker' && onMapClick) {
      mapRef.current.addListener('click', e => {
        const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() }
        onMapClick(pos)
        if (pickerMarkerRef.current) pickerMarkerRef.current.setMap(null)
        pickerMarkerRef.current = new G.Marker({
          position: pos,
          map: mapRef.current,
          animation: G.Animation.DROP,
          icon: {
            path: G.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#16a34a',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        })
      })
    }
  }, [ready])

  // Render listing markers
  useEffect(() => {
    if (!ready || !mapRef.current || singleMarker) return
    const G = window.google.maps
    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []
    const bounds = new G.LatLngBounds()
    const valid = listings.filter(l => l.location?.lat && l.location?.lng)
    valid.forEach((listing, idx) => {
      const pos = { lat: listing.location.lat, lng: listing.location.lng }
      bounds.extend(pos)
      const p = listing.price.total
      const label = p >= 1e7 ? `\u20B9${(p / 1e7).toFixed(1)}Cr` : `\u20B9${(p / 1e5).toFixed(0)}L`
      const isSel = listing.id === selectedId
      const pinPath = 'M-14,-7 L14,-7 Q16,-7 16,-5 L16,5 Q16,7 14,7 L2,7 L0,12 L-2,7 L-14,7 Q-16,7 -16,5 L-16,-5 Q-16,-7 -14,-7 Z'
      const marker = new G.Marker({
        position: pos,
        map: mapRef.current,
        label: { text: label, color: '#fff', fontSize: '11px', fontWeight: '700' },
        icon: {
          path: pinPath,
          fillColor: isSel ? '#15803d' : '#16a34a',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 1.5,
          scale: 1,
          anchor: new G.Point(0, 12),
          labelOrigin: new G.Point(0, 0),
        },
        zIndex: isSel ? 999 : idx,
      })
      marker.addListener('click', () => {
        if (onMarkerClick) onMarkerClick(listing)
        const img = listing.photos?.[0]
          ? `<img src="${listing.photos[0]}" style="width:100%;height:80px;object-fit:cover;border-radius:8px 8px 0 0;display:block"/>`
          : ''
        iwRef.current.setContent(`
          <div style="font-family:system-ui,sans-serif;max-width:190px">
            ${img}
            <div style="padding:10px">
              <p style="margin:0 0 3px;font-weight:600;font-size:12px;color:#1e293b;line-height:1.3">${listing.title}</p>
              <p style="margin:0 0 8px;color:#16a34a;font-weight:700;font-size:15px">${label}</p>
              <a href="/listing/${listing.id}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:6px;border-radius:7px;text-decoration:none;font-size:12px;font-weight:600">View Details &#8594;</a>
            </div>
          </div>`)
        iwRef.current.open(mapRef.current, marker)
      })
      markersRef.current.push(marker)
    })
    if (valid.length > 1) mapRef.current.fitBounds(bounds, { padding: 60 })
    else if (valid.length === 1) { mapRef.current.setCenter(bounds.getCenter()); mapRef.current.setZoom(13) }
  }, [ready, listings])

  // Update selected marker style
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const G = window.google.maps
    const pinPath = 'M-14,-7 L14,-7 Q16,-7 16,-5 L16,5 Q16,7 14,7 L2,7 L0,12 L-2,7 L-14,7 Q-16,7 -16,5 L-16,-5 Q-16,-7 -14,-7 Z'
    const valid = listings.filter(l => l.location?.lat && l.location?.lng)
    markersRef.current.forEach((marker, i) => {
      const listing = valid[i]
      if (!listing) return
      const isSel = listing.id === selectedId
      marker.setIcon({
        path: pinPath,
        fillColor: isSel ? '#15803d' : '#16a34a',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: isSel ? 2 : 1.5,
        scale: isSel ? 1.15 : 1,
        anchor: new G.Point(0, 12),
        labelOrigin: new G.Point(0, 0),
      })
      marker.setZIndex(isSel ? 999 : i)
    })
  }, [selectedId])

  if (err) return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-green-50 flex flex-col items-center justify-center" style={{ height }}>
      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-3 shadow-sm border border-slate-100">
        <MapPin size={26} className="text-primary-500" />
      </div>
      <p className="text-slate-600 font-semibold text-sm text-center px-8">{err}</p>
      <p className="text-slate-400 text-xs mt-2 text-center px-8">Go to Vercel &#8594; Project Settings &#8594; Environment Variables</p>
    </div>
  )

  if (!ready) return (
    <div className="w-full bg-slate-100 flex items-center justify-center" style={{ height }}>
      <div className="text-center">
        <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-slate-400 text-xs font-medium">Loading map&hellip;</p>
      </div>
    </div>
  )

  return <div ref={ref} className="w-full" style={{ height }} />
}
