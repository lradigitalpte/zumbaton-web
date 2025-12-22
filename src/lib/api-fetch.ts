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

export interface ApiFetchOptions extends RequestInit {
  requireAuth?: boolean // Default: true
  retryOn401?: boolean // Default: true
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

  // Get fresh token before request
  let accessToken: string | null = null
  if (requireAuth) {
    try {
      const supabase = getSupabaseClient()
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.warn('[API Fetch] Error getting session:', error)
      } else if (session?.access_token) {
        accessToken = session.access_token
      } else if (requireAuth) {
        // No session but auth required - return 401 immediately
        return new Response(
          JSON.stringify({ error: 'Unauthorized', message: 'No valid session' }),
          {
            status: 401,
            statusText: 'Unauthorized',
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    } catch (error) {
      console.error('[API Fetch] Error getting session:', error)
      if (requireAuth) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized', message: 'Failed to get session' }),
          {
            status: 401,
            statusText: 'Unauthorized',
            headers: { 'Content-Type': 'application/json' },
          }
        )
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
  })

  // Handle 401 with retry logic
  if (response.status === 401 && retryOn401 && requireAuth) {
    console.log('[API Fetch] Got 401, attempting token refresh...')
    
    try {
      const supabase = getSupabaseClient()
      
      // Attempt to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = 
        await supabase.auth.refreshSession()

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
        })
      } else {
        // No refreshed session - return original 401
        console.warn('[API Fetch] No refreshed session available')
        return response
      }
    } catch (error) {
      console.error('[API Fetch] Error during token refresh:', error)
      // Return original 401 response
      return response
    }
  }

  return response
}

/**
 * Convenience wrapper that parses JSON response
 */
export async function apiFetchJson<T = any>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const response = await apiFetch(url, options)
  
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage)
  }

  return response.json()
}
