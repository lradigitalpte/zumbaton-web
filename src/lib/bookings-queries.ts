/**
 * User bookings: Next.js API only in browser (no Supabase); Supabase fallback only on server.
 */

import { getSupabaseClient, TABLES } from './supabase'
import { fetchApiData } from './client-api-utils'
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
 * Get user's bookings with optional filter.
 * Uses Next.js API only when in browser (no Supabase from client); fallback to Supabase only on server.
 */
export async function getUserBookings(
  userId: string,
  filter?: 'upcoming' | 'past' | 'all'
): Promise<UserBooking[]> {
  const params: Record<string, string> = { userId }
  if (filter && filter !== 'all') params.filter = filter
  const apiData = await fetchApiData<UserBooking[]>(
    '/api/bookings',
    params,
    'Bookings'
  )
  if (apiData != null && Array.isArray(apiData)) return apiData

  /* In browser we use only Next.js API (fetchApiData). No Supabase fallback. */
  if (typeof window !== 'undefined') {
    console.warn('[Bookings] API returned no data; returning empty array (no Supabase fallback in browser).')
    return []
  }

  const supabase = getSupabaseClient()
  const now = new Date().toISOString()

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session?.user) {
      console.warn('[Bookings] No valid session, returning empty array')
      return []
    }
    if (session.user.id !== userId) {
      console.warn('[Bookings] Session user ID mismatch, returning empty array')
      return []
    }
  } catch (sessionCheckError: any) {
    console.error('[Bookings] Error checking session (timeout or error):', sessionCheckError?.message || sessionCheckError)
    return []
  }

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
        id,
        title,
        instructor_id,
        instructor_name,
        scheduled_at,
        duration_minutes,
        location,
        class_type
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
    
    // Check if error object exists but is empty (RLS blocking)
    if (error && typeof error === 'object' && Object.keys(error).length === 0) {
      console.warn('[Bookings] Empty error object detected - likely RLS blocking. Run migration 022_fix_classes_rls_for_bookings.sql')
      error = { message: 'RLS policy blocking access to classes. Please run migration 022_fix_classes_rls_for_bookings.sql' }
    }
  } catch (timeoutError: any) {
    // If timeout occurs, return empty array instead of throwing
    console.error('[Bookings] Query timeout after 8s:', timeoutError?.message || timeoutError)
    console.warn('[Bookings] This may indicate: expired session, slow database, or RLS blocking query')
    return []
  }

  if (error) {
    console.error('[Bookings] Error fetching user bookings:', {
      error,
      errorCode: error?.code,
      errorMessage: error?.message,
      errorDetails: error?.details,
      errorHint: error?.hint,
      errorString: JSON.stringify(error, null, 2),
    })
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

  // Fetch instructor profiles with avatars using API endpoint (bypasses RLS)
  let instructorProfiles: Record<string, { avatar_url?: string }> = {}
  if (instructorIds.size > 0) {
    try {
      // Use API endpoint to bypass RLS
      let baseUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      try {
        if (typeof window !== 'undefined') {
          baseUrl = (window as any).location.origin
        }
      } catch {
        // Fallback to env or default if window is not accessible
      }
      
      const response = await fetch(
        `${baseUrl}/api/instructors/profiles?ids=${Array.from(instructorIds).join(',')}`
      )
      
      if (response.ok) {
        const result = await response.json()
        const profiles = result.data || result // Handle both { data: [...] } and [...] formats
        console.log('[Bookings] Fetched instructor profiles via API:', {
          count: Array.isArray(profiles) ? profiles.length : 0,
          instructorIds: Array.from(instructorIds),
          profiles: profiles,
        })
        
        if (Array.isArray(profiles)) {
          instructorProfiles = profiles.reduce((acc: Record<string, { avatar_url?: string }>, profile: any) => {
            acc[profile.id] = { avatar_url: profile.avatar_url }
            return acc
          }, {} as Record<string, { avatar_url?: string }>)
        }
      } else {
        const errorText = await response.text()
        console.warn('[Bookings] Failed to fetch instructor profiles via API:', {
          status: response.status,
          error: errorText,
        })
      }
    } catch (error) {
      console.error('[Bookings] Error fetching instructor profiles via API:', error)
      // Fallback to direct Supabase query (may be blocked by RLS)
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, avatar_url')
        .in('id', Array.from(instructorIds))

      if (!profilesError && profiles) {
        console.log('[Bookings] Fallback: Fetched instructor profiles via Supabase:', {
          count: profiles.length,
        })
        instructorProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = { avatar_url: profile.avatar_url }
          return acc
        }, {} as Record<string, { avatar_url?: string }>)
      } else {
        console.warn('[Bookings] Fallback also failed:', profilesError)
      }
    }
  }

  // Debug: Log the raw data structure
  if (data && data.length > 0) {
    console.log('[Bookings] Raw booking data sample:', {
      firstBooking: data[0],
      totalBookings: data.length,
      sampleClasses: data[0]?.classes,
    })
  }

  let bookings = (data || []).map((booking: any) => {
    const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
    const instructorProfile = classData?.instructor_id ? instructorProfiles[classData.instructor_id] : null

    // Debug logging for missing class data
    if (!classData || !classData.title) {
      console.warn('[Bookings] Missing class data for booking:', {
        bookingId: booking.id,
        classId: booking.class_id,
        classData: classData,
        hasClassData: !!classData,
        classesField: booking.classes,
        classesType: typeof booking.classes,
        classesIsArray: Array.isArray(booking.classes),
      })
    }

    // Determine class name - check if class was deleted or data is missing
    let className = 'Unknown Class'
    if (classData) {
      if (classData.title) {
        className = classData.title
      } else if (classData.class_type) {
        // Fallback: use class type if title is missing but class exists
        className = `${classData.class_type.charAt(0).toUpperCase() + classData.class_type.slice(1)} Class`
      }
    } else {
      // Class was likely deleted - show more helpful message
      className = 'Class No Longer Available'
    }

    const bookingData = {
      id: booking.id,
      class_id: booking.class_id,
      class_name: className,
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

    // Debug logging for avatar
    if (!bookingData.instructor_avatar && classData?.instructor_id) {
      console.log('[Bookings] Missing avatar for booking:', {
        bookingId: booking.id,
        instructorId: classData.instructor_id,
        instructorName: classData.instructor_name,
        instructorProfile: instructorProfile,
        instructorProfiles: instructorProfiles,
        allInstructorIds: Array.from(instructorIds),
      })
    }

    return bookingData
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

