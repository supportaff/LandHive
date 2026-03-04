import { Link } from 'react-router-dom'
import { MapPin, Eye, MessageCircle, BadgeCheck } from 'lucide-react'
import { formatPrice, formatArea } from '../data/listings'

export default function ListingCard({ listing, className = '' }) {
  const typeColors = {
    agricultural: 'bg-green-100 text-green-700',
    residential: 'bg-blue-100 text-blue-700',
    commercial: 'bg-purple-100 text-purple-700',
    farm: 'bg-emerald-100 text-emerald-700',
    na: 'bg-orange-100 text-orange-700',
  }

  return (
    <Link to={`/listing/${listing.id}`}
      className={`listing-card card group flex flex-col ${className}`}>
      {/* Photo */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={listing.photos[0]}
          alt={listing.title}
          className="listing-card-img w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {listing.verified && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
            <BadgeCheck size={12} />
            Verified
          </div>
        )}
        {listing.featured && (
          <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full">
            Featured
          </div>
        )}
        <div className="absolute bottom-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${typeColors[listing.landType] || 'bg-slate-100 text-slate-600'}`}>
            {listing.landType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
          <MapPin size={12} className="text-primary-500 shrink-0" />
          <span className="truncate">{listing.location.district}, {listing.location.state}</span>
        </div>

        {/* Area pill */}
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 text-slate-600 font-medium">
            📐 {formatArea(listing.area)}
          </span>
          <span className="badge bg-slate-100 text-slate-500 text-xs">
            Survey: {listing.location.surveyNumber?.split(' ').slice(-1)[0]}
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xl font-bold text-primary-600 font-display">
                {formatPrice(listing.price.total)}
              </p>
              <p className="text-xs text-slate-400">
                {formatPrice(listing.price.perAcre)}/acre
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Eye size={12} />{listing.viewCount}</span>
              <span className="flex items-center gap-1"><MessageCircle size={12} />{listing.inquiryCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
