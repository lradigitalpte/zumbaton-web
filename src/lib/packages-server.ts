import { cache } from 'react'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { mapPackageRow, type Package } from '@/lib/packages-queries'

export { buildPricingMetadataDescription } from '@/lib/packages-utils'

/**
 * Fetch active public packages for SSR, ISR, and the /api/packages route.
 * Uses the admin client so pricing is available without relying on RLS.
 */
export const getPublicPackages = cache(async function getPublicPackages(
  packageType?: 'adults' | 'kids'
): Promise<Package[]> {
  const supabase = getSupabaseAdminClient()

  let query = supabase.from('packages').select('*').eq('is_active', true)

  if (packageType === 'adults') {
    query = query.in('package_type', ['adult', 'all'])
  } else if (packageType === 'kids') {
    query = query.eq('package_type', 'kid')
  }

  const { data, error } = await query.order('token_count', { ascending: true })

  if (error) {
    console.error('[Packages] Error fetching public packages:', error)
    return []
  }

  return (data || []).map(mapPackageRow)
})
