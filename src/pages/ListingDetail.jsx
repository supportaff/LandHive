import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { MapPin, ChevronRight, BadgeCheck, Eye, MessageCircle, Phone, Share2,
  Heart, Ruler, FileText, User, CheckCircle, XCircle, Calendar,
  Building, ArrowLeft, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react'
import { LISTINGS, formatPrice, formatArea } from '../data/listings'
import { useAuth } from '../hooks/useAuth'
import MapPlaceholder from '../components/MapPlaceholder'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const listing = LISTINGS.find(l => l.id === id) || LISTINGS[0]
  const [photoIdx, setPhotoIdx] = useState(0)
  const [showContact, setShowContact] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleContact = () => {
    if (!user) { navigate('/sign-in'); return }
    setShowContact(true)
  }

  const typeColors = {
    agricultural: 'bg-green-100 text-green-700',
    residential: 'bg-blue-100 text-blue-700',
    commercial: 'bg-purple-100 text-purple-700',
    farm: 'bg-emerald-100 text-emerald-700',
    na: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-24">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight size={14} />
        <Link to="/search" className="hover:text-primary-600">Search</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800 font-medium truncate max-w-[200px]">{listing.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photo carousel */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-100">
              <img src={listing.photos[photoIdx]} alt={listing.title}
                className="w-full h-full object-cover" />
              {listing.verified && (
                <div className="absolute top-4 left-4 flex items-center gap-1 bg-primary-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg">
                  <BadgeCheck size={15} /> Verified Property
                </div>
              )}
              <button onClick={() => setSaved(!saved)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                <Heart size={18} className={saved ? 'fill-red-500 text-red-500' : 'text-slate-500'} />
              </button>

              {/* Nav arrows */}
              {listing.photos.length > 1 && (
                <>
                  <button onClick={() => setPhotoIdx(i => (i - 1 + listing.photos.length) % listing.photos.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setPhotoIdx(i => (i + 1) % listing.photos.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center">
                    <ChevronRightIcon size={18} />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {photoIdx + 1} / {listing.photos.length}
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 mt-2">
              {listing.photos.map((p, i) => (
                <button key={i} onClick={() => setPhotoIdx(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === photoIdx ? 'border-primary-500 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Title section */}
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-800 leading-tight">
                {listing.title}
              </h1>
              <button className="shrink-0 w-9 h-9 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50">
                <Share2 size={16} className="text-slate-500" />
              </button>
            </div>
            <p className="text-slate-500 flex items-center gap-1.5 text-sm">
              <MapPin size={15} className="text-primary-500" />
              {listing.location.village}, {listing.location.district}, {listing.location.state}
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`badge capitalize ${typeColors[listing.landType]}`}>{listing.landType}</span>
            <span className="badge bg-slate-100 text-slate-600">📐 {formatArea(listing.area)}</span>
            <span className="badge bg-slate-100 text-slate-600">📋 {listing.location.surveyNumber}</span>
            {listing.verified && <span className="badge badge-green"><BadgeCheck size={12} />Verified</span>}
            <span className="badge bg-slate-100 text-slate-400">👁 {listing.viewCount} views</span>
          </div>

          {/* 2x2 Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Price', value: formatPrice(listing.price.total), icon: '💰', highlight: true },
              { label: 'Per Acre', value: formatPrice(listing.price.perAcre), icon: '📊' },
              { label: 'Land Type', value: listing.landType.charAt(0).toUpperCase() + listing.landType.slice(1), icon: '🌱' },
              { label: 'District', value: listing.location.district, icon: '📍' },
            ].map(item => (
              <div key={item.label} className={`p-4 rounded-xl border ${item.highlight ? 'bg-primary-50 border-primary-200' : 'bg-slate-50 border-slate-200'}`}>
                <p className="text-xs text-slate-500 mb-1">{item.icon} {item.label}</p>
                <p className={`font-bold text-lg ${item.highlight ? 'text-primary-600' : 'text-slate-800'}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-primary-600" /> Description
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">{listing.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <Calendar size={13} />
                Listed on {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Map */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <MapPin size={16} className="text-primary-600" /> Location on Map
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{listing.location.address}</p>
            </div>
            <MapPlaceholder listings={[listing]} height="250px" showMarkers={true} />
          </div>

          {/* Nearby amenities */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-800 mb-3">Nearby Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(listing.nearbyAmenities).map(([key, val]) => (
                <span key={key} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-xs px-3 py-2 rounded-xl">
                  {key === 'highway' ? '🛣️' : key === 'town' ? '🏘️' : '🚂'} {val}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-sm text-slate-500 mb-1">Total Price</p>
              <p className="text-4xl font-display font-bold text-primary-600 mb-0.5">
                {formatPrice(listing.price.total)}
              </p>
              <p className="text-sm text-slate-500">
                {formatPrice(listing.price.perAcre)} per acre · {formatArea(listing.area)}
              </p>

              <div className="mt-5 space-y-3">
                {showContact ? (
                  <div className="bg-primary-50 rounded-xl p-4 border border-primary-200">
                    <p className="text-xs text-primary-600 font-medium mb-2">Seller Contact</p>
                    <p className="font-bold text-slate-800">{listing.sellerPhone}</p>
                    <a href={`https://wa.me/${listing.sellerPhone.replace(/\D/g, '')}?text=Hi, I'm interested in your listing: ${listing.title} on LandHive`}
                      target="_blank" rel="noopener noreferrer"
                      className="mt-3 w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp Seller
                    </a>
                  </div>
                ) : (
                  <button onClick={handleContact}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary-600/30 hover:-translate-y-0.5">
                    <Phone size={18} />
                    {user ? 'View Seller Contact' : 'Login to View Contact'}
                  </button>
                )}

                <button className="w-full border-2 border-slate-200 hover:border-primary-300 text-slate-700 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-sm">
                  <MessageCircle size={16} />
                  Send Inquiry
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><Eye size={12} />{listing.viewCount} views</span>
                <span className="flex items-center gap-1"><MessageCircle size={12} />{listing.inquiryCount} inquiries</span>
              </div>
            </div>

            {/* Seller info */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <User size={16} className="text-primary-600" /> Seller Information
              </h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                  {listing.sellerName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">{listing.sellerName}</p>
                  <p className="text-xs text-slate-500">Member since {listing.sellerSince}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                <span>📋 {listing.sellerListings} listings</span>
                <span>✅ Verified seller</span>
              </div>
            </div>

            {/* Verification checklist */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-3">Document Verification</h3>
              <div className="space-y-2">
                {[
                  { key: 'ec', label: 'Encumbrance Certificate (EC)' },
                  { key: 'survey', label: 'Survey Settlement Register' },
                  { key: 'ftl', label: 'FTL / Buffer Zone Clearance' },
                ].map(doc => {
                  const ok = listing.verificationDocs[doc.key]
                  return (
                    <div key={doc.key} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${ok ? 'bg-primary-50' : 'bg-slate-50'}`}>
                      {ok
                        ? <CheckCircle size={16} className="text-primary-600 shrink-0" />
                        : <XCircle size={16} className="text-slate-400 shrink-0" />}
                      <span className={ok ? 'text-primary-700' : 'text-slate-500'}>{doc.label}</span>
                    </div>
                  )
                })}
              </div>
              {!listing.verified && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mt-3">
                  ⚠️ Documents pending full verification
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
