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
  const supabase = getSupabaseClient()

  const { data: packages, error } = await supabase
    .from(TABLES.USER_PACKAGES)
    .select('tokens_remaining, tokens_held')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())

  if (error) {
    console.error('Error fetching token balance:', error)
    return { available: 0, pending: 0, total: 0 }
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
  const supabase = getSupabaseClient()

  const { data: bookings, error } = await supabase
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

  if (error) {
    console.error('Error fetching upcoming bookings:', error)
    return []
  }

  const now = new Date().toISOString()

  return (bookings || [])
    .filter((booking: any) => {
      const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
      return classData && new Date(classData.scheduled_at) > new Date(now)
    })
    .map((booking: any) => {
      const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
      return {
        id: booking.id,
        class_name: classData?.title || 'Unknown Class',
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
  const supabase = getSupabaseClient()

  const { data: stats, error } = await supabase
    .from('user_stats')
    .select('total_classes_attended, total_tokens_used, streak_current')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no stats record exists, return defaults
    if (error.code === 'PGRST116') {
      return {
        totalClassesAttended: 0,
        tokensUsed: 0,
        currentStreak: 0,
      }
    }
    console.error('Error fetching user stats:', error)
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

