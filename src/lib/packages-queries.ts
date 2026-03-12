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
  is_active: boolean
  is_popular?: boolean
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
          console.log(`📦 Fetched ${result.data.length} packages via API for type: ${packageType || 'all'}`)
          return (result.data || []).map((pkg: any) => ({
            id: pkg.id,
            name: pkg.name,
            description: pkg.description,
            token_count: pkg.token_count,
            price_cents: pkg.price_cents,
            currency: pkg.currency || 'SGD',
            validity_days: pkg.validity_days,
            class_types: pkg.class_types || ['all'],
            package_type: pkg.package_type || 'adult',
            age_requirement: pkg.age_requirement || null,
            is_active: pkg.is_active,
            is_popular: false,
          }))
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

  // Debug: Check current session/auth state
  if (process.env.NODE_ENV === 'development') {
    const { data: { session } } = await supabase.auth.getSession()
    console.log('🔐 Current session:', session ? 'Authenticated' : 'Anonymous')
    console.log('🔐 User ID:', session?.user?.id || 'null (anonymous)')
  }

  let query = supabase
    .from(TABLES.PACKAGES)
    .select('*')
    .eq('is_active', true)

  // Filter by package type if provided
  if (packageType === 'adults') {
    // Adults packages: include 'adult' and 'all' types
    query = query.in('package_type', ['adult', 'all'])
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Filtering for adults packages: package_type IN (adult, all)')
    }
  } else if (packageType === 'kids') {
    // Kids packages: only 'kid' type
    query = query.eq('package_type', 'kid')
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Filtering for kids packages: package_type = kid')
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 No package type filter - fetching all active packages')
    }
  }

  const { data, error } = await query.order('token_count', { ascending: true })

  if (error) {
    console.error('❌ Error fetching packages:', error)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Error details:', error.details)
    console.error('Error hint:', error.hint)
    console.error('Package type filter:', packageType)
    console.error('Query details:', { 
      table: TABLES.PACKAGES, 
      filter: packageType === 'adults' ? ['adult', 'all'] : packageType === 'kids' ? 'kid' : 'all' 
    })
    return []
  }

  // Enhanced logging
  console.log(`📦 Fetched ${data?.length || 0} packages for type: ${packageType || 'all'}`)
  if (data && data.length > 0) {
    console.log('✅ Package data:', data)
    console.log('Package details:', data.map(p => ({
      id: p.id,
      name: p.name,
      package_type: p.package_type,
      is_active: p.is_active,
      price_cents: p.price_cents
    })))
  } else {
    console.warn('⚠️ No packages returned!')
    console.warn('Possible issues:')
    console.warn('  1. RLS policy blocking anonymous access')
    console.warn('  2. Packages not active (is_active = false)')
    console.warn('  3. Package type filter mismatch')
    console.warn('  4. Packages don\'t exist in database')
    console.warn('')
    console.warn('🔧 To fix: Run fix_packages_rls.sql in Supabase SQL Editor')
  }

  return (data || []).map((pkg: any) => ({
    id: pkg.id,
    name: pkg.name,
    description: pkg.description,
    token_count: pkg.token_count,
    price_cents: pkg.price_cents,
    currency: pkg.currency || 'SGD',
    validity_days: pkg.validity_days,
    class_types: pkg.class_types || ['all'],
    package_type: pkg.package_type || 'adult',
    age_requirement: pkg.age_requirement || null,
    is_active: pkg.is_active,
    // Mark as popular if it's the middle package or has most tokens
    is_popular: false, // Can be calculated based on business logic
  }))
}

