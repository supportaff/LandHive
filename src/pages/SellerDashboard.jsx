import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ListFilter, MessageCircle, Bell, Settings,
  Plus, Eye, Trash2, Edit, CheckCircle2, Clock, XCircle,
  TrendingUp, DollarSign, Star, BadgeCheck, Loader2 } from 'lucide-react'
import { formatPrice, formatArea } from '../data/listings'
import { useAuth } from '../hooks/useAuth'

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'listings', label: 'My Listings', icon: ListFilter },
  { id: 'inquiries', label: 'Inquiries', icon: MessageCircle },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const MOCK_INQUIRIES = [
  { id: 1, buyer: 'Suresh M.', listing: 'Fertile Agricultural Land Near Coimbatore', date: '2024-12-10', phone: '+91 99887 12345', status: 'new' },
  { id: 2, buyer: 'Anita K.', listing: 'Paddy Field — 12 Acres, Krishna District', date: '2024-12-08', phone: '+91 88776 23456', status: 'seen' },
  { id: 3, buyer: 'Ravi T.', listing: 'Fertile Agricultural Land Near Coimbatore', date: '2024-12-05', phone: '+91 77665 34567', status: 'seen' },
]

export default function SellerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [deleteId, setDeleteId] = useState(null)
  const [myListings, setMyListings] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch seller's listings
  useEffect(() => {
    const fetchMyListings = async () => {
      if (!user?.id) return
      try {
        const res = await fetch(`/api/get-listings?sellerId=${user.id}`)
        const data = await res.json()
        if (data.listings) {
          const transformed = data.listings.map(l => ({
            id: l.id,
            title: l.title,
            landType: l.land_type,
            area: { value: l.area_value, unit: l.area_unit },
            price: { total: l.price_total, perAcre: l.price_per_acre },
            location: { district: l.location_district },
            photos: l.photos || ['/placeholder.jpg'],
            status: l.status || 'pending',
            inquiryCount: l.inquiry_count || 0,
          }))
          setMyListings(transformed)
        }
      } catch (error) {
        console.error('Failed to fetch listings')
      } finally {
        setLoading(false)
      }
    }

    fetchMyListings()
  }, [user])

  if (!user || user.role !== 'seller') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-slate-600">You need to be logged in as a seller.</p>
        <Link to="/sign-in" className="btn-primary">Login as Seller</Link>
      </div>
    )
  }

  const stats = [
    { label: 'Active Listings', value: myListings.filter(l => l.status === 'approved').length, icon: CheckCircle2, color: 'text-primary-600 bg-primary-50' },
    { label: 'Total Inquiries', value: myListings.reduce((sum, l) => sum + l.inquiryCount, 0), icon: MessageCircle, color: 'text-blue-600 bg-blue-50' },
    { label: 'This Month Views', value: '0', icon: Eye, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Earnings', value: '₹0', icon: DollarSign, color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="min-h-screen pt-16 flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 bg-white border-r border-slate-100 flex flex-col hidden md:flex">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">{user.name}</p>
              <span className="badge badge-green text-xs capitalize">{user.role}</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3">
          {NAV.map(item => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all
                  ${activeTab === item.id ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon size={17} />
                {item.label}
                {item.id === 'inquiries' && MOCK_INQUIRIES.filter(i => i.status === 'new').length > 0 && (
                  <span className="ml-auto badge bg-red-100 text-red-600 text-xs">{MOCK_INQUIRIES.filter(i => i.status === 'new').length}</span>
                )}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <Link to="/post"
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm py-2.5">
            <Plus size={16} /> Post New Listing
          </Link>
          <p className="text-center text-xs text-slate-400 mt-2">₹999 per listing</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-800">
                {NAV.find(n => n.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500 text-sm">Welcome back, {user.name.split(' ')[0]}!</p>
            </div>
            <Link to="/post" className="btn-primary flex items-center gap-2 text-sm hidden md:flex">
              <Plus size={16} /> Post Listing (₹999)
            </Link>
          </div>

          {/* Mobile nav tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-5 md:hidden">
            {NAV.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                  ${activeTab === item.id ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => {
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

              {/* Quick listings */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">Recent Listings</h3>
                  <button onClick={() => setActiveTab('listings')} className="text-xs text-primary-600 font-medium">View all</button>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-primary-600" />
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-500 mb-4">No listings yet</p>
                    <Link to="/post" className="btn-primary inline-flex items-center gap-2">
                      <Plus size={16} /> Post Your First Listing
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {myListings.slice(0, 3).map(l => (
                      <div key={l.id} className="flex items-center gap-4 p-4">
                        <img src={l.photos[0]} alt="" className="w-14 h-11 object-cover rounded-lg shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{l.title}</p>
                          <p className="text-xs text-slate-400">{formatArea(l.area)} · {formatPrice(l.price.total)}</p>
                        </div>
                        <StatusPill status={l.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary-600" />
                </div>
              ) : myListings.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="text-5xl mb-4">🏞️</div>
                  <h3 className="font-semibold text-slate-800 mb-2">No Listings Yet</h3>
                  <p className="text-slate-500 mb-6 text-sm">Start selling your land by posting your first listing</p>
                  <Link to="/post" className="btn-primary inline-flex items-center gap-2">
                    <Plus size={16} /> Post Your First Listing
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100">
                        {['Listing', 'Area', 'Price', 'Status', 'Inquiries', 'Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {myListings.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={l.photos[0]} alt="" className="w-12 h-10 object-cover rounded-lg shrink-0" />
                              <div>
                                <p className="font-medium text-slate-800 line-clamp-1 max-w-[180px]">{l.title}</p>
                                <p className="text-xs text-slate-400">{l.location.district}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{formatArea(l.area)}</td>
                          <td className="px-4 py-3 font-semibold text-primary-600">{formatPrice(l.price.total)}</td>
                          <td className="px-4 py-3"><StatusPill status={l.status} /></td>
                          <td className="px-4 py-3 text-slate-600">{l.inquiryCount}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Link to={`/listing/${l.id}`}
                                className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-600 transition-colors">
                                <Eye size={13} />
                              </Link>
                              <button className="w-7 h-7 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 transition-colors">
                                <Edit size={13} />
                              </button>
                              <button onClick={() => setDeleteId(l.id)}
                                className="w-7 h-7 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center text-red-500 transition-colors">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Inquiries Tab */}
          {activeTab === 'inquiries' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {MOCK_INQUIRIES.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">No inquiries yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {MOCK_INQUIRIES.map(inq => (
                    <div key={inq.id} className={`p-4 flex items-center gap-4 ${inq.status === 'new' ? 'bg-primary-50/30' : ''}`}>
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold shrink-0">
                        {inq.buyer.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-800 text-sm">{inq.buyer}</p>
                          {inq.status === 'new' && <span className="badge bg-red-100 text-red-600">New</span>}
                        </div>
                        <p className="text-xs text-slate-500 truncate">Re: {inq.listing}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{inq.date}</p>
                      </div>
                      <a href={`tel:${inq.phone}`}
                        className="shrink-0 text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors">
                        📞 Call
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {myListings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <Bell size={40} className="mx-auto mb-3 text-slate-300" />
                  <p className="text-slate-500">No alerts yet</p>
                </div>
              ) : (
                [
                  { msg: 'Your listing has been submitted for review', time: '1 hour ago', type: 'info' },
                  { msg: 'Complete your seller profile to boost visibility', time: '2 days ago', type: 'tip' },
                ].map((a, i) => (
                  <div key={i} className={`flex gap-4 p-4 rounded-xl border ${
                    a.type === 'success' ? 'bg-primary-50 border-primary-200' :
                    a.type === 'info' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="text-lg">{a.type === 'success' ? '✅' : a.type === 'info' ? '📩' : '💡'}</div>
                    <div>
                      <p className="text-sm text-slate-700">{a.msg}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
              <h3 className="font-semibold text-slate-800">Profile Settings</h3>
              {[
                { label: 'Full Name', value: user.name },
                { label: 'Email', value: user.email },
                { label: 'Phone / WhatsApp', value: user.phone },
              ].map(f => (
                <div key={f.label}>
                  <label className="label">{f.label}</label>
                  <input defaultValue={f.value} className="input" />
                </div>
              ))}
              <button className="btn-primary">Save Changes</button>
            </div>
          )}
        </div>
      </main>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-slate-800 mb-2">Delete Listing?</h3>
            <p className="text-slate-500 text-sm mb-5">This action cannot be undone. The listing will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-outline">Cancel</button>
              <button onClick={() => setDeleteId(null)} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }) {
  const map = {
    approved: { label: 'Approved', classes: 'badge-green' },
    pending: { label: 'Pending', classes: 'badge-yellow' },
    rejected: { label: 'Rejected', classes: 'badge-red' },
    sold: { label: 'Sold', classes: 'badge bg-slate-100 text-slate-600' },
  }
  const s = map[status] || map.pending
  return <span className={`badge ${s.classes}`}>{s.label}</span>
}
