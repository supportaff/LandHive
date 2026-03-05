import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Upload, MapPin, CreditCard, Image as ImageIcon,
  FileText, AlertCircle, ChevronRight, ChevronLeft, Loader2,
  Shield, User, Phone, IdCard, Info } from 'lucide-react'
import { TN_DISTRICTS, LAND_TYPES, formatPrice } from '../data/listings'
import { useUser, useAuth, SignInButton } from '@clerk/clerk-react'
import MapPlaceholder from '../components/MapPlaceholder'

const LISTING_FEE_TIERS = [
  { label: '< \u20B925L',     fee: 2499  },
  { label: '\u20B925L\u2013\u20B950L', fee: 4999  },
  { label: '\u20B950L\u2013\u20B91Cr', fee: 9999  },
  { label: '> \u20B91Cr',     fee: 14999 },
]

function getListingFee(price = 0) {
  const p = Number(price) || 0
  if (p > 10000000) return 14999
  if (p >= 5000000)  return 9999
  if (p >= 2500000)  return 4999
  return 2499
}

const STEPS = [
  { id: 1, label: 'Basic Info', icon: FileText },
  { id: 2, label: 'Location',   icon: MapPin },
  { id: 3, label: 'Media',      icon: ImageIcon },
  { id: 4, label: 'KYC',        icon: Shield },
  { id: 5, label: 'Pay & Post', icon: CreditCard },
]

export default function PostListing() {
  const { user, isLoaded } = useUser()
  const { getToken }       = useAuth()
  const navigate           = useNavigate()

  const [step, setStep]   = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '', landType: '', areaValue: '', areaUnit: 'acre',
    surveyNumber: '', totalPrice: '', perAcre: '', description: '',
    district: '', village: '', landmark: '', lat: '', lng: '',
    photos: [], documents: [],
    sellerName: '', sellerPhone: '',
    kycAadhaarName: '', kycAadhaarNumber: '', kycPanNumber: '',
    kycAadhaarDoc: null, kycPanDoc: null, kycSelfie: null,
    kycConsent: false,
  })

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        sellerName:  f.sellerName  || user.fullName || '',
        sellerPhone: f.sellerPhone || user.primaryPhoneNumber?.phoneNumber || '',
      }))
    }
  }, [user])

  const update = (key, val) => setForm(f => {
    const next = { ...f, [key]: val }
    if ((key === 'totalPrice' || key === 'areaValue') && next.areaUnit === 'acre') {
      const total = parseFloat(next.totalPrice) || 0
      const area  = parseFloat(next.areaValue)  || 1
      if (area > 0) next.perAcre = (total / area).toFixed(0)
    }
    return next
  })

  const listingFee = getListingFee(parseFloat(form.totalPrice) || 0)

  const DEMO_PHOTOS = [
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400',
    'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400',
    'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400',
  ]

  // ─── Real PayU payment flow ──────────────────────────────────────────────────
  const handlePayment = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()

      // 1. Save listing to MongoDB
      const listingRes = await fetch('/api/create-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          sellerEmail: user.emailAddresses[0]?.emailAddress || '',
        }),
      })
      const listingData = await listingRes.json()
      if (!listingRes.ok) throw new Error(listingData.error || 'Failed to save listing')

      // 2. Initiate PayU — get hash + txnid
      const payuRes = await fetch('/api/payu-initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listingId:   listingData.listingId,
          amount:      String(listingData.listingFee),
          productinfo: `LandHive Listing Fee - ${form.title.substring(0, 50)}`,
          phone:       form.sellerPhone,
        }),
      })
      const payuData = await payuRes.json()
      if (!payuRes.ok) throw new Error(payuData.error || 'Payment initiation failed')

      // 3. Build hidden form and submit to PayU gateway
      const payForm = document.createElement('form')
      payForm.method = 'POST'
      payForm.action = payuData.action  // test.payu.in or secure.payu.in based on LH_PAYU_ENV
      ;['txnid','hash','key','amount','productinfo','firstname','email','phone','udf1','udf2','surl','furl']
        .forEach(field => {
          const inp = document.createElement('input')
          inp.type  = 'hidden'
          inp.name  = field
          inp.value = payuData[field] ?? ''
          payForm.appendChild(inp)
        })
      document.body.appendChild(payForm)
      payForm.submit()
      // Page navigates away — no need to setLoading(false)

    } catch (err) {
      console.error('Payment error:', err)
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  // Not signed in
  if (isLoaded && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Shield size={28} className="text-primary-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-800 mb-2">Sign In to Post a Listing</h2>
          <p className="text-slate-500 mb-6 text-sm">Create a free account to list your land on LandHive.</p>
          <SignInButton mode="modal">
            <button className="btn-primary w-full">Sign In / Sign Up Free</button>
          </SignInButton>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="max-w-md w-full text-center bg-white rounded-3xl shadow-xl p-10 border border-primary-100">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-primary-600" />
          </div>
          <h2 className="font-display text-3xl font-bold text-slate-800 mb-3">Listing Submitted!</h2>
          <p className="text-slate-500 mb-4">Your listing has been saved. Complete payment to go live.</p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/dashboard/seller')} className="flex-1 btn-primary">Dashboard</button>
            <button onClick={() => { setSuccess(false); setStep(1) }} className="flex-1 btn-outline">Post Another</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pt-28">
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-bold text-slate-800 mb-1">Post Your Land</h1>
        <p className="text-slate-500 text-sm">Reach 50,000+ verified buyers across Tamil Nadu</p>
      </div>

      {/* Pricing tiers */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 mb-6">
        <p className="text-xs font-bold text-primary-700 mb-2 flex items-center gap-1.5">
          <Info size={13} /> Listing Fee — based on your property value
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LISTING_FEE_TIERS.map(tier => (
            <div key={tier.fee} className={`rounded-xl p-2.5 text-center border transition-all ${
              listingFee === tier.fee
                ? 'bg-primary-600 border-primary-600 text-white'
                : 'bg-white border-primary-100 text-slate-600'
            }`}>
              <p className={`text-xs ${listingFee === tier.fee ? 'text-primary-100' : 'text-slate-400'}`}>{tier.label}</p>
              <p className={`font-bold text-sm mt-0.5 ${listingFee === tier.fee ? 'text-white' : 'text-primary-600'}`}>
                \u20B9{tier.fee.toLocaleString('en-IN')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step progress */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 z-0">
          <div className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
        </div>
        {STEPS.map(s => {
          const Icon = s.icon
          const done   = step > s.id
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
        {step === 4 && <Step4KYC form={form} update={update} />}
        {step === 5 && <Step5Pay form={form} update={update} listingFee={listingFee} />}

        {/* Error banner */}
        {error && (
          <div className="mt-4 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
            <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 btn-outline flex-1 justify-center">
              <ChevronLeft size={18} /> Back
            </button>
          )}
          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 btn-primary flex-1 justify-center">
              Continue <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handlePayment}
              disabled={loading || !form.kycConsent}
              className="flex items-center gap-2 btn-primary flex-1 justify-center disabled:opacity-60">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Saving & Redirecting to PayU...</>
                : <>Pay \u20B9{listingFee.toLocaleString('en-IN')} via PayU &#x2192;</>}
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
              placeholder="5.5" className="input flex-1" />
            <select value={form.areaUnit} onChange={e => update('areaUnit', e.target.value)} className="input w-24">
              <option value="acre">Acre</option>
              <option value="cent">Cent</option>
              <option value="sqft">Sq.ft</option>
              <option value="gunta">Gunta</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Total Price (\u20B9) *</label>
          <input type="number" value={form.totalPrice} onChange={e => update('totalPrice', e.target.value)}
            placeholder="e.g. 3500000" className="input" />
        </div>
      </div>
      {form.perAcre && (
        <div className="bg-primary-50 rounded-xl p-3 text-sm text-primary-700 flex items-center gap-2">
          <CheckCircle size={15} />
          Auto-calculated: \u20B9{parseInt(form.perAcre).toLocaleString('en-IN')} per acre
        </div>
      )}
      {form.totalPrice && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-center gap-2">
          <Info size={15} className="shrink-0" />
          Listing fee for this value: <strong>\u20B9{getListingFee(parseFloat(form.totalPrice)).toLocaleString('en-IN')}</strong>
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
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-center gap-2 text-sm text-primary-700">
        <MapPin size={14} className="shrink-0" />
        Currently serving <strong>Tamil Nadu</strong> only.
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">State</label>
          <input value="Tamil Nadu" readOnly className="input bg-slate-50 text-slate-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="label">District *</label>
          <select value={form.district} onChange={e => update('district', e.target.value)} className="input">
            <option value="">Select district</option>
            {TN_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
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
        <div className="rounded-xl overflow-hidden border border-slate-200 h-56">
          <MapPlaceholder listings={[]} height="100%" showMarkers={false} />
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <input value={form.lat || ''} onChange={e => update('lat', e.target.value)}
            placeholder="Latitude" className="input text-xs" />
          <input value={form.lng || ''} onChange={e => update('lng', e.target.value)}
            placeholder="Longitude" className="input text-xs" />
        </div>
      </div>
    </div>
  )
}

function Step3({ form, update, demoPhotos }) {
  const [dragging, setDragging] = useState(false)
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-slate-800 mb-1">Photos & Documents</h2>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="label mb-0">Photos * (min 3, max 10)</label>
          <span className="text-xs text-slate-400">{form.photos.length}/10</span>
        </div>
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false) }}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
            ${dragging ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-primary-50/50'}`}
          onClick={() => update('photos', demoPhotos)}
        >
          <Upload size={28} className={`mx-auto mb-2 ${dragging ? 'text-primary-500' : 'text-slate-400'}`} />
          <p className="text-sm font-medium text-slate-700">Drag & drop or click to upload photos</p>
          <p className="text-xs text-slate-400 mt-1">JPG, PNG — max 5MB per photo</p>
          <p className="text-xs text-primary-500 mt-2 font-medium">(Click to add demo photos for testing)</p>
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
      </div>
      <div>
        <label className="label">Legal Documents (EC, Patta, Chitta)</label>
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-primary-300 cursor-pointer">
          <FileText size={24} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm text-slate-600">Upload EC, Patta, Chitta documents</p>
          <p className="text-xs text-slate-400 mt-1">PDF or Image · Max 10MB per file</p>
        </div>
        <p className="text-xs text-primary-600 mt-2">✅ Documents help get the <strong>Verified</strong> badge</p>
      </div>
    </div>
  )
}

function Step4KYC({ form, update }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Shield size={20} className="text-primary-600" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">KYC Verification</h2>
          <p className="text-xs text-slate-500">Required before listing goes live</p>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          LandHive verifies all sellers to prevent fraud. Approval within 1–2 business days after payment.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label flex items-center gap-1.5"><User size={13} /> Name as per Aadhaar *</label>
          <input value={form.kycAadhaarName} onChange={e => update('kycAadhaarName', e.target.value)}
            placeholder="Full legal name" className="input" />
        </div>
        <div>
          <label className="label flex items-center gap-1.5"><IdCard size={13} /> Aadhaar Number *</label>
          <input value={form.kycAadhaarNumber} onChange={e => update('kycAadhaarNumber', e.target.value)}
            placeholder="XXXX XXXX XXXX" maxLength={14} className="input" />
        </div>
        <div>
          <label className="label flex items-center gap-1.5"><IdCard size={13} /> PAN Number *</label>
          <input value={form.kycPanNumber} onChange={e => update('kycPanNumber', e.target.value.toUpperCase())}
            placeholder="ABCDE1234F" maxLength={10} className="input font-mono" />
        </div>
        <div>
          <label className="label flex items-center gap-1.5"><Phone size={13} /> Mobile (Aadhaar linked) *</label>
          <input value={form.sellerPhone} onChange={e => update('sellerPhone', e.target.value)}
            placeholder="+91 98765 43210" className="input" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'kycAadhaarDoc', label: 'Aadhaar Card', icon: '\uD83E\uDEB4', hint: 'Front & back' },
          { key: 'kycPanDoc',     label: 'PAN Card',     icon: '\uD83D\uDCB3', hint: 'Clear photo'  },
          { key: 'kycSelfie',     label: 'Selfie',       icon: '\uD83E\uDD33', hint: 'Face clearly visible' },
        ].map(doc => (
          <div key={doc.key}
            className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-primary-300 hover:bg-primary-50/50 transition-all">
            <div className="text-2xl mb-2">{doc.icon}</div>
            <p className="text-xs font-semibold text-slate-700">{doc.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{doc.hint}</p>
            <p className="text-xs text-primary-500 mt-2">Click to upload</p>
          </div>
        ))}
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={form.kycConsent}
            onChange={e => update('kycConsent', e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-primary-600" />
          <span className="text-xs text-slate-600 leading-relaxed">
            I declare that the above information is accurate and I own or have legal authority to sell this property.
            I consent to KYC verification and agree to the{' '}
            <a href="/terms" className="text-primary-600 underline">Terms & Conditions</a>.
          </span>
        </label>
      </div>
    </div>
  )
}

function Step5Pay({ form, listingFee }) {
  const previewPhoto = form.photos[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'
  return (
    <div className="space-y-5">
      <h2 className="font-display text-xl font-bold text-slate-800 mb-1">Review & Pay</h2>
      <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        <p className="text-xs font-semibold text-slate-500 px-4 pt-3 pb-2 uppercase tracking-wide">Listing Preview</p>
        <div className="flex gap-4 p-4 pt-0">
          <img src={previewPhoto} alt="" className="w-24 h-20 object-cover rounded-lg shrink-0" />
          <div>
            <p className="font-semibold text-slate-800 text-sm">{form.title || 'Your Land Title'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{form.district || 'Tamil Nadu'}, Tamil Nadu</p>
            <p className="text-primary-600 font-bold mt-1">
              {form.totalPrice ? `\u20B9${(parseFloat(form.totalPrice) / 100000).toFixed(1)}L` : '\u20B9—'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl p-3">
        <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Properties are approved only after KYC verification (1–2 business days)</strong> + admin review.
        </p>
      </div>
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-bold text-primary-800 text-lg">Listing Fee</p>
            <p className="text-primary-600 text-sm">One-time · Based on property value</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-display font-bold text-primary-700">\u20B9{listingFee.toLocaleString('en-IN')}</p>
            <p className="text-xs text-primary-500">incl. all taxes</p>
          </div>
        </div>
        <ul className="space-y-2 text-sm text-primary-700">
          {[
            'Approved after KYC + admin verification (24–48 hrs)',
            'No hidden charges — one-time fee per listing',
            'Reach 50,000+ verified buyers in Tamil Nadu',
            'WhatsApp alerts for every buyer inquiry',
            'Full seller dashboard with analytics',
          ].map(b => (
            <li key={b} className="flex items-center gap-2">
              <CheckCircle size={14} className="text-primary-600 shrink-0" /> {b}
            </li>
          ))}
        </ul>
        <div className="mt-4 pt-3 border-t border-primary-200 text-xs text-primary-500 flex items-center gap-1.5">
          <AlertCircle size={12} />
          Payment via PayU — UPI, Cards, Net Banking, Wallets accepted
        </div>
      </div>
      {!form.kycConsent && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600">Please complete Step 4 (KYC) and accept the consent declaration.</p>
        </div>
      )}
    </div>
  )
}
