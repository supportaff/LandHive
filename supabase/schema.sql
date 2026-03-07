-- supabase/schema.sql
-- LandHive PostgreSQL Schema for Supabase
-- Run this in Supabase SQL Editor: Database → SQL Editor → New Query → Paste & Run

-- ─── Drop existing tables (development only — removes all data!) ────────────
-- DROP TABLE IF EXISTS public.inquiries CASCADE;
-- DROP TABLE IF EXISTS public.payments CASCADE;
-- DROP TABLE IF EXISTS public.listings CASCADE;
-- DROP TABLE IF EXISTS public.users CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════
-- USERS — extended Clerk user profiles
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id         TEXT UNIQUE NOT NULL,          -- Clerk userId
  email            TEXT NOT NULL,
  name             TEXT,
  phone            TEXT,
  role             TEXT DEFAULT 'buyer',          -- 'buyer' | 'seller' | 'admin'
  total_paid       NUMERIC DEFAULT 0,
  total_listings   INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ═══════════════════════════════════════════════════════════════════════════
-- LISTINGS — property listings
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.listings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           TEXT NOT NULL,                         -- Clerk userId
  title             TEXT NOT NULL,
  land_type         TEXT NOT NULL,                         -- 'agricultural' | 'residential' | 'commercial' | 'farm' | 'na'
  
  -- Area
  area_value        NUMERIC NOT NULL,
  area_unit         TEXT DEFAULT 'acre',                   -- 'acre' | 'cent' | 'sqft' | 'gunta'
  survey_number     TEXT,
  
  -- Price
  price_total       NUMERIC NOT NULL,
  price_per_acre    NUMERIC,
  
  description       TEXT,
  
  -- Location
  location_state    TEXT DEFAULT 'Tamil Nadu',
  location_district TEXT NOT NULL,
  location_village  TEXT,
  location_landmark TEXT,
  location_lat      NUMERIC,
  location_lng      NUMERIC,
  
  -- Media
  photos            TEXT[] DEFAULT '{}',                   -- array of image URLs
  documents         TEXT[] DEFAULT '{}',                   -- array of document URLs
  
  -- Seller info (denormalized for fast reads)
  seller_name       TEXT NOT NULL,
  seller_email      TEXT NOT NULL,
  seller_phone      TEXT NOT NULL,
  seller_whatsapp   TEXT,
  
  -- KYC
  kyc_status         TEXT DEFAULT 'pending',              -- 'pending' | 'verified' | 'rejected'
  kyc_aadhaar_name   TEXT,
  kyc_aadhaar_number TEXT,
  kyc_pan_number     TEXT,
  kyc_submitted_at   TIMESTAMPTZ,
  kyc_verified_at    TIMESTAMPTZ,
  kyc_rejected_at    TIMESTAMPTZ,
  kyc_rejected_reason TEXT,
  
  -- Payment
  payment_status     TEXT DEFAULT 'pending',              -- 'pending' | 'paid' | 'failed'
  payment_txnid      TEXT,
  payment_mihpayid   TEXT,
  payment_amount     NUMERIC,
  payment_mode       TEXT,
  payment_paid_at    TIMESTAMPTZ,
  
  listing_fee        NUMERIC NOT NULL,
  status             TEXT DEFAULT 'pending',              -- 'pending' | 'pending_kyc' | 'approved' | 'rejected'
  verified           BOOLEAN DEFAULT false,
  kyc_verified       BOOLEAN DEFAULT false,
  featured           BOOLEAN DEFAULT false,
  view_count         INTEGER DEFAULT 0,
  inquiry_count      INTEGER DEFAULT 0,
  expires_at         TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_district ON public.listings(location_district);
CREATE INDEX IF NOT EXISTS idx_listings_land_type ON public.listings(land_type);
CREATE INDEX IF NOT EXISTS idx_listings_price ON public.listings(price_total);
CREATE INDEX IF NOT EXISTS idx_listings_created ON public.listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON public.listings(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- PAYMENTS — PayU transaction records
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  txnid             TEXT UNIQUE NOT NULL,                 -- PayU transaction ID
  mihpayid          TEXT,                                 -- PayU payment ID
  listing_id        UUID REFERENCES public.listings(id),
  user_id           TEXT NOT NULL,                        -- Clerk userId
  
  amount            NUMERIC NOT NULL,
  productinfo       TEXT,
  firstname         TEXT,
  email             TEXT,
  phone             TEXT,
  
  status            TEXT,                                 -- 'success' | 'failure' | 'pending'
  payment_mode      TEXT,
  bank_code         TEXT,
  bank_ref_num      TEXT,
  card_num          TEXT,
  name_on_card      TEXT,
  issuing_bank      TEXT,
  error_code        TEXT,
  error_message     TEXT,
  
  response_hash     TEXT,
  hash_valid        BOOLEAN,
  mode              TEXT DEFAULT 'test',                  -- 'test' | 'live'
  raw_response      JSONB,
  
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_txnid ON public.payments(txnid);
CREATE INDEX IF NOT EXISTS idx_payments_listing ON public.payments(listing_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- INQUIRIES — buyer inquiries to sellers
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.inquiries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id        UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  listing_title     TEXT,
  
  seller_id         TEXT NOT NULL,                        -- Clerk userId of seller
  buyer_id          TEXT,                                 -- Clerk userId (null if guest)
  buyer_name        TEXT NOT NULL,
  buyer_phone       TEXT NOT NULL,
  buyer_email       TEXT,
  message           TEXT,
  
  status            TEXT DEFAULT 'new',                   -- 'new' | 'contacted' | 'closed'
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_listing ON public.inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_seller ON public.inquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_buyer ON public.inquiries(buyer_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════════════════════════
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Public read access for approved listings (for anonymous buyers)
CREATE POLICY "Public can view approved listings"
  ON public.listings FOR SELECT
  USING (status = 'approved');

-- Users can view their own data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Sellers can view inquiries on their listings"
  ON public.inquiries FOR SELECT
  USING (auth.uid()::text = seller_id);

-- Service role bypasses all RLS (used by API routes)
-- No additional policies needed for service_role

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- SAMPLE DATA (optional — for development)
-- ═══════════════════════════════════════════════════════════════════════════
/*
INSERT INTO public.listings (
  user_id, title, land_type, area_value, area_unit,
  price_total, price_per_acre, description,
  location_district, location_village, location_lat, location_lng,
  seller_name, seller_email, seller_phone,
  listing_fee, status, verified, kyc_verified
) VALUES (
  'user_test123',
  'Premium 5 Acre Agricultural Land in Coimbatore',
  'agricultural',
  5.0, 'acre',
  3500000, 700000,
  'Fertile red soil, 2 borewells, 3-phase power, tar road access, 5km from Sulur.',
  'Coimbatore', 'Sulur',
  11.0234, 77.1234,
  'Rajesh Kumar', 'rajesh@example.com', '+91 98765 43210',
  2499, 'approved', true, true
);
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- NOTES
-- ═══════════════════════════════════════════════════════════════════════════
-- 1. Run this script in Supabase SQL Editor to create all tables
-- 2. Service role key (used in api/lib/db.js) bypasses RLS
-- 3. Anon key (used in React) respects RLS policies
-- 4. For real-time subscriptions, enable Realtime on tables in Dashboard
