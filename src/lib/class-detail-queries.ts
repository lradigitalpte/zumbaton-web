/**
 * Class detail queries with API-only browser fetch and server-side Supabase fallback.
 */

import { getSupabaseClient, TABLES } from './supabase'

export interface ClassDetail {
  id: string
  name: string
  title: string
  description: string | null
  instructor_name: string | null
  instructor_avatar?: string | null
  instructor_bio?: string | null
  scheduled_at: string
  duration_minutes: number
  location: string | null
  capacity: number
  booked_count: number
  tokens_required: number
  token_cost: number
  class_type: string
  difficulty_level: string
  level: string
  requirements?: string[]
  what_to_bring?: string[]
}

/**
 * Get a single class by ID with full details
 */
export async function getClassDetail(classId: string): Promise<ClassDetail | null> {
  const supabase = getSupabaseClient()
  const QUERY_TIMEOUT = 15000 // 15 seconds

  const fetchWithTimeout = async (url: string, timeoutMs = 8000): Promise<Response> => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        signal: controller.signal,
      })
    } finally {
      clearTimeout(timeoutId)
    }
  }

  // Browser path is API-only to avoid client-side fallback drift and hidden hangs.
  if (typeof window !== 'undefined') {
    const response = await fetchWithTimeout(`${window.location.origin}/api/classes/${classId}`, 10000)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Class detail API failed (${response.status})${text ? `: ${text.slice(0, 180)}` : ''}`)
    }

    const result = await response.json()
    if (!result?.success || !result?.data) {
      throw new Error('Class detail API returned invalid payload')
    }

    const classData = result.data
    const defaultWhatToBring: Record<string, string[]> = {
      zumba: ['Water bottle', 'Towel', 'Athletic shoes'],
      yoga: ['Yoga mat', 'Water bottle', 'Comfortable clothes'],
      hiit: ['Water bottle', 'Towel', 'Athletic shoes'],
      dance: ['Water bottle', 'Towel', 'Dance shoes'],
      salsa: ['Water bottle', 'Comfortable shoes'],
      pilates: ['Yoga mat', 'Water bottle'],
      strength: ['Water bottle', 'Towel', 'Athletic shoes'],
      cardio: ['Water bottle', 'Towel', 'Athletic shoes'],
      stretch: ['Yoga mat', 'Water bottle'],
    }

    const fallbackBio = classData.instructor_name
      ? `Certified ${classData.class_type.charAt(0).toUpperCase() + classData.class_type.slice(1)} instructor with years of experience. Passionate about making fitness fun and accessible to everyone.`
      : null

    return {
      id: classData.id,
      name: classData.title,
      title: classData.title,
      description: classData.description,
      instructor_name: classData.instructor_name,
      instructor_avatar: classData.instructor_avatar ?? null,
      instructor_bio: classData.instructor_bio ?? fallbackBio,
      scheduled_at: classData.scheduled_at,
      duration_minutes: classData.duration_minutes,
      location: classData.location,
      capacity: classData.capacity,
      booked_count: classData.booked_count || 0,
      tokens_required: classData.token_cost,
      token_cost: classData.token_cost,
      class_type: classData.class_type,
      difficulty_level: classData.level === 'all_levels' ? 'Beginner' : classData.level.charAt(0).toUpperCase() + classData.level.slice(1),
      level: classData.level,
      requirements: [],
      what_to_bring: defaultWhatToBring[classData.class_type] || ['Water bottle', 'Towel', 'Athletic shoes'],
    }
  }

  // Get class details with timeout
  let classData: any, classError: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 15s'))
      }, QUERY_TIMEOUT)
    })

    const classResult = await Promise.race([
      supabase
        .from(TABLES.CLASSES)
        .select('*')
        .eq('id', classId)
        .maybeSingle(),
      timeoutPromise,
    ]) as { data: any; error: any }
    
    classData = classResult.data
    classError = classResult.error
  } catch (timeoutError: any) {
    console.error('[Class Detail] Query timeout:', timeoutError?.message)
    throw new Error(`Class detail query timeout: ${timeoutError?.message || 'Request took too long'}`)
  }

  if (classError || !classData) {
    console.error('Error fetching class detail:', classError)
    // Return null if class doesn't exist (valid state)
    if (classError?.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch class detail: ${classError?.message || 'Unknown error'}`)
  }

  // Get booking count with timeout
  let bookings: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 15s'))
      }, QUERY_TIMEOUT)
    })

    const bookingResult = await Promise.race([
      supabase
        .from(TABLES.BOOKINGS)
        .select('id')
        .eq('class_id', classId)
        .eq('status', 'confirmed'),
      timeoutPromise,
    ]) as { data: any; error: any }
    
    if (bookingResult.error) {
      console.warn('[Class Detail] Error fetching booking count:', bookingResult.error)
      bookings = [] // Use empty array on error (non-critical)
    } else {
      bookings = bookingResult.data
    }
  } catch (timeoutError: any) {
    console.warn('[Class Detail] Query timeout for booking count:', timeoutError?.message)
    bookings = [] // Use empty array on timeout (non-critical)
  }

  const bookedCount = bookings?.length || 0

  // Fetch instructor avatar if instructor exists using API endpoint (bypasses RLS)
  let instructorAvatar: string | null = null
  if (classData.instructor_id) {
    try {
      // Use API endpoint to bypass RLS
      const baseUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      const response = await fetchWithTimeout(
        `${baseUrl}/api/instructors/profiles?ids=${classData.instructor_id}`,
        8000
      )
      
      if (response.ok) {
        const result = await response.json()
        const profiles = result.data || result // Handle both { data: [...] } and [...] formats
        
        if (Array.isArray(profiles) && profiles.length > 0 && profiles[0]?.avatar_url) {
          instructorAvatar = profiles[0].avatar_url
          console.log('[Class Detail] Fetched instructor avatar via API:', {
            instructorId: classData.instructor_id,
            avatarUrl: instructorAvatar,
          })
        }
      } else {
        console.warn('[Class Detail] Failed to fetch instructor avatar via API:', response.status)
      }
    } catch (error) {
      console.error('[Class Detail] Error fetching instructor avatar via API:', error)
      // Non-critical, continue without avatar
    }
  }

  // Default what to bring based on class type
  const defaultWhatToBring: Record<string, string[]> = {
    zumba: ['Water bottle', 'Towel', 'Athletic shoes'],
    yoga: ['Yoga mat', 'Water bottle', 'Comfortable clothes'],
    hiit: ['Water bottle', 'Towel', 'Athletic shoes'],
    dance: ['Water bottle', 'Towel', 'Dance shoes'],
    salsa: ['Water bottle', 'Comfortable shoes'],
    pilates: ['Yoga mat', 'Water bottle'],
    strength: ['Water bottle', 'Towel', 'Athletic shoes'],
    cardio: ['Water bottle', 'Towel', 'Athletic shoes'],
    stretch: ['Yoga mat', 'Water bottle'],
  }

  const whatToBring = defaultWhatToBring[classData.class_type] || ['Water bottle', 'Towel', 'Athletic shoes']

  // Generate instructor bio from class data
  let instructorBio: string | null = null
  if (classData.instructor_name) {
    // Generate default bio based on class type
    const classTypeName = classData.class_type.charAt(0).toUpperCase() + classData.class_type.slice(1)
    instructorBio = `Certified ${classTypeName} instructor with years of experience. Passionate about making fitness fun and accessible to everyone.`
  }

  return {
    id: classData.id,
    name: classData.title,
    title: classData.title,
    description: classData.description,
    instructor_name: classData.instructor_name,
    instructor_avatar: instructorAvatar,
    instructor_bio: instructorBio,
    scheduled_at: classData.scheduled_at,
    duration_minutes: classData.duration_minutes,
    location: classData.location,
    capacity: classData.capacity,
    booked_count: bookedCount,
    tokens_required: classData.token_cost,
    token_cost: classData.token_cost,
    class_type: classData.class_type,
    difficulty_level: classData.level === 'all_levels' ? 'Beginner' : classData.level.charAt(0).toUpperCase() + classData.level.slice(1),
    level: classData.level,
    requirements: [],
    what_to_bring: whatToBring,
  }
}

