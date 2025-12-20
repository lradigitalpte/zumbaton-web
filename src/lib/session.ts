/**
 * Session management utilities for Supabase authentication
 * 
 * NOTE: Supabase handles token refresh automatically via autoRefreshToken: true
 * We don't manually refresh tokens - Supabase does it in the background
 * These utilities just check session state, not manage refresh
 */

import { getSupabaseClient } from './supabase'
import type { Session } from '@supabase/supabase-js'

/**
 * Check if a session exists and is valid
 * Supabase handles token refresh automatically, so if session exists, it's valid
 * @returns Promise<boolean> - true if session exists, false otherwise
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const supabase = getSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return false
    }
    
    // Supabase handles token refresh automatically via autoRefreshToken: true
    // If session exists, it's valid (Supabase will auto-refresh expired tokens in background)
    return true
  } catch (error) {
    console.error('[Session] Error checking session validity:', error)
    return false
  }
}

/**
 * Get the current session
 * @returns Promise<Session | null> - Current session or null if not authenticated
 */
export async function getSession(): Promise<Session | null> {
  try {
    const supabase = getSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Session] Error getting session:', error)
      return null
    }
    
    return session
  } catch (error) {
    console.error('[Session] Error getting session:', error)
    return null
  }
}

/**
 * Get session expiry timestamp
 * @returns Promise<number | null> - Expiry timestamp in seconds, or null if no session
 */
export async function getSessionExpiry(): Promise<number | null> {
  try {
    const session = await getSession()
    return session?.expires_at || null
  } catch (error) {
    console.error('[Session] Error getting session expiry:', error)
    return null
  }
}

/**
 * Refresh session if needed (within 5 minutes of expiry)
 * @returns Promise<Session | null> - Refreshed session or null if refresh failed
 */
export async function refreshSessionIfNeeded(): Promise<Session | null> {
  try {
    const supabase = getSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }
    
    // Only refresh if we have a refresh token
    if (!session.refresh_token) {
      return session
    }
    
    // Check if token expires within 5 minutes (300 seconds)
    const expiresAt = session.expires_at || 0
    const now = Date.now() / 1000
    const timeUntilExpiry = expiresAt - now
    
    // If token expires within 5 minutes, refresh it
    if (timeUntilExpiry < 300) {
      try {
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession()
        
        if (refreshError) {
          // Don't log refresh errors if refresh token is missing (expected during sign-in)
          if (refreshError.message?.includes('Refresh Token Not Found') || 
              refreshError.message?.includes('refresh_token_not_found')) {
            return null
          }
          console.error('[Session] Error refreshing session:', refreshError)
          return session // Return original session if refresh fails
        }
        
        // refreshSession returns { data: { session }, error }
        // So refreshedSession is already the session object
        return refreshedSession || session
      } catch (refreshErr) {
        // Silently handle refresh errors (common when no session exists)
        return session
      }
    }
    
    return session
  } catch (error) {
    // Silently handle errors (common when no session exists)
    return null
  }
}

/**
 * Clear session (sign out)
 * @returns Promise<void>
 */
export async function clearSession(): Promise<void> {
  try {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('[Session] Error clearing session:', error)
  }
}

/**
 * Check if user is authenticated (has valid session)
 * @returns Promise<boolean>
 */
export async function isAuthenticated(): Promise<boolean> {
  return await isSessionValid()
}

/**
 * Get user ID from session
 * @returns Promise<string | null> - User ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  try {
    const session = await getSession()
    return session?.user?.id || null
  } catch (error) {
    console.error('[Session] Error getting user ID:', error)
    return null
  }
}

