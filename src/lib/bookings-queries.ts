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
  instructor_avatar?: string
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

  // Check session - Supabase handles token refresh automatically
  // No need to manually check expiry or refresh tokens
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      console.warn('[Bookings] No valid session, returning empty array')
      return []
    }

    // Verify session is for the correct user
    if (session.user.id !== userId) {
      console.warn('[Bookings] Session user ID mismatch, returning empty array')
      return []
    }

    // Supabase handles token refresh automatically - no need to check expiry
    // If session exists, proceed with query (Supabase will auto-refresh if needed)
  } catch (sessionCheckError: any) {
    console.error('[Bookings] Error checking session (timeout or error):', sessionCheckError?.message || sessionCheckError)
    return []
  }

  // Reduced timeout - 8 seconds to fail fast
  const QUERY_TIMEOUT = 8000
  
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
        instructor_id,
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
        reject(new Error('Query timeout after 8s - database may be slow or session expired'))
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
    console.error('[Bookings] Query timeout after 8s:', timeoutError?.message || timeoutError)
    console.warn('[Bookings] This may indicate: expired session, slow database, or RLS blocking query')
    return []
  }

  if (error) {
    console.error('[Bookings] Error fetching user bookings:', error)
    // Check if it's an auth error
    if (error.code === 'PGRST301' || error.message?.includes('JWT') || error.message?.includes('session')) {
      console.warn('[Bookings] Authentication error - session may be expired')
    }
    return []
  }

  // Collect unique instructor IDs to fetch avatars
  const instructorIds = new Set<string>()
  for (const booking of data || []) {
    const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
    if (classData?.instructor_id) {
      instructorIds.add(classData.instructor_id)
    }
  }

  // Fetch instructor profiles with avatars
  let instructorProfiles: Record<string, { avatar_url?: string }> = {}
  if (instructorIds.size > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, avatar_url')
      .in('id', Array.from(instructorIds))

    if (!profilesError && profiles) {
      instructorProfiles = profiles.reduce((acc, profile) => {
        acc[profile.id] = { avatar_url: profile.avatar_url }
        return acc
      }, {} as Record<string, { avatar_url?: string }>)
    }
  }

  let bookings = (data || []).map((booking: any) => {
    const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
    const instructorProfile = classData?.instructor_id ? instructorProfiles[classData.instructor_id] : null

    return {
      id: booking.id,
      class_id: booking.class_id,
      class_name: classData?.title || 'Unknown Class',
      instructor_name: classData?.instructor_name || 'TBA',
      instructor_avatar: instructorProfile?.avatar_url,
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

