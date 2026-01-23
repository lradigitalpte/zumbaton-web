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
    signal: options.signal, // Support abort signal
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
          signal: options.signal, // Preserve abort signal on retry
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
