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

// ─── Sample Listings (shown until MongoDB is live) ─────────────────────────
export const LISTINGS = [
  {
    id: '1',
    title: 'Fertile 5-Acre Agricultural Land near Coimbatore',
    landType: 'agricultural',
    area: { value: 5, unit: 'acre' },
    price: { total: 3500000, perAcre: 700000 },
    location: { district: 'Coimbatore', village: 'Sulur', state: 'Tamil Nadu' },
    photos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600'],
    verified: true, featured: true, viewCount: 243, createdAt: '2026-02-10',
  },
  {
    id: '2',
    title: '2-Acre Residential Plot in Madurai Outskirts',
    landType: 'residential',
    area: { value: 2, unit: 'acre' },
    price: { total: 4800000, perAcre: 2400000 },
    location: { district: 'Madurai', village: 'Avaniyapuram', state: 'Tamil Nadu' },
    photos: ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600'],
    verified: true, featured: false, viewCount: 178, createdAt: '2026-02-14',
  },
  {
    id: '3',
    title: 'Commercial Land on NH-44 Salem',
    landType: 'commercial',
    area: { value: 1.5, unit: 'acre' },
    price: { total: 9200000, perAcre: 6133333 },
    location: { district: 'Salem', village: 'Omalur', state: 'Tamil Nadu' },
    photos: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600'],
    verified: false, featured: true, viewCount: 312, createdAt: '2026-02-18',
  },
  {
    id: '4',
    title: '10-Acre Farm Land with Borewell — Thanjavur',
    landType: 'farm',
    area: { value: 10, unit: 'acre' },
    price: { total: 7500000, perAcre: 750000 },
    location: { district: 'Thanjavur', village: 'Papanasam', state: 'Tamil Nadu' },
    photos: ['https://images.unsplash.com/photo-1500076656116-558758f991c1?w=600'],
    verified: true, featured: false, viewCount: 95, createdAt: '2026-02-20',
  },
  {
    id: '5',
    title: 'NA Residential Plot 1200 sqft — Chennai OMR',
    landType: 'plot',
    area: { value: 1200, unit: 'sqft' },
    price: { total: 2200000, perAcre: null },
    location: { district: 'Chennai', village: 'Sholinganallur', state: 'Tamil Nadu' },
    photos: ['https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600'],
    verified: true, featured: true, viewCount: 520, createdAt: '2026-02-22',
  },
  {
    id: '6',
    title: '3 BHK Independent House — Tiruppur',
    landType: 'house',
    area: { value: 1800, unit: 'sqft' },
    price: { total: 5500000, perAcre: null },
    location: { district: 'Tiruppur', village: 'Avinashi Road', state: 'Tamil Nadu' },
    photos: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600'],
    verified: false, featured: false, viewCount: 141, createdAt: '2026-02-25',
  },
]

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
