import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Shield, CheckCircle, XCircle, BadgeCheck, Users, BarChart3,
  AlertTriangle, Eye, Loader2 } from 'lucide-react'
import { formatPrice, formatArea } from '../data/listings'
import { useAuth } from '../hooks/useAuth'

export default function AdminPanel() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('pending')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(null)

  // Fetch all listings for admin
  useEffect(() => {
    const fetchAllListings = async () => {
      try {
        const res = await fetch('/api/get-listings?admin=true')
        const data = await res.json()
        if (data.listings) {
          const transformed = data.listings.map(l => ({
            id: l.id,
            title: l.title,
            landType: l.land_type,
            area: { value: l.area_value, unit: l.area_unit },
            price: { total: l.price_total, perAcre: l.price_per_acre },
            location: { district: l.location_district, state: l.location_state },
            photos: l.photos || ['/placeholder.jpg'],
            status: l.status || 'pending',
            verified: l.verified || false,
            viewCount: l.view_count || 0,
            sellerName: l.seller_name || 'Anonymous',
            description: l.description || '',
          }))
          setListings(transformed)
        }
      } catch (error) {
        console.error('Failed to fetch listings')
      } finally {
        setLoading(false)
      }
    }

    fetchAllListings()
  }, [])

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Shield size={48} className="text-slate-300" />
        <p className="text-slate-600">Admin access required.</p>
        <Link to="/sign-in" className="btn-primary">Login as Admin</Link>
      </div>
    )
  }

  const pending = listings.filter(l => l.status === 'pending')
  const approved = listings.filter(l => l.status === 'approved')

  const approve = async (id) => {
    setProcessing(id)
    // TODO: Call /api/admin/approve-listing
    await new Promise(r => setTimeout(r, 800))
    setListings(ls => ls.map(l => l.id === id ? { ...l, status: 'approved' } : l))
    setProcessing(null)
  }

  const reject = async () => {
    setProcessing(rejectModal)
    // TODO: Call /api/admin/reject-listing
    await new Promise(r => setTimeout(r, 800))
    setListings(ls => ls.map(l => l.id === rejectModal ? { ...l, status: 'rejected', rejectReason } : l))
    setRejectModal(null)
    setRejectReason('')
    setProcessing(null)
  }

  const toggleVerified = (id) => {
    // TODO: Call /api/admin/toggle-verified
    setListings(ls => ls.map(l => l.id === id ? { ...l, verified: !l.verified } : l))
  }

  const STATS = [
    { label: 'Pending Approval', value: pending.length, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50' },
    { label: 'Approved Listings', value: approved.length, icon: CheckCircle, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Users', value: 3240, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Verified Listings', value: listings.filter(l => l.verified).length, icon: BadgeCheck, color: 'text-purple-600 bg-purple-50' },
  ]

  return (
    <div className="min-h-screen pt-20 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-800">Admin Panel</h1>
            <p className="text-slate-500 text-sm">LandHive Management Dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATS.map(s => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
          {['pending', 'approved', 'users', 'analytics'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                ${activeTab === tab ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}>
              {tab}
              {tab === 'pending' && pending.length > 0 && (
                <span className="ml-1.5 badge bg-amber-100 text-amber-700 text-xs">{pending.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={40} className="animate-spin text-primary-600" />
              </div>
            ) : pending.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <CheckCircle size={40} className="mx-auto mb-3 text-primary-500" />
                <p className="text-slate-500 font-medium">All listings reviewed! No pending items.</p>
              </div>
            ) : (
              pending.map(listing => (
                <div key={listing.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="flex gap-5 p-5">
                    <img src={listing.photos[0]} alt="" className="w-28 h-24 object-cover rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-slate-800">{listing.title}</h3>
                        <span className="badge badge-yellow shrink-0">Pending</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        📍 {listing.location.district}, {listing.location.state} ·
                        📐 {formatArea(listing.area)} ·
                        💰 {formatPrice(listing.price.total)}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2">{listing.description}</p>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <Link to={`/listing/${listing.id}`}
                          className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                          <Eye size={12} /> Preview
                        </Link>
                        <button
                          onClick={() => approve(listing.id)}
                          disabled={processing === listing.id}
                          className="flex items-center gap-1 text-xs bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                          {processing === listing.id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <CheckCircle size={12} />}
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectModal(listing.id)}
                          className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-4 py-1.5 rounded-lg transition-colors border border-red-200">
                          <XCircle size={12} /> Reject
                        </button>
                        <button
                          onClick={() => toggleVerified(listing.id)}
                          className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors border
                            ${listing.verified ? 'bg-primary-50 text-primary-600 border-primary-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          <BadgeCheck size={12} />
                          {listing.verified ? 'Verified ✓' : 'Mark Verified'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Approved Tab */}
        {activeTab === 'approved' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={40} className="animate-spin text-primary-600" />
              </div>
            ) : approved.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No approved listings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Listing', 'Seller', 'Area', 'Price', 'Verified', 'Views', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {approved.map(l => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={l.photos[0]} alt="" className="w-10 h-9 object-cover rounded-lg" />
                            <span className="font-medium text-slate-800 text-xs line-clamp-1 max-w-[160px]">{l.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{l.sellerName}</td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{formatArea(l.area)}</td>
                        <td className="px-4 py-3 font-semibold text-primary-600 text-xs">{formatPrice(l.price.total)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleVerified(l.id)}
                            className={`badge cursor-pointer transition-colors ${l.verified ? 'badge-green' : 'bg-slate-100 text-slate-500'}`}>
                            {l.verified ? '✓ Verified' : 'Unverified'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">{l.viewCount}</td>
                        <td className="px-4 py-3">
                          <Link to={`/listing/${l.id}`}
                            className="text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 w-fit">
                            <Eye size={11} /> View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['User', 'Email', 'Role', 'Joined', 'Listings'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { name: 'Ramesh Kumar', email: 'ramesh@example.com', role: 'seller', joined: '2023-01-15', listings: 4 },
                    { name: 'Arjun Mehta', email: 'arjun@example.com', role: 'buyer', joined: '2024-03-22', listings: 0 },
                    { name: 'Priya Suresh', email: 'priya@example.com', role: 'seller', joined: '2022-11-08', listings: 7 },
                    { name: 'Vikram Patil', email: 'vikram@example.com', role: 'seller', joined: '2021-06-30', listings: 12 },
                    { name: 'Anita Sharma', email: 'anita@example.com', role: 'buyer', joined: '2024-05-14', listings: 0 },
                  ].map((u, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-800">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`badge capitalize ${u.role === 'seller' ? 'badge-green' : 'badge-blue'}`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{u.joined}</td>
                      <td className="px-4 py-3 text-slate-600">{u.listings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-primary-600" /> Listings by State
              </h3>
              {[
                { state: 'Tamil Nadu', count: 2840, pct: 85 },
                { state: 'Maharashtra', count: 2120, pct: 64 },
                { state: 'Karnataka', count: 1890, pct: 57 },
                { state: 'Andhra Pradesh', count: 1540, pct: 46 },
                { state: 'Telangana', count: 980, pct: 29 },
              ].map(s => (
                <div key={s.state} className="mb-3">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{s.state}</span>
                    <span className="font-semibold">{s.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800 mb-4">Listings by Type</h3>
              {[
                { type: 'Agricultural', count: 4280, color: 'bg-green-500', pct: 34 },
                { type: 'Residential', count: 3150, color: 'bg-blue-500', pct: 25 },
                { type: 'Commercial', count: 1840, color: 'bg-purple-500', pct: 15 },
                { type: 'Farm Land', count: 2010, color: 'bg-emerald-500', pct: 16 },
                { type: 'NA Plot', count: 1200, color: 'bg-orange-500', pct: 10 },
              ].map(s => (
                <div key={s.type} className="mb-3">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>{s.type}</span>
                    <span className="font-semibold">{s.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.pct * 3}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-1">Reject Listing</h3>
            <p className="text-slate-500 text-sm mb-4">Please provide a reason (sent to seller via WhatsApp).</p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Survey number does not match. Please re-upload correct documents."
              rows={4}
              className="input resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={reject} disabled={!rejectReason || processing === rejectModal}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {processing === rejectModal ? <Loader2 size={14} className="animate-spin" /> : null}
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
