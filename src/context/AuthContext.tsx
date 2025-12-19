'use client'

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'
import { supabase, getSupabaseClient } from '@/lib/supabase'
import type { UserResponse, SignInResponse, SignUpResponse, SignInRequest, SignUpRequest } from '@/api/schemas'
import { ApiResponse } from '@/lib/api-error'
import type { User } from '@supabase/supabase-js'
import { refreshSessionIfNeeded, isSessionValid } from '@/lib/session'

const AUTH_TIMEOUT = 10000 // 10 seconds max for auth check
const SIGN_IN_TIMEOUT = 10000 // 10 seconds max for sign-in operation (reduced from 15s)
const SUPABASE_CALL_TIMEOUT = 8000 // 8 seconds max for Supabase API call

// Helper function to add timeout to any promise
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutId: NodeJS.Timeout
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage))
    }, timeoutMs)
  })
  
  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timeoutPromise,
  ])
}

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (credentials: SignInRequest) => Promise<ApiResponse<SignInResponse>>
  signUp: (data: SignUpRequest) => Promise<ApiResponse<SignUpResponse>>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  setUser: (user: UserResponse | null) => void
  checkSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Map Supabase user to UserResponse
async function mapSupabaseUserToUserResponse(supabaseUser: User | null): Promise<UserResponse | null> {
  if (!supabaseUser) return null

  try {
    // Fetch user profile from database
    const { data: profile, error } = await getSupabaseClient()
      .from('user_profiles')
      .select('id, email, name, role, created_at, updated_at')
      .eq('id', supabaseUser.id)
      .single()

    if (error || !profile) {
      // If profile doesn't exist, return basic user info from auth
      return {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
        email: supabaseUser.email || '',
        role: (supabaseUser.user_metadata?.role as 'user' | 'admin' | 'instructor' | 'super_admin') || 'user',
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
      }
    }

    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role as 'user' | 'admin' | 'instructor' | 'super_admin',
      createdAt: profile.created_at,
      updatedAt: profile.updated_at || profile.created_at,
    }
  } catch (error) {
    console.error('[Auth] Error mapping user:', error)
    // Fallback to basic user info
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: 'user',
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at || supabaseUser.created_at,
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loadingTooLong, setLoadingTooLong] = useState(false)
  const hasInitializedRef = useRef(false)
  const isInitializingRef = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitializedRef.current || isInitializingRef.current) {
      return
    }
    
    // Mark as initializing immediately to prevent race conditions
    hasInitializedRef.current = true
    isInitializingRef.current = true

    let isMounted = true
    let slowLoadingTimeout: NodeJS.Timeout

    const init = async () => {
      // Show "taking too long" message after 5 seconds
      slowLoadingTimeout = setTimeout(() => {
        if (isMounted) {
          setLoadingTooLong(true)
        }
      }, 5000)

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.warn('[Auth] Auth initialization timed out after', AUTH_TIMEOUT, 'ms')
          setIsLoading(false)
          isInitializingRef.current = false
        }
      }, AUTH_TIMEOUT)

      try {
        await initializeAuth()
      } finally {
        clearTimeout(timeoutId)
        clearTimeout(slowLoadingTimeout)
        isInitializingRef.current = false
      }
    }

    init()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          const userResponse = await mapSupabaseUserToUserResponse(session.user)
          setUser(userResponse)
          setIsAuthenticated(true)
          setIsLoading(false)
          setLoadingTooLong(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setIsAuthenticated(false)
          setIsLoading(false)
          setLoadingTooLong(false)
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const userResponse = await mapSupabaseUserToUserResponse(session.user)
          setUser(userResponse)
        }
      }
    )

    // Set up periodic session refresh (every 5 minutes)
    // Check session directly instead of using isAuthenticated state to avoid re-renders
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await refreshSessionIfNeeded()
        }
      } catch (error) {
        // Silently handle errors
      }
    }, 5 * 60 * 1000) // 5 minutes

    return () => {
      isMounted = false
      subscription.unsubscribe()
      clearInterval(refreshInterval)
    }
  }, []) // Empty dependency array - only run once on mount

  const initializeAuth = async () => {
    // Note: isInitializingRef is managed by the calling useEffect
    // Don't check it here - just do the initialization
    setIsLoading(true)
    
    try {
      // Get current session first with timeout to prevent hanging
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Session check timed out')), SUPABASE_CALL_TIMEOUT)
      )
      
      let sessionResult: { data: { session: any }; error: any }
      try {
        sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as { data: { session: any }; error: any }
      } catch (timeoutError: any) {
        console.warn('[Auth] Session check timed out, proceeding without session')
        // On timeout, assume no session and continue
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        isInitializingRef.current = false
        return
      }

      const { data: { session }, error } = sessionResult

      if (error) {
        console.error('[Auth] Session error:', error)
        setUser(null)
        setIsAuthenticated(false)
        setIsLoading(false)
        isInitializingRef.current = false
        return
      }

      if (session?.user) {
        // Don't refresh here - let Supabase auto-refresh handle it
        // Only refresh if explicitly needed (not during initialization)
        
        // Create user response immediately from auth data (don't wait for profile)
        const userResponse: UserResponse = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          role: (session.user.user_metadata?.role as 'user' | 'admin' | 'instructor' | 'super_admin') || 'user',
          createdAt: session.user.created_at,
          updatedAt: session.user.updated_at || session.user.created_at,
        }
        
        // Set user immediately
        setUser(userResponse)
        setIsAuthenticated(true)
        
        // Fetch profile in background and update if it exists (non-blocking)
        // Add timeout to prevent hanging
        withTimeout(
          mapSupabaseUserToUserResponse(session.user),
          5000,
          'Profile fetch timed out'
        ).then((profileUser) => {
          if (profileUser) {
            setUser(profileUser)
          }
        }).catch((err) => {
          console.warn('[Auth] Background profile fetch failed:', err)
          // Ignore - we already have user from metadata
        })
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('[Auth] Initialization failed:', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
      isInitializingRef.current = false
    }
  }

  const checkSession = async (): Promise<boolean> => {
    try {
      const isValid = await isSessionValid()
      if (isValid) {
        // Refresh session if needed
        await refreshSessionIfNeeded()
        // Re-initialize auth to update user state
        await initializeAuth()
      }
      return isValid
    } catch (error) {
      console.error('[Auth] Error checking session:', error)
      return false
    }
  }

  const signIn = async (credentials: SignInRequest): Promise<ApiResponse<SignInResponse>> => {
    // Validate input first
    if (!credentials.email || !credentials.password) {
      return {
        success: false as const,
        error: {
          code: 'VALIDATION_ERROR' as const,
          message: 'Please enter both email and password',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(credentials.email)) {
      return {
        success: false as const,
        error: {
          code: 'VALIDATION_ERROR' as const,
          message: 'Please enter a valid email address',
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }
    }

    try {
      // Wrap the entire sign-in process with a timeout to prevent infinite loading
      const signInPromise = async () => {
        // Add nested timeout for Supabase call specifically
        const supabaseCall = supabase.auth.signInWithPassword({
          email: credentials.email.trim(),
          password: credentials.password,
        })

        const supabaseTimeout = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Supabase request timed out')), SUPABASE_CALL_TIMEOUT)
        )

        let data, error
        try {
          const result = await Promise.race([supabaseCall, supabaseTimeout]) as { data: any; error: any }
          data = result.data
          error = result.error
        } catch (timeoutError: any) {
          console.error('[Auth] Supabase call timed out:', timeoutError)
          return {
            success: false as const,
            error: {
              code: 'TIMEOUT_ERROR' as const,
              message: 'Connection timeout. Please check your internet connection and try again.',
              details: timeoutError,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }
        }

        if (error) {
          // Handle specific error codes
          let errorMessage = error.message || 'Invalid email or password'
          if (error.status === 400) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.'
          } else if (error.status === 429) {
            errorMessage = 'Too many login attempts. Please try again later.'
          } else if (error.message?.includes('Email not confirmed')) {
            errorMessage = 'Please verify your email address before signing in.'
          }

          return {
            success: false as const,
            error: {
              code: 'AUTHENTICATION_ERROR' as const,
              message: errorMessage,
              details: error,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }
        }

        if (!data.user || !data.session) {
          return {
            success: false as const,
            error: {
              code: 'AUTHENTICATION_ERROR' as const,
              message: 'Failed to create session',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }
        }

        // Map Supabase user to UserResponse with its own timeout
        const userResponse = await withTimeout(
          mapSupabaseUserToUserResponse(data.user),
          5000, // 5 seconds for profile fetch
          'Profile loading timed out'
        ).catch(() => {
          // Fallback to basic user info if profile fetch times out
          return {
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            role: 'user' as const,
            createdAt: data.user.created_at,
            updatedAt: data.user.updated_at || data.user.created_at,
          }
        })

        if (!userResponse) {
          return {
            success: false as const,
            error: {
              code: 'AUTHENTICATION_ERROR' as const,
              message: 'Failed to load user profile',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }
        }

        setUser(userResponse)
        setIsAuthenticated(true)

        return {
          success: true as const,
          data: {
            user: userResponse,
            tokens: {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              token_type: 'Bearer' as const,
              expires_in: data.session.expires_in || 3600,
            },
          },
          timestamp: new Date().toISOString(),
        }
      }

      // Execute sign-in with overall timeout
      return await withTimeout(
        signInPromise(),
        SIGN_IN_TIMEOUT,
        'Sign in timed out. Please check your connection and try again.'
      )
    } catch (error: any) {
      console.error('[Auth] Sign in failed:', error)
      
      // Handle timeout specifically
      if (error?.message?.includes('timed out') || error?.message?.includes('timeout')) {
        return {
          success: false as const,
          error: {
            code: 'TIMEOUT_ERROR' as const,
            message: 'Sign in timed out. Please check your internet connection and try again.',
            details: error,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        }
      }
      
      // Handle network errors
      if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
        return {
          success: false as const,
          error: {
            code: 'NETWORK_ERROR' as const,
            message: 'Network error. Please check your internet connection and try again.',
            details: error,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        }
      }
      
      return {
        success: false as const,
        error: {
          code: 'UNKNOWN_ERROR' as const,
          message: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.',
          details: error,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  const signUp = async (data: SignUpRequest): Promise<ApiResponse<SignUpResponse>> => {
    try {
      const signUpPromise = async () => {
        const { data: authData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: 'user', // Default role for new users
            },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
          },
        })

        if (error) {
          return {
            success: false as const,
            error: {
              code: 'AUTHENTICATION_ERROR' as const,
              message: error.message || 'Failed to create account',
              details: error,
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }
        }

        if (!authData.user) {
          return {
            success: false as const,
            error: {
              code: 'AUTHENTICATION_ERROR' as const,
              message: 'Failed to create user',
              timestamp: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
          }
        }

        // Note: Supabase may require email confirmation before creating a session
        // If email confirmation is required, session will be null
        if (authData.session) {
          // User is immediately signed in (no email confirmation required)
          const userResponse = await withTimeout(
            mapSupabaseUserToUserResponse(authData.user),
            5000,
            'Profile loading timed out'
          ).catch(() => ({
            id: authData.user!.id,
            name: data.name,
            email: data.email,
            role: 'user' as const,
            createdAt: authData.user!.created_at,
            updatedAt: authData.user!.updated_at || authData.user!.created_at,
          }))
          
          if (!userResponse) {
            return {
              success: false as const,
              error: {
                code: 'AUTHENTICATION_ERROR' as const,
                message: 'Failed to load user profile',
                timestamp: new Date().toISOString(),
              },
              timestamp: new Date().toISOString(),
            }
          }

          setUser(userResponse)
          setIsAuthenticated(true)

          // Send welcome notification via admin API
          try {
            const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            await fetch(`${adminApiUrl}/api/notifications/welcome`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: userResponse.id }),
            })
          } catch (welcomeError) {
            console.error('[Auth] Failed to send welcome notification:', welcomeError)
          }

          return {
            success: true as const,
            data: {
              user: userResponse,
              tokens: {
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
                token_type: 'Bearer' as const,
                expires_in: authData.session.expires_in || 3600,
              },
            },
            timestamp: new Date().toISOString(),
          }
        } else {
          // Email confirmation required
          // Return success but user is not authenticated yet
          const userResponse = await withTimeout(
            mapSupabaseUserToUserResponse(authData.user),
            5000,
            'Profile loading timed out'
          ).catch(() => null)
          
          return {
            success: true as const,
            data: {
              user: userResponse || {
                id: authData.user.id,
                name: data.name,
                email: data.email,
                role: 'user' as const,
                createdAt: authData.user.created_at,
                updatedAt: authData.user.updated_at || authData.user.created_at,
              },
              tokens: {
                access_token: '',
                token_type: 'Bearer' as const,
                expires_in: 0,
              },
            },
            timestamp: new Date().toISOString(),
          }
        }
      }

      return await withTimeout(
        signUpPromise(),
        SIGN_IN_TIMEOUT,
        'Sign up timed out. Please check your connection and try again.'
      )
    } catch (error) {
      console.error('[Auth] Sign up failed:', error)
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          details: error,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      }
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Add timeout to prevent hanging if Supabase is unresponsive
      const oauthPromise = supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined,
        },
      })
      
      const { error } = await withTimeout(
        oauthPromise,
        10000, // 10 seconds for OAuth initialization
        'Google sign in timed out. Please try again.'
      )
      
      if (error) {
        console.error('[Auth] Google sign in error:', error)
        throw error
      }
      // Note: User will be redirected to Google, then back to the app
      // The auth state change listener will handle setting the user
    } catch (error) {
      console.error('[Auth] Google sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('[Auth] Sign out error:', error)
      }
    } catch (error) {
      console.error('[Auth] Sign out failed:', error)
    } finally {
      clearAuth()
    }
  }

  const clearAuth = () => {
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
      setUser,
      checkSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

