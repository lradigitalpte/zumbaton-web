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
  package_type: 'adult' | 'kid' | 'all'
  age_requirement?: string | null
  is_unlimited?: boolean
  is_active: boolean
  is_popular?: boolean
}

export function mapPackageRow(pkg: Record<string, unknown>): Package {
  return {
    id: pkg.id as string,
    name: pkg.name as string,
    description: (pkg.description as string | null) ?? null,
    token_count: pkg.token_count as number,
    price_cents: pkg.price_cents as number,
    currency: (pkg.currency as string) || 'SGD',
    validity_days: pkg.validity_days as number,
    class_types: (pkg.class_types as string[]) || ['all'],
    package_type: (pkg.package_type as Package['package_type']) || 'adult',
    age_requirement: (pkg.age_requirement as string | null) ?? null,
    is_unlimited: Boolean(pkg.is_unlimited),
    is_active: Boolean(pkg.is_active),
    is_popular: false,
  }
}

/**
 * Get all available packages for purchase
 * @param packageType - Optional filter by 'adults' or 'kids'
 *   - 'adults': returns packages where package_type is 'adult' or 'all'
 *   - 'kids': returns packages where package_type is 'kid'
 * 
 * This function uses the API endpoint which bypasses RLS using admin client.
 * Browser requests are API-only; server-side keeps direct Supabase fallback.
 */
export async function getAvailablePackages(packageType?: 'adults' | 'kids'): Promise<Package[]> {
  const fetchWithTimeout = async (url: string, timeoutMs = 10000): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // Browser path is API-only to avoid hidden fallback drift.
  if (typeof window !== 'undefined') {
    try {
      const packageTypeParam = packageType ? `?packageType=${packageType}` : ''
      const baseUrl = window.location.origin
      const response = await fetchWithTimeout(`${baseUrl}/api/packages${packageTypeParam}`, 10000)

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          return (result.data || []).map(mapPackageRow)
        }

        throw new Error('Packages API returned invalid payload')
      } else {
        const text = await response.text().catch(() => '')
        throw new Error(`Packages API failed (${response.status})${text ? `: ${text.slice(0, 180)}` : ''}`)
      }
    } catch (apiError) {
      console.error('Packages API error in browser (no client fallback):', apiError)
      throw apiError instanceof Error ? apiError : new Error('Packages API request failed')
    }
  }

  // Server-side fallback to direct Supabase query.
  const supabase = getSupabaseClient()

  let query = supabase
    .from(TABLES.PACKAGES)
    .select('*')
    .eq('is_active', true)

  // Filter by package type if provided
  if (packageType === 'adults') {
    // Adults packages: include 'adult' and 'all' types
    query = query.in('package_type', ['adult', 'all'])
  } else if (packageType === 'kids') {
    query = query.eq('package_type', 'kid')
  }

  const { data, error } = await query.order('token_count', { ascending: true })

  if (error) {
    console.error('Error fetching packages:', error.message)
    return []
  }

  return (data || []).map(mapPackageRow)
}

