import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase client singleton
let supabaseClient: SupabaseClient | null = null

// Get environment variables
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}

// Create Supabase client (singleton)
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}

// Create Supabase client for server-side (with service role)
export function getSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin environment variables. ' +
      'Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
    )
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Export default client
export const supabase = getSupabaseClient()

// Database table names (aligned with TOKEN_ENGINE_PLAN.md)
export const TABLES = {
  PACKAGES: 'packages',
  USER_PACKAGES: 'user_packages',
  CLASSES: 'classes',
  BOOKINGS: 'bookings',
  ATTENDANCES: 'attendances',
  TOKEN_TRANSACTIONS: 'token_transactions',
  WAITLIST: 'waitlist',
} as const

// Supabase error codes
export const SUPABASE_ERRORS = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  CHECK_VIOLATION: '23514',
  NOT_NULL_VIOLATION: '23502',
} as const

// Helper to check if error is a specific Supabase error
export function isSupabaseError(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  )
}
