/**
 * Client-side helpers for the API-first pattern (avoid direct Supabase from browser).
 * Use in libs (e.g. token-transactions-queries, dashboard-queries) when
 * typeof window !== 'undefined': fetch from /api/... first, then fall back to Supabase.
 *
 * @see CLIENT_TO_API_PATTERN.md
 */

/** Response shape from our GET APIs: { success: true, data: T } | { success: false, error: string } */
export interface ApiResult<T> {
  success: boolean
  data?: T
  error?: string
}

/** Default request timeout (ms). Prevents bookings/dashboard-style requests from hanging. */
const DEFAULT_FETCH_TIMEOUT_MS = 12_000

/**
 * GET JSON from origin + path + query params. Parses { success, data }.
 * Returns data when success && data, else null. On fetch/parse error or timeout, returns null and logs.
 * Only runs when typeof window !== 'undefined'; otherwise returns null immediately.
 * Uses AbortController + timeout so requests (e.g. GET /api/bookings) don't hang like dashboard/transactions.
 *
 * Use for API-first flows: try fetchApiData, then fall back to direct Supabase if null.
 *
 * @param path - e.g. '/api/token-transactions' (no leading origin)
 * @param params - optional query params (userId, filter, etc.)
 * @param logLabel - optional label for console.warn on failure (e.g. 'Token Transactions')
 * @param timeoutMs - request timeout in ms; default 12s so bookings page doesn't keep loading
 */
export async function fetchApiData<T>(
  path: string,
  params?: Record<string, string>,
  logLabel?: string,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS
): Promise<T | null> {
  if (typeof window === 'undefined') return null

  const base = window.location.origin
  const qs = params && Object.keys(params).length > 0
    ? '?' + new URLSearchParams(params).toString()
    : ''
  const url = `${base}${path}${qs}`

  const ac = new AbortController()
  const timeoutId = setTimeout(() => ac.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      signal: ac.signal,
    })
    clearTimeout(timeoutId)
    if (!res.ok) {
      const label = logLabel ? `[${logLabel}] ` : ''
      console.warn(`${label}API fetch not ok: ${res.status} ${res.statusText}`)
      return null
    }

    const json = (await res.json()) as ApiResult<T>
    if (json.success && json.data != null) return json.data as T
    return null
  } catch (e) {
    clearTimeout(timeoutId)
    const label = logLabel ? `[${logLabel}] ` : ''
    const isAbort = e instanceof Error && e.name === 'AbortError'
    if (isAbort) {
      console.warn(`${label}API fetch timed out after ${timeoutMs}ms`)
    } else {
      console.warn(`${label}API fetch failed:`, e)
    }
    return null
  }
}
