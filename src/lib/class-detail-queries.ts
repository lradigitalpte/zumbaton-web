/**
 * Direct Supabase queries for class details
 */

import { getSupabaseClient, TABLES } from './supabase'

export interface ClassDetail {
  id: string
  name: string
  title: string
  description: string | null
  instructor_name: string | null
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

  // Get class details
  const { data: classData, error: classError } = await supabase
    .from(TABLES.CLASSES)
    .select('*')
    .eq('id', classId)
    .maybeSingle()

  if (classError || !classData) {
    console.error('Error fetching class detail:', classError)
    return null
  }

  // Get booking count
  const { data: bookings, error: bookingError } = await supabase
    .from(TABLES.BOOKINGS)
    .select('id')
    .eq('class_id', classId)
    .eq('status', 'confirmed')

  const bookedCount = bookings?.length || 0

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

