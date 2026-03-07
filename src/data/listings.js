// src/data/listings.js
// Shared data & helpers used across LandHive frontend

// ─── States (Tamil Nadu first — more coming) ─────────────────────────────────
export const STATES = [
  'Tamil Nadu',
  // 'Karnataka',   // coming soon
  // 'Kerala',      // coming soon
  // 'Andhra Pradesh', // coming soon
]

// ─── Tamil Nadu Districts (38) ────────────────────────────────────────────────
export const TN_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
  'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
  'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
  'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi',
  'Thanjavur', 'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli',
  'Tirupathur', 'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur',
  'Vellore', 'Villupuram', 'Virudhunagar',
]

// ─── Land / Property Types ────────────────────────────────────────────────────
export const LAND_TYPES = [
  { value: 'agricultural', label: 'Agricultural Land' },
  { value: 'residential',  label: 'Residential Plot'  },
  { value: 'commercial',   label: 'Commercial Land'   },
  { value: 'industrial',   label: 'Industrial Land'   },
  { value: 'farm',         label: 'Farm Land'         },
  { value: 'house',        label: 'House / Villa'     },
  { value: 'plot',         label: 'NA Plot'           },
]

// ─── Listing Fee Tiers ────────────────────────────────────────────────────────
export const LISTING_FEE_TIERS = [
  { label: '< ₹25L',      min: 0,         max: 2499999,   fee: 2499  },
  { label: '₹25L–₹50L',  min: 2500000,   max: 4999999,   fee: 4999  },
  { label: '₹50L–₹1Cr',  min: 5000000,   max: 10000000,  fee: 9999  },
  { label: '> ₹1Cr',      min: 10000001,  max: Infinity,  fee: 14999 },
]

// ─── NO DUMMY LISTINGS - All data now comes from Supabase API ────────────────
// Use /api/get-listings endpoint for live data

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function getListingFee(price = 0) {
  const p = Number(price) || 0
  if (p > 10000000) return 14999
  if (p >= 5000000)  return 9999
  if (p >= 2500000)  return 4999
  return 2499
}

export function formatPrice(amount) {
  if (!amount || isNaN(amount)) return '₹—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

/**
 * formatArea(areaObj)          → accepts { value, unit }
 * formatArea(value, unit)      → accepts separate args
 * e.g. formatArea({ value: 5, unit: 'acre' }) → '5 Acres'
 */
export function formatArea(valueOrObj, unit) {
  const LABELS = { acre: 'Acres', cent: 'Cents', sqft: 'Sq.ft', gunta: 'Guntas' }
  if (valueOrObj && typeof valueOrObj === 'object') {
    const { value, unit: u } = valueOrObj
    if (!value) return '—'
    return `${value} ${LABELS[u] || u}`
  }
  if (!valueOrObj) return '—'
  return `${valueOrObj} ${LABELS[unit] || unit || ''}`
}

export function districtLabel(district) {
  if (!district || district === 'Tamil Nadu') return 'Tamil Nadu'
  return `${district}, Tamil Nadu`
}
