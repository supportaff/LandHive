import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { MapPin } from 'lucide-react'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// @googlemaps/js-api-loader is a singleton internally — safe to instantiate per component
function makeLoader() {
  if (!MAPS_KEY || MAPS_KEY === 'your_google_maps_api_key') return null
  return new Loader({
    apiKey: MAPS_KEY,
    version: 'weekly',
    libraries: ['places'],
  })
}

const PIN_PATH =
  'M-14,-7 L14,-7 Q16,-7 16,-5 L16,5 Q16,7 14,7 L2,7 L0,12 L-2,7 L-14,7 Q-16,7 -16,5 L-16,-5 Q-16,-7 -14,-7 Z'

export default function GoogleMapView({
  listings = [],
  selectedId = null,
  onMarkerClick,
  height = '100%',
  singleMarker = null,
  mode = 'search',
  onMapClick = null,
  center = null,
}) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const iwRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [errMsg, setErrMsg] = useState('')

  /* ---- 1. Load Google Maps ---- */
  useEffect(() => {
    const loader = makeLoader()
    if (!loader) {
      setStatus('error')
      setErrMsg(
        'VITE_GOOGLE_MAPS_API_KEY is not set.\nGo to Vercel → Project → Settings → Environment Variables and add VITE_GOOGLE_MAPS_API_KEY, then redeploy.'
      )
      return
    }
    loader
      .load()
      .then(() => setStatus('ready'))
      .catch(e => {
        setStatus('error')
        setErrMsg('Google Maps failed to load: ' + (e?.message || 'Check your API key and enabled APIs.'))
      })
  }, [])

  /* ---- 2. Init map once ready ---- */
  useEffect(() => {
    if (status !== 'ready' || !containerRef.current || mapRef.current) return
    const G = window.google.maps

    const initCenter = center
      ? { lat: center.lat, lng: center.lng }
      : singleMarker
      ? { lat: singleMarker.lat, lng: singleMarker.lng }
      : { lat: 11.1271, lng: 78.6569 } // Tamil Nadu

    mapRef.current = new G.Map(containerRef.current, {
      center: initCenter,
      zoom: singleMarker ? 15 : center ? 12 : 7,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      clickableIcons: false,
      styles: [
        { featureType: 'poi.business', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        { featureType: 'poi.park', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
      ],
    })

    iwRef.current = new G.InfoWindow({ maxWidth: 210 })

    // Single pin (listing detail)
    if (singleMarker) {
      const pin = new G.Marker({
        position: { lat: singleMarker.lat, lng: singleMarker.lng },
        map: mapRef.current,
        title: singleMarker.title || '',
        icon: {
          path: G.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#16a34a',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2.5,
        },
        animation: G.Animation.DROP,
      })
      if (singleMarker.title) {
        const iw = new G.InfoWindow({
          content: `<div style="font-family:system-ui;font-size:13px;font-weight:600;padding:4px 6px;color:#1e293b">${singleMarker.title}</div>`,
        })
        pin.addListener('click', () => iw.open(mapRef.current, pin))
      }
    }

    // Picker mode (post listing)
    if (mode === 'picker' && onMapClick) {
      mapRef.current.addListener('click', e =>
        onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      )
    }
  }, [status])

  /* ---- 3. Pan to new center ---- */
  useEffect(() => {
    if (!mapRef.current || !center) return
    mapRef.current.panTo({ lat: center.lat, lng: center.lng })
    mapRef.current.setZoom(12)
  }, [center?.lat, center?.lng])

  /* ---- 4. Render listing markers ---- */
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current || singleMarker) return
    const G = window.google.maps

    markersRef.current.forEach(m => m.setMap(null))
    markersRef.current = []

    const bounds = new G.LatLngBounds()
    const valid = listings.filter(l => l.location?.lat && l.location?.lng)

    valid.forEach((listing, idx) => {
      const pos = { lat: listing.location.lat, lng: listing.location.lng }
      bounds.extend(pos)

      const p = listing.price.total
      const priceLabel = p >= 1e7 ? `\u20B9${(p / 1e7).toFixed(1)}Cr` : `\u20B9${(p / 1e5).toFixed(0)}L`
      const isSel = listing.id === selectedId

      const marker = new G.Marker({
        position: pos,
        map: mapRef.current,
        label: { text: priceLabel, color: '#fff', fontSize: '11px', fontWeight: '700' },
        icon: {
          path: PIN_PATH,
          fillColor: isSel ? '#15803d' : '#16a34a',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: isSel ? 2 : 1.5,
          scale: 1,
          anchor: new G.Point(0, 12),
          labelOrigin: new G.Point(0, 0),
        },
        zIndex: isSel ? 999 : idx,
      })

      marker.addListener('click', () => {
        if (onMarkerClick) onMarkerClick(listing)
        const imgHtml = listing.photos?.[0]
          ? `<img src="${listing.photos[0]}" style="width:100%;height:84px;object-fit:cover;border-radius:8px 8px 0 0;display:block"/>`
          : ''
        iwRef.current.setContent(`
          <div style="font-family:system-ui,sans-serif;max-width:195px;overflow:hidden">
            ${imgHtml}
            <div style="padding:10px">
              <p style="margin:0 0 3px;font-weight:600;font-size:12px;color:#1e293b;line-height:1.35">${listing.title}</p>
              <p style="margin:0 0 8px;color:#16a34a;font-weight:700;font-size:14px">${priceLabel}</p>
              <a href="/listing/${listing.id}" style="display:block;background:#16a34a;color:#fff;text-align:center;padding:7px;border-radius:7px;text-decoration:none;font-size:12px;font-weight:600">
                View Details &#8594;
              </a>
            </div>
          </div>`)
        iwRef.current.open(mapRef.current, marker)
      })

      markersRef.current.push(marker)
    })

    if (!center) {
      if (valid.length > 1) mapRef.current.fitBounds(bounds, { padding: 60 })
      else if (valid.length === 1) {
        mapRef.current.setCenter(bounds.getCenter())
        mapRef.current.setZoom(13)
      }
    }
  }, [status, listings])

  /* ---- 5. Update selected marker style ---- */
  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return
    const G = window.google.maps
    const valid = listings.filter(l => l.location?.lat && l.location?.lng)
    markersRef.current.forEach((m, i) => {
      const l = valid[i]
      if (!l) return
      const isSel = l.id === selectedId
      m.setIcon({
        path: PIN_PATH,
        fillColor: isSel ? '#15803d' : '#16a34a',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: isSel ? 2 : 1.5,
        scale: isSel ? 1.15 : 1,
        anchor: new G.Point(0, 12),
        labelOrigin: new G.Point(0, 0),
      })
      m.setZIndex(isSel ? 999 : i)
    })
  }, [selectedId])

  /* ---- Render states ---- */
  if (status === 'error')
    return (
      <div
        className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-green-50"
        style={{ height }}>
        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-3 shadow border border-slate-100">
          <MapPin size={24} className="text-primary-400" />
        </div>
        <p className="text-slate-600 font-semibold text-sm text-center px-6 max-w-xs whitespace-pre-line">{errMsg}</p>
      </div>
    )

  if (status === 'loading')
    return (
      <div className="w-full flex items-center justify-center bg-slate-100" style={{ height }}>
        <div className="text-center">
          <div className="w-8 h-8 border-[3px] border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-slate-400 text-xs font-medium">Loading Google Maps&hellip;</p>
        </div>
      </div>
    )

  return <div ref={containerRef} className="w-full" style={{ height }} />
}
