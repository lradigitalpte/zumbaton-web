import { cache } from 'react'
import { getSupabaseAdminClient } from '@/lib/supabase'

const YMD = /^\d{4}-\d{2}-\d{2}$/
const SG_TIMEZONE = 'Asia/Singapore'

export interface PublicClass {
  id: string
  title: string
  description: string | null
  class_type: string
  level?: string | null
  age_group?: 'adult' | 'kid' | 'all' | null
  instructor_id?: string | null
  instructor_name: string | null
  scheduled_at: string
  duration_minutes: number
  capacity: number
  token_cost: number
  trial_price_cents: number | null
  location: string | null
  room_name: string | null
  room_type?: string | null
  status: string
  is_outdoor?: boolean
  booked_count: number
  recurrence_type?: string
  recurrence_pattern?: unknown
}

export interface GetPublicClassesOptions {
  date?: string
  from?: string
  to?: string
}

function mapPublicClass(cls: Record<string, unknown>, bookedCount: number): PublicClass {
  const rooms = cls.rooms as { name?: string; room_type?: string } | null

  return {
    id: cls.id as string,
    title: cls.title as string,
    description: (cls.description as string | null) ?? null,
    class_type: cls.class_type as string,
    level: (cls.level as string | null) ?? null,
    age_group: (cls.age_group as PublicClass['age_group']) ?? null,
    instructor_id: (cls.instructor_id as string | null) ?? null,
    instructor_name: (cls.instructor_name as string | null) ?? null,
    scheduled_at: cls.scheduled_at as string,
    duration_minutes: cls.duration_minutes as number,
    capacity: cls.capacity as number,
    token_cost: cls.token_cost as number,
    trial_price_cents: (cls.trial_price_cents as number | null) ?? null,
    location: (cls.location as string | null) ?? null,
    room_name: rooms?.name ?? null,
    room_type: rooms?.room_type ?? null,
    status: cls.status as string,
    is_outdoor: Boolean(cls.is_outdoor),
    booked_count: bookedCount,
    recurrence_type: cls.recurrence_type as string | undefined,
    recurrence_pattern: cls.recurrence_pattern,
  }
}

/**
 * Fetch scheduled public classes for SSR, ISR, and /api/classes/public.
 */
export const getPublicClasses = cache(async function getPublicClasses(
  options: GetPublicClassesOptions = {}
): Promise<PublicClass[]> {
  const { date: dateFilter, from: fromParam, to: toParam } = options
  const supabase = getSupabaseAdminClient()

  let query = supabase
    .from('classes')
    .select(`
      id,
      title,
      description,
      class_type,
      level,
      age_group,
      instructor_id,
      instructor_name,
      scheduled_at,
      duration_minutes,
      capacity,
      token_cost,
      trial_price_cents,
      location,
      room_id,
      status,
      is_outdoor,
      recurrence_type,
      recurrence_pattern,
      rooms (
        id,
        name,
        room_type
      )
    `)
    .eq('status', 'scheduled')

  if (fromParam && toParam && YMD.test(fromParam) && YMD.test(toParam)) {
    let rangeStart = new Date(fromParam)
    rangeStart.setHours(0, 0, 0, 0)
    let rangeEnd = new Date(toParam)
    rangeEnd.setHours(23, 59, 59, 999)
    if (rangeStart.getTime() > rangeEnd.getTime()) {
      const swapped = rangeStart
      rangeStart = rangeEnd
      rangeEnd = swapped
      rangeStart.setHours(0, 0, 0, 0)
      rangeEnd.setHours(23, 59, 59, 999)
    }
    query = query
      .gte('scheduled_at', rangeStart.toISOString())
      .lte('scheduled_at', rangeEnd.toISOString())
  } else if (dateFilter && YMD.test(dateFilter)) {
    const startOfDay = new Date(dateFilter)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(dateFilter)
    endOfDay.setHours(23, 59, 59, 999)
    query = query
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
  } else {
    query = query.gte('scheduled_at', new Date().toISOString())
  }

  const { data: classes, error } = await query.order('scheduled_at', { ascending: true })

  if (error) {
    console.error('[Classes] Error fetching public classes:', error)
    return []
  }

  const classIds = classes?.map((c) => c.id) || []
  let bookingCounts: Record<string, number> = {}

  if (classIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('class_id')
      .in('class_id', classIds)
      .in('status', ['confirmed', 'attended'])

    if (bookings) {
      bookings.forEach((booking) => {
        const classId = booking.class_id as string
        bookingCounts[classId] = (bookingCounts[classId] || 0) + 1
      })
    }
  }

  return (classes || []).map((cls) =>
    mapPublicClass(cls as Record<string, unknown>, bookingCounts[cls.id] || 0)
  )
})

export function formatClassScheduleLine(cls: PublicClass): string {
  const when = new Date(cls.scheduled_at).toLocaleString('en-SG', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: SG_TIMEZONE,
  })
  const instructor = cls.instructor_name || 'TBA'
  return `${cls.title} (${when}, ${instructor})`
}

export function buildScheduleMetadataDescription(classes: PublicClass[]): string {
  if (classes.length === 0) {
    return 'Check out our weekly dance fitness class schedule. Find the perfect class for your fitness level and join the dance fitness party!'
  }

  const preview = classes
    .slice(0, 6)
    .map(formatClassScheduleLine)
    .join('. ')

  return `One Step Fitness weekly schedule — ${preview}.`
}
