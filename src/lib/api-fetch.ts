/**
 * Centralized API fetch wrapper with automatic token refresh on 401
 * 
 * This wrapper:
 * - Gets fresh token before each request
 * - Detects 401 responses
 * - Attempts token refresh once
 * - Retries request with new token
 * - Falls back to signout if refresh fails
 */

import { getSupabaseClient } from './supabase'

const AUTH_HELPER_TIMEOUT_MS = 12000

function getBrowserStoredAccessToken(): string | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const projectRef = supabaseUrl ? new URL(supabaseUrl).hostname.split('.')[0] : ''
    const candidateKeys = new Set<string>()

    if (projectRef) {
      candidateKeys.add(`sb-${projectRef}-auth-token`)
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        candidateKeys.add(key)
      }
    }

    for (const key of candidateKeys) {
      const raw = localStorage.getItem(key)
      if (!raw) continue

      try {
        const parsed = JSON.parse(raw)
        const token =
          parsed?.currentSession?.access_token ||
          parsed?.session?.access_token ||
          parsed?.access_token ||
          null

        if (typeof token === 'string' && token.length > 0) {
          return token
        }
      } catch {
        // Ignore malformed entries and keep scanning.
      }
    }
  } catch (error) {
    console.warn('[API Fetch] Failed reading token from localStorage fallback:', error)
  }

  return null
}

async function withAuthTimeout<T>(promise: Promise<T>, timeoutMs = AUTH_HELPER_TIMEOUT_MS): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(`Auth helper timeout after ${timeoutMs}ms`)), timeoutMs)
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

export interface ApiFetchOptions extends RequestInit {
  requireAuth?: boolean // Default: true
  retryOn401?: boolean // Default: true
  signal?: AbortSignal // For request cancellation
}

/**
 * Fetch with automatic token refresh on 401
 */
export async function apiFetch(
  url: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const {
    requireAuth = true,
    retryOn401 = true,
    headers = {},
    ...fetchOptions
  } = options

  // Get token before request
  let accessToken: string | null = null
  if (requireAuth) {
    // Fast path: use persisted browser token immediately to avoid blocking request start.
    accessToken = getBrowserStoredAccessToken()

    if (accessToken) {
      console.log('[API Fetch] Using fast localStorage token path')
    }

    // Fallback path: only call getSession if no stored token was found.
    if (!accessToken) {
    try {
      const supabase = getSupabaseClient()
      const { data: { session }, error } = await withAuthTimeout(supabase.auth.getSession())
      
      if (error) {
        console.warn('[API Fetch] Error getting session:', error)
        // Don't block - let the request proceed without token
        // Server will return 401 and retry logic will refresh token
      } else if (session?.access_token) {
        accessToken = session.access_token
      } else {
        // No session found - this can happen if session is stale
        // Don't return fake 401 - let the actual request go through
        // Server will return real 401 which triggers refresh logic
        console.warn('[API Fetch] No session found, request will proceed without auth')
        accessToken = getBrowserStoredAccessToken()
        if (accessToken) {
          console.log('[API Fetch] Using localStorage token fallback')
        }
      }
    } catch (error) {
      console.error('[API Fetch] Error getting session:', error)
      if (error instanceof Error && error.message.includes('Auth helper timeout')) {
        console.warn('[API Fetch] Session read timed out, trying localStorage token fallback')
      }
      accessToken = getBrowserStoredAccessToken()
      if (accessToken) {
        console.log('[API Fetch] Using localStorage token fallback after session error')
      }
      // Don't block - let the request proceed
      // If auth is truly required, server will return 401
    }
    }
  }

  // Prepare headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  }

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`
  }

  // Make initial request
  let response = await fetch(url, {
    ...fetchOptions,
    headers: requestHeaders,
    signal: options.signal, // Support abort signal
  })

  // Handle 401 with retry logic
  if (response.status === 401 && retryOn401 && requireAuth) {
    console.log('[API Fetch] Got 401, attempting token refresh...')
    
    try {
      const supabase = getSupabaseClient()
      
      // Attempt to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = 
        await withAuthTimeout(supabase.auth.refreshSession())

      if (refreshError) {
        // Check if it's a refresh token error
        const isRefreshTokenError = refreshError?.message?.includes('refresh_token_not_found') || 
                                     refreshError?.message?.includes('Refresh Token Not Found') ||
                                     refreshError?.code === 'refresh_token_not_found'
        
        if (isRefreshTokenError) {
          console.warn('[API Fetch] Refresh token not found - signing out')
          // Sign out to clear invalid tokens
          await supabase.auth.signOut()
          
          // Return 401 - caller should handle signout
          return new Response(
            JSON.stringify({ 
              error: 'Unauthorized', 
              message: 'Session expired. Please sign in again.',
              code: 'SESSION_EXPIRED'
            }),
            {
              status: 401,
              statusText: 'Unauthorized',
              headers: { 'Content-Type': 'application/json' },
            }
          )
        }
        
        console.error('[API Fetch] Token refresh failed:', refreshError)
        // Return original 401 response
        return response
      }

      // If refresh succeeded, retry request with new token
      if (refreshedSession?.access_token) {
        console.log('[API Fetch] Token refreshed, retrying request...')
        
        const retryHeaders: HeadersInit = {
          'Content-Type': 'application/json',
          ...headers,
          'Authorization': `Bearer ${refreshedSession.access_token}`,
        }

        // Retry the request once with new token
        response = await fetch(url, {
          ...fetchOptions,
          headers: retryHeaders,
          signal: options.signal, // Preserve abort signal on retry
        })
      } else {
        // No refreshed session - return original 401
        console.warn('[API Fetch] No refreshed session available')
        return response
      }
    } catch (error) {
      console.error('[API Fetch] Error during token refresh:', error)
      if (error instanceof Error && error.message.includes('Auth helper timeout')) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Session refresh timed out. Please try again.',
            code: 'SESSION_REFRESH_TIMEOUT',
          }),
          {
            status: 401,
            statusText: 'Unauthorized',
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
      // Return original 401 response
      return response
    }
  }

  return response
}

/**
 * Convenience wrapper that parses JSON response
 * Returns the JSON response even for error status codes (so caller can handle it)
 */
export async function apiFetchJson<T = any>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const response = await apiFetch(url, options)
  
  // Parse JSON regardless of status code
  let data: any
  try {
    data = await response.json()
  } catch (parseError) {
    // If JSON parsing fails, return a structured error
    console.error('[API Fetch] Failed to parse JSON response:', parseError)
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: `Failed to parse server response. Status: ${response.status}`,
        details: parseError instanceof Error ? parseError.message : String(parseError),
      },
    } as T
  }
  
  // If response is not ok, the data should contain error information
  // Return it anyway so the caller can check response.success or handle errors
  if (!response.ok) {
    // Extract error information from various possible response formats
    const errorMessage = 
      data?.error?.message || 
      data?.message || 
      data?.error || 
      `Request failed with status ${response.status}`
    
    const errorCode = 
      data?.error?.code || 
      data?.code || 
      `HTTP_${response.status}` ||
      'API_ERROR'
    
    // Return error response in expected format
    return {
      success: false,
      error: {
        message: typeof errorMessage === 'string' ? errorMessage : 'An error occurred',
        code: typeof errorCode === 'string' ? errorCode : 'API_ERROR',
        details: data?.error?.details || data?.details,
      },
      ...data,
    } as T
  }

  return data
}
