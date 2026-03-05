// src/data/listings.js
// Shared data & helpers used across LandHive frontend

// ─── Tamil Nadu Districts (38) ────────────────────────────────────────────────
export const TN_DISTRICTS = [
  'Ariyalur',
  'Chengalpattu',
  'Chennai',
  'Coimbatore',
  'Cuddalore',
  'Dharmapuri',
  'Dindigul',
  'Erode',
  'Kallakurichi',
  'Kancheepuram',
  'Kanyakumari',
  'Karur',
  'Krishnagiri',
  'Madurai',
  'Mayiladuthurai',
  'Nagapattinam',
  'Namakkal',
  'Nilgiris',
  'Perambalur',
  'Pudukkottai',
  'Ramanathapuram',
  'Ranipet',
  'Salem',
  'Sivaganga',
  'Tenkasi',
  'Thanjavur',
  'Theni',
  'Thoothukudi',
  'Tiruchirappalli',
  'Tirunelveli',
  'Tirupathur',
  'Tiruppur',
  'Tiruvallur',
  'Tiruvannamalai',
  'Tiruvarur',
  'Vellore',
  'Villupuram',
  'Virudhunagar',
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
// Property Value        →  Listing Fee
// < ₹25 Lakh           →  ₹2,499
// ₹25L  – ₹50L         →  ₹4,999
// ₹50L  – ₹1 Crore     →  ₹9,999
// > ₹1 Crore           →  ₹14,999
export const LISTING_FEE_TIERS = [
  { label: '< ₹25L',      min: 0,         max: 2499999,   fee: 2499  },
  { label: '₹25L–₹50L',  min: 2500000,   max: 4999999,   fee: 4999  },
  { label: '₹50L–₹1Cr',  min: 5000000,   max: 10000000,  fee: 9999  },
  { label: '> ₹1Cr',      min: 10000001,  max: Infinity,  fee: 14999 },
]

/**
 * Returns the listing fee for a given property price.
 * @param {number} price - Total property value in INR
 * @returns {number} - Listing fee in INR
 */
export function getListingFee(price = 0) {
  const p = Number(price) || 0
  if (p > 10000000) return 14999  // > ₹1 Cr
  if (p >= 5000000)  return 9999  // ₹50L – ₹1Cr
  if (p >= 2500000)  return 4999  // ₹25L – ₹50L
  return 2499                      // < ₹25L
}

/**
 * Formats a price in INR to readable Indian format.
 * e.g. 2500000 → '₹25.00 L'  |  12500000 → '₹1.25 Cr'
 * @param {number} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  if (!amount || isNaN(amount)) return '₹—'
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${Number(amount).toLocaleString('en-IN')}`
}

/**
 * Formats area with unit label.
 * e.g. formatArea(5.5, 'acre') → '5.5 Acres'
 */
export function formatArea(value, unit) {
  if (!value) return '—'
  const labels = {
    acre:  'Acres',
    cent:  'Cents',
    sqft:  'Sq.ft',
    gunta: 'Guntas',
  }
  return `${value} ${labels[unit] || unit}`
}

/**
 * Returns a short district + state label.
 * e.g. districtLabel('Coimbatore') → 'Coimbatore, Tamil Nadu'
 */
export function districtLabel(district) {
  if (!district || district === 'Tamil Nadu') return 'Tamil Nadu'
  return `${district}, Tamil Nadu`
}
