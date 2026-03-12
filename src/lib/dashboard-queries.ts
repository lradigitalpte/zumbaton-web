/**
 * Direct Supabase queries for dashboard data
 * Uses RLS (Row Level Security) to ensure users only see their own data
 */

import { getSupabaseClient, TABLES } from './supabase'

export interface TokenBalance {
  available: number
  pending: number
  total: number
}

export interface UpcomingBooking {
  id: string
  class_name: string
  instructor_name: string
  scheduled_at: string
  location: string
}

export interface UserStats {
  totalClassesAttended: number
  tokensUsed: number
  currentStreak: number
}

/**
 * Get user's token balance from user_packages table
 */
export async function getTokenBalance(userId: string): Promise<TokenBalance> {
  // Try API endpoint first (bypasses RLS, faster), fallback to direct Supabase query
  // Only use API endpoint in browser (client-side)
  if (typeof window !== 'undefined') {
    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/dashboard?userId=${userId}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.tokenBalance) {
          console.log('📊 Fetched token balance via API (bypassing RLS for faster queries)')
          return result.data.tokenBalance
        }
      } else {
        console.warn('⚠️ Dashboard API endpoint failed, falling back to direct Supabase query')
      }
    } catch (apiError) {
      console.warn('⚠️ Dashboard API endpoint error, falling back to direct Supabase query:', apiError)
    }
  }

  // Fallback to direct Supabase query (works in both client and server)
  const supabase = getSupabaseClient()
  const QUERY_TIMEOUT = 10000 // 10 seconds

  let query = supabase
    .from(TABLES.USER_PACKAGES)
    .select('tokens_remaining, tokens_held')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())

  // Race between query and timeout
  let packages: any, error: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 10s'))
      }, QUERY_TIMEOUT)
    })

    const result = await Promise.race([
      query,
      timeoutPromise,
    ]) as { data: any; error: any }
    
    packages = result.data
    error = result.error
  } catch (timeoutError: any) {
    console.error('[Token Balance] Query timeout:', timeoutError?.message)
    throw new Error(`Token balance query timeout: ${timeoutError?.message || 'Request took too long'}`)
  }

  if (error) {
    console.error('Error fetching token balance:', error)
    throw new Error(`Failed to fetch token balance: ${error.message || 'Unknown error'}`)
  }

  let totalTokens = 0
  let heldTokens = 0

  for (const pkg of packages || []) {
    totalTokens += pkg.tokens_remaining || 0
    heldTokens += pkg.tokens_held || 0
  }

  return {
    available: totalTokens - heldTokens,
    pending: heldTokens,
    total: totalTokens,
  }
}

/**
 * Get user's upcoming bookings with class details
 */
export async function getUpcomingBookings(userId: string): Promise<UpcomingBooking[]> {
  // Try API endpoint first (bypasses RLS, faster), fallback to direct Supabase query
  // Only use API endpoint in browser (client-side)
  if (typeof window !== 'undefined') {
    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/dashboard?userId=${userId}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.upcomingBookings) {
          console.log('📅 Fetched upcoming bookings via API (bypassing RLS for faster queries)')
          return result.data.upcomingBookings
        }
      } else {
        console.warn('⚠️ Dashboard API endpoint failed, falling back to direct Supabase query')
      }
    } catch (apiError) {
      console.warn('⚠️ Dashboard API endpoint error, falling back to direct Supabase query:', apiError)
    }
  }

  // Fallback to direct Supabase query (works in both client and server)
  const supabase = getSupabaseClient()
  const QUERY_TIMEOUT = 10000 // 10 seconds

  let query = supabase
    .from(TABLES.BOOKINGS)
    .select(`
      id,
      classes (
        title,
        scheduled_at,
        location,
        instructor_name
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('booked_at', { ascending: false })
    .limit(10)

  // Race between query and timeout
  let bookings: any, error: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 10s'))
      }, QUERY_TIMEOUT)
    })

    const result = await Promise.race([
      query,
      timeoutPromise,
    ]) as { data: any; error: any }
    
    bookings = result.data
    error = result.error
  } catch (timeoutError: any) {
    console.error('[Upcoming Bookings] Query timeout:', timeoutError?.message)
    throw new Error(`Bookings query timeout: ${timeoutError?.message || 'Request took too long'}`)
  }

  if (error) {
    console.error('Error fetching upcoming bookings:', error)
    throw new Error(`Failed to fetch bookings: ${error.message || 'Unknown error'}`)
  }

  const now = new Date().toISOString()

  return (bookings || [])
    .filter((booking: any) => {
      const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
      return classData && new Date(classData.scheduled_at) > new Date(now)
    })
    .map((booking: any) => {
      const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
      // Determine class name - check if class was deleted or data is missing
      let className = 'Unknown Class'
      if (classData) {
        if (classData.title) {
          className = classData.title
        } else if (classData.class_type) {
          className = `${classData.class_type.charAt(0).toUpperCase() + classData.class_type.slice(1)} Class`
        }
      } else {
        className = 'Class No Longer Available'
      }

      return {
        id: booking.id,
        class_name: className,
        instructor_name: classData?.instructor_name || 'TBA',
        scheduled_at: classData?.scheduled_at || '',
        location: classData?.location || 'Studio',
      }
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
}

/**
 * Get user's stats from user_stats table
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // Try API endpoint first (bypasses RLS, faster), fallback to direct Supabase query
  // Only use API endpoint in browser (client-side)
  if (typeof window !== 'undefined') {
    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/dashboard?userId=${userId}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.stats) {
          console.log('📈 Fetched user stats via API (bypassing RLS for faster queries)')
          return result.data.stats
        }
      } else {
        console.warn('⚠️ Dashboard API endpoint failed, falling back to direct Supabase query')
      }
    } catch (apiError) {
      console.warn('⚠️ Dashboard API endpoint error, falling back to direct Supabase query:', apiError)
    }
  }

  // Fallback to direct Supabase query (works in both client and server)
  const supabase = getSupabaseClient()
  const QUERY_TIMEOUT = 10000 // 10 seconds

  let query = supabase
    .from('user_stats')
    .select('total_classes_attended, total_tokens_used, streak_current')
    .eq('user_id', userId)
    .single()

  // Race between query and timeout
  let stats: any, error: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 10s'))
      }, QUERY_TIMEOUT)
    })

    const result = await Promise.race([
      query,
      timeoutPromise,
    ]) as { data: any; error: any }
    
    stats = result.data
    error = result.error
  } catch (timeoutError: any) {
    console.error('[User Stats] Query timeout:', timeoutError?.message)
    // For stats, return defaults on timeout (non-critical data)
    return {
      totalClassesAttended: 0,
      tokensUsed: 0,
      currentStreak: 0,
    }
  }

  if (error) {
    // If no stats record exists, return defaults (this is valid)
    if (error.code === 'PGRST116') {
      return {
        totalClassesAttended: 0,
        tokensUsed: 0,
        currentStreak: 0,
      }
    }
    console.error('Error fetching user stats:', error)
    // For stats, return defaults on error (non-critical data)
    return {
      totalClassesAttended: 0,
      tokensUsed: 0,
      currentStreak: 0,
    }
  }

  return {
    totalClassesAttended: stats?.total_classes_attended || 0,
    tokensUsed: stats?.total_tokens_used || 0,
    currentStreak: stats?.streak_current || 0,
  }
}

