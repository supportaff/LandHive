import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, Trash2, MapPin, Eye } from 'lucide-react'
import { LISTINGS, formatPrice, formatArea } from '../data/listings'
import { useAuth } from '../hooks/useAuth'

export default function BuyerDashboard() {
  const { user } = useAuth()
  const [saved, setSaved] = useState(LISTINGS.slice(0, 3))
  const [activeTab, setActiveTab] = useState('saved')

  if (!user || user.role !== 'buyer') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600">You need to be logged in as a buyer.</p>
        <Link to="/sign-in" className="btn-primary">Login as Buyer</Link>
      </div>
    )
  }

  const remove = (id) => setSaved(s => s.filter(l => l.id !== id))

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">My Dashboard</h1>
          <p className="text-slate-500 text-sm">Manage your saved listings & inquiries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
            <span className="badge badge-blue">Buyer</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Saved Listings', value: saved.length, icon: Heart, color: 'text-red-500 bg-red-50' },
          { label: 'Inquiries Sent', value: '3', icon: MessageCircle, color: 'text-blue-500 bg-blue-50' },
          { label: 'Listings Viewed', value: '18', icon: Eye, color: 'text-purple-500 bg-purple-50' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${s.color}`}>
                <Icon size={18} />
              </div>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        {['saved', 'inquiries'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
              ${activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
            {tab === 'saved' ? '❤️ Saved Listings' : '💬 Inquiry History'}
          </button>
        ))}
      </div>

      {activeTab === 'saved' && (
        <>
          {saved.length === 0 ? (
            <div className="text-center py-16">
              <Heart size={40} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500 mb-4">No saved listings yet</p>
              <Link to="/search" className="btn-primary">Browse Listings</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {saved.map(listing => (
                <div key={listing.id} className="card group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={listing.photos[0]} alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button onClick={() => remove(listing.id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full flex items-center justify-center shadow-sm transition-colors">
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-1">{listing.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin size={11} /> {listing.location.district}, {listing.location.state}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary-600">{formatPrice(listing.price.total)}</span>
                      <Link to={`/listing/${listing.id}`}
                        className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'inquiries' && (
        <div className="space-y-3">
          {[
            { listing: 'Fertile Agricultural Land Near Coimbatore', seller: 'Ramesh Kumar', date: '2024-12-10', status: 'replied' },
            { listing: 'Residential Plot — DTCP Approved, Hosur', seller: 'Priya Suresh', date: '2024-12-08', status: 'pending' },
            { listing: 'Paddy Field — 12 Acres, Krishna District', seller: 'Srinivasa Rao', date: '2024-12-05', status: 'replied' },
          ].map((inq, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-medium text-slate-800 text-sm">{inq.listing}</p>
                <p className="text-xs text-slate-500">Seller: {inq.seller} · {inq.date}</p>
              </div>
              <span className={`badge ${inq.status === 'replied' ? 'badge-green' : 'badge-yellow'} capitalize`}>
                {inq.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
