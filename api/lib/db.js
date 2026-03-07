// api/lib/db.js — Supabase PostgreSQL connection for LandHive
//
// Uses Supabase JS client for serverless-optimized Postgres access.
// Connection pooling handled by Supabase's Supavisor.
//
// Env vars:
//   NEXT_PUBLIC_LH_SUPABASE_URL        — Supabase project URL
//   LH_SUPABASE_SERVICE_ROLE_KEY       — Service role key (bypass RLS, full access)
//
// For client-side auth-aware queries (from React):
//   Use NEXT_PUBLIC_LH_SUPABASE_URL + LH_SUPABASE_ANON_KEY

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_LH_SUPABASE_URL
const serviceKey  = process.env.LH_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) throw new Error('❌ NEXT_PUBLIC_LH_SUPABASE_URL is not set')
if (!serviceKey)  throw new Error('❌ LH_SUPABASE_SERVICE_ROLE_KEY is not set')

/**
 * Server-side Supabase client with SERVICE ROLE key.
 * Bypasses Row Level Security — use only in API routes.
 * DO NOT expose this client to the browser.
 */
export const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Helper: get Supabase client (alias for backward compat with MongoDB code)
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getDb() {
  return supabase
}

/**
 * PostgreSQL Tables in Supabase:
 *
 *  public.listings       — property listings
 *  public.payments       — PayU payment transactions
 *  public.users          — extended Clerk user profiles
 *  public.inquiries      — buyer inquiries to sellers
 *
 * Schema file: /supabase/schema.sql
 * Indexes and RLS policies are defined there.
 */

export default supabase
