// Server wrapper: prefetch promo eligibility (if user authenticated) and render client component
import PackagesClient from './PackagesClient'
import { cookies } from 'next/headers'

async function fetchPromoWithCookies() {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    const base = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
    const url = new URL('/api/promos/eligibility', base).toString()
    
    console.log('[Packages] Fetching promo with cookies:', !!cookieHeader)
    
    const res = await fetch(url, {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      cache: 'no-store',
    })
    
    console.log('[Packages] Promo fetch response status:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.log('[Packages] Promo fetch error:', errorText)
      return null
    }
    
    const data = await res.json()
    console.log('[Packages] Promo data received:', JSON.stringify(data, null, 2))
    
    return data.data || data
  } catch (err) {
    console.warn('[Packages] Failed to prefetch promo:', err)
    return null
  }
}

export default async function PackagesPage() {
  const promo = await fetchPromoWithCookies()
  return <PackagesClient initialPromo={promo} />
}
