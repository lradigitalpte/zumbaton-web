/**
 * Direct Supabase queries for token packages
 */

import { getSupabaseClient, TABLES } from './supabase'

export interface Package {
  id: string
  name: string
  description: string | null
  token_count: number
  price_cents: number
  currency: string
  validity_days: number
  class_types: string[]
  is_active: boolean
  is_popular?: boolean
}

/**
 * Get all available packages for purchase
 */
export async function getAvailablePackages(): Promise<Package[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from(TABLES.PACKAGES)
    .select('*')
    .eq('is_active', true)
    .order('token_count', { ascending: true })

  if (error) {
    console.error('Error fetching packages:', error)
    return []
  }

  return (data || []).map((pkg: any) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    token_count: pkg.token_count,
    price_cents: pkg.price_cents,
    currency: pkg.currency || 'USD',
    validity_days: pkg.validity_days,
    class_types: pkg.class_types || ['all'],
    is_active: pkg.is_active,
    // Mark as popular if it's the middle package or has most tokens
    is_popular: false, // Can be calculated based on business logic
  }))
}

