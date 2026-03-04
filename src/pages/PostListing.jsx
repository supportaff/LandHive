import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Upload, MapPin, CreditCard, Image as ImageIcon,
  FileText, AlertCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { STATES, LAND_TYPES } from '../data/listings'
import { useAuth } from '../hooks/useAuth'
import MapPlaceholder from '../components/MapPlaceholder'

const STEPS = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Media', icon: ImageIcon },
  { id: 4, label: 'Pay & Post', icon: CreditCard },
]

export default function PostListing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    landType: '',
    areaValue: '',
    areaUnit: 'acre',
    surveyNumber: '',
    totalPrice: '',
    perAcre: '',
    description: '',
    state: '',
    district: '',
    village: '',
    landmark: '',
    photos: [],
    documents: [],
    sellerName: user?.name || '',
    sellerPhone: user?.phone || '',
  })

  const update = (key, val) => setForm(f => {
    const next = { ...f, [key]: val }
    if (key === 'totalPrice' || key === 'areaValue') {
      const total = parseFloat(next.totalPrice) || 0
      const area = parseFloat(next.areaValue) || 1
      if (next.areaUnit === 'acre' && area > 0) next.perAcre = (total / area).toFixed(0)
    }
    return next
  })

  const DEMO_PHOTOS = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
  ]

  const handlePayment = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    setLoading(false)
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl p-10 border border-primary-100">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-primary-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">Payment Successful!</h2>
          <p className="text-slate-500 mb-2">Your listing has been submitted for review.</p>
          <p className="text-sm text-slate-400 bg-slate-50 rounded-xl px-4 py-3 mb-6">
            🕐 Your listing will go live within 24–48 hours after admin approval.
            You'll receive a WhatsApp notification once it's live.
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard/seller')}
              className="flex-1 btn-primary">Go to Dashboard</button>
            <button onClick={() => { setSuccess(false); setStep(1); setForm({ ...form, title: '' }) }}
              className="flex-1 btn-outline">Post Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pt-28">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-800 mb-1">Post Your Land</h1>
        <p className="text-slate-500 text-sm">Reach 50,000+ verified buyers · ₹999 one-time fee</p>
      </div>

      {/* Step progress */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 z-0">
          <div className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
        </div>
        {STEPS.map(s => {
          const Icon = s.icon
          const done = step > s.id
          const active = step === s.id
          return (
            <div key={s.id} className="flex flex-col items-center gap-2 z-10">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                ${done ? 'bg-primary-600 border-primary-600' : active ? 'bg-white border-primary-600 shadow-lg shadow-primary-200' : 'bg-white border-slate-200'}`}>
                {done
                  ? <CheckCircle size={18} className="text-white" />
                  : <Icon size={18} className={active ? 'text-primary-600' : 'text-slate-400'} />}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? 'text-primary-600' : done ? 'text-slate-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
        {step === 1 && <Step1 form={form} update={update} />}
        {step === 2 && <Step2 form={form} update={update} />}
        {step === 3 && <Step3 form={form} update={update} demoPhotos={DEMO_PHOTOS} />}
        {step === 4 && <Step4 form={form} update={update} />}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 btn-outline flex-1 justify-center">
              <ChevronLeft size={18} /> Back
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 btn-primary flex-1 justify-center">
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button onClick={handlePayment} disabled={loading}
              className="flex items-center gap-2 btn-primary flex-1 justify-center disabled:opacity-60">
              {loading ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : <>Pay ₹999 via PayU →</>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1({ form, update }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Basic Information</h2>
      <div>
        <label className="label">Listing Title *</label>
        <input value={form.title} onChange={e => update('title', e.target.value)}
          placeholder="e.g. Fertile 5-Acre Land Near Coimbatore" className="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Land Type *</label>
          <select value={form.landType} onChange={e => update('landType', e.target.value)} className="input">
            <option value="">Select type</option>
            {LAND_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Survey Number</label>
          <input value={form.surveyNumber} onChange={e => update('surveyNumber', e.target.value)}
            placeholder="SF No. / RS No." className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Area *</label>
          <div className="flex gap-2">
            <input type="number" value={form.areaValue} onChange={e => update('areaValue', e.target.value)}
              placeholder="e.g. 5.5" className="input flex-1" />
            <select value={form.areaUnit} onChange={e => update('areaUnit', e.target.value)} className="input w-24">
              <option value="acre">Acre</option>
              <option value="cent">Cent</option>
              <option value="sqft">Sq.ft</option>
              <option value="gunta">Gunta</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Total Price (₹) *</label>
          <input type="number" value={form.totalPrice} onChange={e => update('totalPrice', e.target.value)}
            placeholder="e.g. 3500000" className="input" />
        </div>
      </div>
      {form.perAcre && (
        <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-700 flex items-center gap-2">
          <CheckCircle size={15} />
          Auto-calculated: ₹{parseInt(form.perAcre).toLocaleString('en-IN')} per acre
        </div>
      )}
      <div>
        <label className="label">Description *</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)}
          placeholder="Describe your land — soil type, water availability, road access, nearby landmarks..."
          rows={5} className="input resize-none" />
        <p className="text-xs text-slate-400 mt-1">{form.description.length}/1000 characters</p>
      </div>
    </div>
  )
}

function Step2({ form, update }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-slate-800 mb-5">Location Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">State *</label>
          <select value={form.state} onChange={e => update('state', e.target.value)} className="input">
            <option value="">Select state</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">District *</label>
          <input value={form.district} onChange={e => update('district', e.target.value)}
            placeholder="e.g. Coimbatore" className="input" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Village / Area</label>
          <input value={form.village} onChange={e => update('village', e.target.value)}
            placeholder="e.g. Sulur" className="input" />
        </div>
        <div>
          <label className="label">Nearby Landmark</label>
          <input value={form.landmark} onChange={e => update('landmark', e.target.value)}
            placeholder="e.g. 2km from NH-47" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Pin Location on Map</label>
        <p className="text-xs text-slate-400 mb-2">Click on the map to drop a pin (Google Maps API required)</p>
        <div className="rounded-xl overflow-hidden border border-slate-200 h-56">
          <MapPlaceholder listings={[]} height="100%" showMarkers={false} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div>
            <input value={form.lat || ''} onChange={e => update('lat', e.target.value)}
              placeholder="Latitude (auto from map pin)" className="input text-xs" />
          </div>
          <div>
            <input value={form.lng || ''} onChange={e => update('lng', e.target.value)}
              placeholder="Longitude (auto from map pin)" className="input text-xs" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Step3({ form, update, demoPhotos }) {
  const [dragging, setDragging] = useState(false)

  const addDemo = () => {
    update('photos', demoPhotos)
  }

  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-slate-800 mb-1">Photos & Documents</h2>

      {/* Photo upload */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Photos * (min 3, max 10)</label>
          <span className="text-xs text-slate-400">{form.photos.length}/10 uploaded</span>
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false) }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${dragging ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/50'}`}
          onClick={addDemo}
        >
          <Upload size={28} className={`mx-auto mb-2 ${dragging ? 'text-primary-500' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">Drag & drop photos or click to upload</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG — max 5MB per photo</p>
          <p className="text-xs text-primary-500 mt-2 font-medium">(Click to add demo photos)</p>
        </div>

        {form.photos.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {form.photos.map((p, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-square">
                <img src={p} alt="" className="w-full h-full object-cover" />
                <button onClick={() => update('photos', form.photos.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">×</button>
                {i === 0 && <span className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1 rounded">Cover</span>}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
          <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">💡 Listings with 5+ high-quality photos get <strong>3x more inquiries</strong>. Add boundary, landscape, and access road photos.</p>
        </div>
      </div>

      {/* Document upload */}
      <div>
        <label className="label">Legal Documents (EC, Patta, Chitta — PDF/Image)</label>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-300 cursor-pointer transition-all">
          <FileText size={24} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-600">Upload EC, Patta, Chitta documents</p>
          <p className="text-xs text-slate-400 mt-1">PDF or Image · Max 10MB per file</p>
        </div>
        <p className="text-xs text-primary-600 mt-2">✅ Documents help get the <strong>Verified</strong> badge and build buyer trust</p>
      </div>
    </div>
  )
}

function Step4({ form, update }) {
  const { user } = useAuth()
  const previewListing = {
    title: form.title || 'Your Land Title',
    area: { value: form.areaValue || '—', unit: form.areaUnit },
    price: { total: parseInt(form.totalPrice) || 0 },
    location: { district: form.district || '—', state: form.state || '—' },
    landType: form.landType || 'agricultural',
    photos: form.photos.length > 0 ? form.photos : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'],
  }

  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-slate-800 mb-1">Review & Pay</h2>

      {/* Preview */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        <p className="text-xs font-semibold text-slate-500 px-4 pt-3 pb-2 uppercase tracking-wide">Listing Preview</p>
        <div className="flex gap-4 p-4 pt-0">
          <img src={previewListing.photos[0]} alt="" className="w-24 h-20 object-cover rounded-lg shrink-0" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{previewListing.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">{previewListing.location.district}, {previewListing.location.state}</p>
            <p className="text-primary-600 font-bold mt-1">
              {previewListing.price.total ? `₹${(previewListing.price.total / 100000).toFixed(1)}L` : '₹—'}
            </p>
          </div>
        </div>
      </div>

      {/* Seller details */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Your Name *</label>
          <input value={form.sellerName} onChange={e => update('sellerName', e.target.value)}
            placeholder="Full name" className="input" />
        </div>
        <div>
          <label className="label">WhatsApp Number *</label>
          <input value={form.sellerPhone} onChange={e => update('sellerPhone', e.target.value)}
            placeholder="+91 98765 43210" className="input" />
        </div>
      </div>

      {/* Payment box */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-primary-800 text-lg">One-time Listing Fee</p>
            <p className="text-primary-600 text-sm">No subscription · Pay per listing only</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display font-bold text-primary-700">₹999</p>
            <p className="text-xs text-primary-500">incl. all taxes</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-primary-700">
          {[
            'Listing live after verification (24–48 hrs)',
            'No hidden charges — pay only per listing',
            'Reach 50,000+ verified buyers',
            'WhatsApp alerts for every inquiry',
            'Manage from seller dashboard',
          ].map(b => (
            <li key={b} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-primary-600 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-3 border-t border-primary-200 text-xs text-primary-500 flex items-center gap-1.5">
          <AlertCircle size={12} />
          Payment via PayU — Supports UPI, Cards, Net Banking, Wallets
        </div>
      </div>
    </div>
  )
}
