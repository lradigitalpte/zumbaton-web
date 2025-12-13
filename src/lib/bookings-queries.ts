/**
 * Direct Supabase queries for user bookings
 */

import { getSupabaseClient, TABLES } from './supabase'
import { formatDate, formatTime } from './utils'

export interface UserBooking {
  id: string
  class_id: string
  class_name: string
  instructor_name: string
  scheduled_at: string
  duration_minutes: number
  location: string
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show' | 'cancelled-late' | 'waitlist'
  tokens_used: number
  booked_at: string
  cancelled_at?: string
  cancellation_reason?: string
}

/**
 * Get user's bookings with optional filter
 * Includes timeout protection to prevent infinite loading
 */
export async function getUserBookings(
  userId: string,
  filter?: 'upcoming' | 'past' | 'all'
): Promise<UserBooking[]> {
  const supabase = getSupabaseClient()
  const now = new Date().toISOString()

  // Add timeout protection (30 seconds)
  const QUERY_TIMEOUT = 30000
  
  let query = supabase
    .from(TABLES.BOOKINGS)
    .select(`
      id,
      class_id,
      status,
      tokens_used,
      booked_at,
      cancelled_at,
      cancellation_reason,
      classes (
        title,
        instructor_name,
        scheduled_at,
        duration_minutes,
        location
      )
    `)
    .eq('user_id', userId)
    .order('booked_at', { ascending: false })

  // Race between query and timeout
  let data: any, error: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 30s'))
      }, QUERY_TIMEOUT)
    })

    const result = await Promise.race([
      query,
      timeoutPromise,
    ]) as { data: any; error: any }
    
    data = result.data
    error = result.error
  } catch (timeoutError: any) {
    // If timeout occurs, return empty array instead of throwing
    console.error('Bookings query timeout:', timeoutError)
    return []
  }

  if (error) {
    console.error('Error fetching user bookings:', error)
    return []
  }

  let bookings = (data || []).map((booking: any) => {
    const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes

    return {
      id: booking.id,
      class_id: booking.class_id,
      class_name: classData?.title || 'Unknown Class',
      instructor_name: classData?.instructor_name || 'TBA',
      scheduled_at: classData?.scheduled_at || booking.booked_at,
      duration_minutes: classData?.duration_minutes || 60,
      location: classData?.location || 'Studio',
      status: booking.status,
      tokens_used: booking.tokens_used || 0,
      booked_at: booking.booked_at,
      cancelled_at: booking.cancelled_at,
      cancellation_reason: booking.cancellation_reason,
    }
  })

  // Apply client-side filtering
  if (filter === 'upcoming') {
    bookings = bookings.filter(
      (b) => new Date(b.scheduled_at) > new Date(now) && b.status === 'confirmed'
    )
  } else if (filter === 'past') {
    bookings = bookings.filter(
      (b) => new Date(b.scheduled_at) <= new Date(now) || ['attended', 'no_show', 'cancelled', 'cancelled-late'].includes(b.status)
    )
  }
  // 'all' shows everything

  return bookings
}

