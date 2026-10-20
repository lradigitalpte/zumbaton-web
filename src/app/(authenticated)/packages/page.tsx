// Server wrapper: prefetch promo eligibility (if user authenticated) and render client component
import PackagesClient from './PackagesClient'
import { cookies, headers } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getInternalOrigin(): Promise<string> {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  if (host) {
    const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
    return `${proto}://${host}`
  }
  return (
    process.env.NEXT_PUBLIC_WEB_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3001'
  )
}

async function fetchPromoWithCookies() {
  try {
    const cookieStore = await cookies()
    const cookieHeader = cookieStore.toString()
    if (!cookieHeader) return null

    const base = await getInternalOrigin()
    const res = await fetch(`${base}/api/promos/eligibility`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.data ?? data
  } catch {
    return null
  }
}

export default async function PackagesPage() {
  const promo = await fetchPromoWithCookies()
  return <PackagesClient initialPromo={promo} />
}
