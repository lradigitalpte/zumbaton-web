/**
 * Direct Supabase queries for classes and bookings
 * Uses RLS (Row Level Security) to ensure proper access control
 */

import { getSupabaseClient, TABLES } from './supabase'
import { getTokenBalance } from './dashboard-queries'
import { getBookingSettings, type BookingSettings } from './booking-settings'

export interface InstructorInfo {
  id: string
  name: string
  avatar?: string | null
  initials: string
}

export interface ClassWithAvailability {
  id: string
  name: string
  title: string
  description: string | null
  instructor_id?: string | null
  instructor_name: string | null
  instructors?: InstructorInfo[] // Array for multiple instructors
  scheduled_at: string
  duration_minutes: number
  location: string | null
  room_id?: string | null
  room_name?: string | null
  category_id?: string | null
  category_name?: string | null
  capacity: number
  token_cost: number
  class_type: string
  level: string
  booked_count: number
  tokens_required: number
  difficulty_level: string
  status: string
  recurrence_type?: 'single' | 'recurring' | 'course' | null
  recurrence_pattern?: Record<string, unknown> | null
  parent_class_id?: string | null
  _isParent?: boolean
  _childInstances?: ClassWithAvailability[]
  _totalSessions?: number
}

/**
 * Get all upcoming classes with booking counts
 */
export async function getUpcomingClasses(filters?: {
  type?: string
  difficulty?: string
  date?: string
  recurrenceType?: 'single' | 'recurring' | 'course' | 'all'
  categoryId?: string
}): Promise<ClassWithAvailability[]> {
  try {
  const supabase = getSupabaseClient()

  let query = supabase
    .from(TABLES.CLASSES)
    .select(`
      id,
      title,
      description,
      class_type,
      level,
        instructor_id,
      instructor_name,
      scheduled_at,
      duration_minutes,
      capacity,
      token_cost,
      location,
        room_id,
        category_id,
      status,
      recurrence_type,
        recurrence_pattern,
        parent_class_id,
        rooms (
          id,
          name
        ),
        class_categories (
          id,
          name,
          slug
        )
    `)
    .order('scheduled_at', { ascending: true })

  // Apply filters
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('class_type', filters.type.toLowerCase())
  }

  if (filters?.difficulty && filters.difficulty !== 'all') {
    query = query.eq('level', filters.difficulty.toLowerCase())
  }

    if (filters?.recurrenceType && filters.recurrenceType !== 'all') {
      query = query.eq('recurrence_type', filters.recurrenceType)
    }

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId)
    }

  if (filters?.date) {
    const startOfDay = new Date(filters.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(filters.date)
    endOfDay.setHours(23, 59, 59, 999)
    
    query = query
      .gte('scheduled_at', startOfDay.toISOString())
      .lte('scheduled_at', endOfDay.toISOString())
  }

  const { data: classes, error } = await query

  if (error) {
    console.error('Error fetching classes:', error)
    return []
  }

    if (!classes || classes.length === 0) {
      console.log('No classes found in database')
      return []
    }

    console.log(`Fetched ${classes.length} classes from database`)

    // Get all unique instructor IDs and names for avatar fetching
    const instructorIds = new Set<string>()
    const instructorNames = new Set<string>()
    
    classes.forEach((classItem: any) => {
      if (classItem.instructor_id) {
        instructorIds.add(classItem.instructor_id)
      }
      if (classItem.instructor_name) {
        // For multiple instructors, split by comma
        const names = classItem.instructor_name.split(',').map((n: string) => n.trim())
        names.forEach((name: string) => instructorNames.add(name))
      }
    })

    // Fetch instructor profiles for avatars
    const instructorProfiles: Record<string, { id: string; name: string; avatar_url: string | null }> = {}
    const instructorProfilesByName: Record<string, { id: string; name: string; avatar_url: string | null }> = {}
    
    if (instructorIds.size > 0) {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .in('id', Array.from(instructorIds))
      
      profiles?.forEach((profile: any) => {
        instructorProfiles[profile.id] = {
          id: profile.id,
          name: profile.name,
          avatar_url: profile.avatar_url,
        }
        instructorProfilesByName[profile.name] = {
          id: profile.id,
          name: profile.name,
          avatar_url: profile.avatar_url,
        }
      })
    }
    
    // Also fetch by name for multiple instructors (in case IDs aren't available)
    if (instructorNames.size > 0) {
      const nameArray = Array.from(instructorNames)
      // Fetch in batches if needed (Supabase has limits)
      for (let i = 0; i < nameArray.length; i += 10) {
        const batch = nameArray.slice(i, i + 10)
        const { data: profilesByName } = await supabase
          .from('user_profiles')
          .select('id, name, avatar_url')
          .in('name', batch)
        
        profilesByName?.forEach((profile: any) => {
          if (!instructorProfilesByName[profile.name]) {
            instructorProfilesByName[profile.name] = {
              id: profile.id,
              name: profile.name,
              avatar_url: profile.avatar_url,
            }
          }
          if (!instructorProfiles[profile.id]) {
            instructorProfiles[profile.id] = {
              id: profile.id,
              name: profile.name,
              avatar_url: profile.avatar_url,
            }
          }
        })
      }
    }

    // Helper function to get initials from name
    const getInitials = (name: string | null): string => {
      if (!name) return "??"
      if (name.includes(',')) {
        // Multiple instructors
        const names = name.split(',').map(n => n.trim())
        return names
          .map(n => n.split(' ')[0]?.[0] || '')
          .join('')
          .toUpperCase()
          .slice(0, 3)
      }
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    // Helper function to get instructor info array
    const getInstructors = (classItem: any): InstructorInfo[] => {
      const instructors: InstructorInfo[] = []
      
      if (classItem.instructor_name) {
        const names = classItem.instructor_name.split(',').map((n: string) => n.trim())
        names.forEach((name: string) => {
          // Try to find by name first (for multiple instructors)
          const profileByName = instructorProfilesByName[name]
          // Fallback to ID lookup
          const profileById = classItem.instructor_id ? instructorProfiles[classItem.instructor_id] : null
          const profile = profileByName || profileById
          
          instructors.push({
            id: profile?.id || classItem.instructor_id || '',
            name: name,
            avatar: profile?.avatar_url || null,
            initials: getInitials(name),
          })
        })
      } else if (classItem.instructor_id && instructorProfiles[classItem.instructor_id]) {
        const profile = instructorProfiles[classItem.instructor_id]
        instructors.push({
          id: profile.id,
          name: profile.name,
          avatar: profile.avatar_url,
          initials: getInitials(profile.name),
        })
      }
      
      return instructors.length > 0 ? instructors : [{
        id: classItem.instructor_id || '',
        name: classItem.instructor_name || 'Unassigned',
        avatar: null,
        initials: getInitials(classItem.instructor_name),
      }]
    }

    // Separate parent classes and child instances
    // Show ALL classes regardless of date - let users filter if needed
    const parentClasses: any[] = []
    const childInstances: any[] = []
    
    if (!classes || classes.length === 0) {
      return []
    }
    
    classes.forEach((classItem: any) => {
      const isRecurringType = classItem.recurrence_type === 'recurring' || classItem.recurrence_type === 'course'
      const isOccurrenceClass = /-\s*\d{1,2}\/\d{1,2}\/\d{4}$/.test(classItem.title)
      
      // Parent classes: have recurrence_type but no parent_class_id and no date suffix
      if (isRecurringType && !classItem.parent_class_id && !isOccurrenceClass) {
        // Include ALL recurring/course parents - they will be filtered in the next step
        parentClasses.push(classItem)
      } 
      // Child instances: have parent_class_id or date suffix
      else if (classItem.parent_class_id || isOccurrenceClass) {
        // Include only scheduled/in-progress child instances
        if (classItem.status === 'scheduled' || classItem.status === 'in-progress') {
          childInstances.push(classItem)
        }
      }
      // Single classes: show only scheduled/in-progress
      else if (classItem.status === 'scheduled' || classItem.status === 'in-progress') {
        parentClasses.push(classItem)
      }
  })

    // Filter out recurring/course parents that don't have any scheduled children
    const scheduledChildParentIds = new Set(
      childInstances
        .filter(c => c.status === 'scheduled' || c.status === 'in-progress')
        .map(c => c.parent_class_id)
        .filter(Boolean)
    )
    
    const filteredParentClasses = parentClasses.filter(parent => {
      // Keep single classes and parents with no recurrence type
      if (!parent.recurrence_type) return true
      // For recurring/course parents: keep if they're scheduled themselves, or if they have scheduled children
      return parent.status === 'scheduled' || parent.status === 'in-progress' || scheduledChildParentIds.has(parent.id)
    })

    console.log('[Classes Query] Before filtering:', {
      totalFetched: classes.length,
      parentClasses: parentClasses.length,
      childInstances: childInstances.length,
      scheduledChildParentIds: Array.from(scheduledChildParentIds),
      filteredParents: filteredParentClasses.length,
    })

    // Get booking counts for all classes (parents and children)
    const allClassIds = [...filteredParentClasses, ...childInstances].map((c: any) => c.id)
  
  let bookingCounts: Record<string, number> = {}
  
    if (allClassIds.length > 0) {
    const { data: bookings, error: bookingError } = await supabase
      .from(TABLES.BOOKINGS)
      .select('class_id, status')
        .in('class_id', allClassIds)
      .eq('status', 'confirmed')
    
    if (bookingError) {
      console.error('Error fetching booking counts:', bookingError)
    } else {
      // Count bookings per class
      bookings?.forEach((booking: any) => {
        bookingCounts[booking.class_id] = (bookingCounts[booking.class_id] || 0) + 1
      })
    }
  }

    // Transform parent classes and child instances with booking counts
    // Ensure all classes have the correct structure with 'name' field
    const transformedParents = filteredParentClasses.map((classItem: any) => {
      const bookedCount = bookingCounts[classItem.id] || 0
      const room = Array.isArray(classItem.rooms) ? classItem.rooms[0] : classItem.rooms
      const category = Array.isArray(classItem.class_categories) ? classItem.class_categories[0] : classItem.class_categories
      
      return {
        ...classItem,
        name: classItem.title || classItem.name, // Ensure 'name' field exists
        title: classItem.title,
        booked_count: bookedCount,
        tokens_required: classItem.token_cost,
        difficulty_level: classItem.level === 'all_levels' ? 'Beginner' : (classItem.level || 'all_levels').charAt(0).toUpperCase() + (classItem.level || 'all_levels').slice(1),
        room_id: classItem.room_id || null,
        room_name: room?.name || classItem.location || null, // Use room name from rooms table, fallback to location field
        category_id: classItem.category_id || null,
        category_name: category?.name || null,
        instructors: getInstructors(classItem),
      }
    })

    const transformedChildren = childInstances.map((classItem: any) => {
    const bookedCount = bookingCounts[classItem.id] || 0
      const room = Array.isArray(classItem.rooms) ? classItem.rooms[0] : classItem.rooms
      const category = Array.isArray(classItem.class_categories) ? classItem.class_categories[0] : classItem.class_categories
    
    return {
        ...classItem,
        name: classItem.title || classItem.name, // Ensure 'name' field exists
      title: classItem.title,
      booked_count: bookedCount,
      tokens_required: classItem.token_cost,
        difficulty_level: classItem.level === 'all_levels' ? 'Beginner' : (classItem.level || 'all_levels').charAt(0).toUpperCase() + (classItem.level || 'all_levels').slice(1),
        room_id: classItem.room_id || null,
        room_name: room?.name || classItem.location || null, // Use room name from rooms table, fallback to location field
        category_id: classItem.category_id || null,
        category_name: category?.name || null,
        instructors: getInstructors(classItem),
      }
    })

    // Group recurring and course classes
    try {
      const grouped = groupRecurringClasses(transformedParents, transformedChildren, bookingCounts)
      // If grouping returns empty but we have classes, return them directly (they're already transformed)
      if (grouped.length === 0 && transformedParents.length > 0) {
        console.log('Grouping returned empty, returning', transformedParents.length, 'transformed parents')
        return transformedParents
      }
      console.log('Grouping returned', grouped.length, 'classes')
      return grouped
    } catch (error) {
      console.error('Error grouping classes:', error)
      // Fallback: return transformed parents directly (they already have correct structure)
      console.log('Fallback: returning', transformedParents.length, 'transformed parents')
      return transformedParents
    }
  } catch (error) {
    console.error('Error in getUpcomingClasses:', error)
    return []
  }
}

// Group recurring and course classes
// For recurring classes: expand into individual session cards (each session is bookable separately)
// For course classes: show parent cards (courses are booked as a whole)
function groupRecurringClasses(
  parentClasses: any[],
  childInstances: any[],
  bookingCounts: Record<string, number>
): ClassWithAvailability[] {
  const singleClasses: ClassWithAvailability[] = []
  const recurringParents: ClassWithAvailability[] = [] // Recurring parent cards
  const courseParents: ClassWithAvailability[] = []

  // Group child instances by parent_class_id
  const childrenByParent = new Map<string, any[]>()
  childInstances.forEach((child) => {
    const parentId = child.parent_class_id
    if (parentId) {
      if (!childrenByParent.has(parentId)) {
        childrenByParent.set(parentId, [])
      }
      childrenByParent.get(parentId)!.push(child)
    }
  })

  // Track which parents we've processed
  const processedParentIds = new Set<string>()

  // Process each parent class
  parentClasses.forEach((parent) => {
    processedParentIds.add(parent.id)
    const bookedCount = bookingCounts[parent.id] || 0
    
    const baseClass: ClassWithAvailability = {
      id: parent.id,
      name: parent.title,
      title: parent.title,
      description: parent.description,
      instructor_id: parent.instructor_id || null,
      instructor_name: parent.instructor_name,
      instructors: parent.instructors || [],
      scheduled_at: parent.scheduled_at,
      duration_minutes: parent.duration_minutes,
      location: parent.location,
      room_id: parent.room_id || null,
      room_name: parent.room_name || null,
      category_id: parent.category_id || null,
      category_name: parent.category_name || null,
      capacity: parent.capacity,
      token_cost: parent.token_cost,
      class_type: parent.class_type,
      level: parent.level,
      booked_count: bookedCount,
      tokens_required: parent.token_cost,
      difficulty_level: parent.level === 'all_levels' ? 'Beginner' : parent.level.charAt(0).toUpperCase() + parent.level.slice(1),
      status: parent.status,
      recurrence_type: parent.recurrence_type || null,
      recurrence_pattern: parent.recurrence_pattern || null,
      parent_class_id: null,
    }

    // Check if this is a recurring or course parent
    const isRecurring = parent.recurrence_type === 'recurring'
    const isCourse = parent.recurrence_type === 'course'
    
    if (isRecurring || isCourse) {
      // Get child instances for this parent
      const instances = childrenByParent.get(parent.id) || []
      
      if (instances.length > 0) {
        // Sort instances by date
        const sorted = [...instances].sort((a, b) => 
          new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
        )
        
        // For BOTH recurring and course: show parent card (folder UI)
        const now = new Date()
        const nextUpcoming = sorted.find(s => new Date(s.scheduled_at) > now) || sorted[sorted.length - 1] || sorted[0]
        const totalEnrolled = sorted.reduce((sum, s) => sum + (bookingCounts[s.id] || 0), 0)
        const perSessionCapacity = parent.capacity
        
        if (isCourse) {
          // Course: Show total tokens for entire course
          const totalTokens = sorted.length * parent.token_cost
          
          const courseCard: ClassWithAvailability = {
            ...baseClass,
            scheduled_at: nextUpcoming.scheduled_at,
            booked_count: totalEnrolled,
            capacity: perSessionCapacity,
            tokens_required: totalTokens,
            room_name: nextUpcoming.room_name || nextUpcoming.location || parent.room_name || parent.location || null,
            instructors: nextUpcoming.instructors || parent.instructors || [],
            _isParent: true,
            _childInstances: sorted,
            _totalSessions: sorted.length,
          }
          courseParents.push(courseCard)
        } else {
          // Recurring: Show parent card with sessions available
          const recurringCard: ClassWithAvailability = {
            ...baseClass,
            scheduled_at: nextUpcoming.scheduled_at,
            booked_count: totalEnrolled,
            capacity: perSessionCapacity,
            room_name: nextUpcoming.room_name || nextUpcoming.location || parent.room_name || parent.location || null,
            instructors: nextUpcoming.instructors || parent.instructors || [],
            _isParent: true,
            _childInstances: sorted,
            _totalSessions: sorted.length,
          }
          recurringParents.push(recurringCard)
        }
      } else {
        // No instances yet, show parent as-is
        const parentCard: ClassWithAvailability = {
          ...baseClass,
          room_name: parent.room_name || parent.location || null,
          instructors: parent.instructors || [],
          _isParent: true,
          _childInstances: [],
          _totalSessions: 0,
        }
        
        if (isCourse) {
          courseParents.push(parentCard)
        } else {
          recurringParents.push(parentCard)
        }
      }
    } else {
      // Single class
      singleClasses.push(baseClass)
    }
  })

  // Create synthetic parents for child instances that don't have a parent record
  // This handles cases where parent record might be missing but children exist
  childrenByParent.forEach((instances, parentId) => {
    if (!processedParentIds.has(parentId) && instances.length > 0) {
      // Use first instance as template for parent
      const firstInstance = instances[0]
      const sorted = [...instances].sort((a, b) => 
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )
      
      // Extract base name (remove date suffix)
      const baseTitle = firstInstance.title.replace(/-\s*\d{1,2}\/\d{1,2}\/\d{4}$/, '').trim()
      
      const now = new Date()
      const nextUpcoming = sorted.find(s => new Date(s.scheduled_at) > now) || sorted[sorted.length - 1] || sorted[0]
      const totalEnrolled = sorted.reduce((sum, s) => sum + (bookingCounts[s.id] || 0), 0)
      
      const syntheticParent: ClassWithAvailability = {
        id: parentId,
        name: baseTitle,
        title: baseTitle,
        description: firstInstance.description,
        instructor_id: firstInstance.instructor_id,
        instructor_name: firstInstance.instructor_name,
        instructors: firstInstance.instructors || [],
        scheduled_at: nextUpcoming.scheduled_at,
        duration_minutes: firstInstance.duration_minutes,
        location: firstInstance.location,
        room_id: firstInstance.room_id,
        room_name: nextUpcoming.room_name || nextUpcoming.location || firstInstance.location || null,
        category_id: firstInstance.category_id,
        category_name: firstInstance.category_name,
        capacity: firstInstance.capacity,
        token_cost: firstInstance.token_cost,
        class_type: firstInstance.class_type,
        level: firstInstance.level,
        booked_count: totalEnrolled,
        tokens_required: firstInstance.token_cost,
        difficulty_level: firstInstance.level === 'all_levels' ? 'Beginner' : firstInstance.level.charAt(0).toUpperCase() + firstInstance.level.slice(1),
        status: firstInstance.status,
        recurrence_type: firstInstance.recurrence_type === 'course' ? 'course' : 'recurring',
        recurrence_pattern: firstInstance.recurrence_pattern,
        parent_class_id: null,
        _isParent: true,
        _childInstances: sorted,
        _totalSessions: sorted.length,
      }
      
      if (firstInstance.recurrence_type === 'course') {
        courseParents.push(syntheticParent)
      } else {
        recurringParents.push(syntheticParent)
      }
    }
  })

  // Combine: single classes + recurring parents + course parents
  return [...singleClasses, ...recurringParents, ...courseParents].sort((a, b) => 
    new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  )
}

/**
 * Book a class - validates tokens and creates booking
 * Includes: max bookings limit, waitlist auto-join, token validation
 */
export async function bookClass(userId: string, classId: string): Promise<{
  success: boolean
  message: string
  bookingId?: string
  waitlistPosition?: number
}> {
  const supabase = getSupabaseClient()

  try {
    // Get booking settings
    const settings = await getBookingSettings()

    // 1. Get class details
    const { data: classData, error: classError } = await supabase
      .from(TABLES.CLASSES)
      .select('*')
      .eq('id', classId)
      .eq('status', 'scheduled')
      .single()

    if (classError || !classData) {
      return {
        success: false,
        message: 'Class not found or not available',
      }
    }

    // Use admin API for ALL bookings to ensure notifications are triggered
    // The admin API handles: single classes, recurring class sessions, and course packages
    const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    try {
      // Use centralized API fetch with automatic token refresh
      const { apiFetchJson } = await import('@/lib/api-fetch')
      
      const result = await apiFetchJson<{
        success: boolean;
        data?: any;
        error?: { code: string; message: string };
      }>(`${adminApiUrl}/api/bookings`, {
        method: 'POST',
        body: JSON.stringify({
          userId,
          classId,
        }),
        requireAuth: true,
      })

      if (!result.success) {
        return {
          success: false,
          message: result.error?.message || 'Failed to book class',
        }
      }

      return {
        success: true,
        message: result.data?.message || 'Class booked successfully!',
        bookingId: result.data?.booking?.id,
      }
    } catch (error) {
      console.error('Error booking class via admin API:', error)
      // Fall back to local booking if admin API fails
      console.log('Falling back to local booking...')
    }

    // FALLBACK: Local booking (if admin API is unavailable)
    // Note: Notifications won't be triggered in fallback mode
    
    // Check if class is in the future (for single/recurring classes)
    if (new Date(classData.scheduled_at) <= new Date()) {
      return {
        success: false,
        message: 'Cannot book past classes',
      }
    }

    // 2. Check if user already has a booking for this class
    const { data: userBooking } = await supabase
      .from(TABLES.BOOKINGS)
      .select('id, status')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .maybeSingle()

    if (userBooking) {
      // Active bookings - can't book again
      if (userBooking.status === 'confirmed' || userBooking.status === 'waitlist') {
        return {
          success: false,
          message: 'You already have a booking for this class',
        }
      }
      
      // Attended - can't book again
      if (userBooking.status === 'attended') {
        return {
          success: false,
          message: 'You have already attended this class',
        }
      }
      
      // Cancelled bookings - we'll update the existing record instead of creating new one
      // This handles the unique constraint issue
      if (userBooking.status === 'cancelled' || userBooking.status === 'cancelled-late') {
        // Continue to booking logic - we'll update the existing booking
        // This is handled below in the insert logic
      } else {
        // No-show or other status
        return {
          success: false,
          message: 'You already have a booking record for this class',
        }
      }
    }

    // Check for existing waitlist entry
    const { data: existingWaitlist } = await supabase
      .from(TABLES.WAITLIST)
      .select('id, position, status')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .in('status', ['waiting', 'notified'])
      .maybeSingle()

    if (existingWaitlist) {
      return {
        success: false,
        message: `You are already on the waitlist at position ${existingWaitlist.position}`,
      }
    }

    // 3. Check max concurrent bookings limit
    const { data: userBookings } = await supabase
      .from(TABLES.BOOKINGS)
      .select('id')
      .eq('user_id', userId)
      .in('status', ['confirmed', 'waitlist'])

    const activeBookingsCount = userBookings?.length || 0
    if (activeBookingsCount >= settings.maxBookingsPerUser) {
      return {
        success: false,
        message: `You have reached the maximum of ${settings.maxBookingsPerUser} concurrent bookings. Please cancel a booking first.`,
      }
    }

    // 4. Check capacity
    const { data: existingBookings } = await supabase
      .from(TABLES.BOOKINGS)
      .select('id')
      .eq('class_id', classId)
      .eq('status', 'confirmed')

    const bookedCount = existingBookings?.length || 0
    const isFull = bookedCount >= classData.capacity

    // 5. If class is full and waitlist is enabled, join waitlist instead
    if (isFull && settings.waitlistEnabled) {
      return await joinWaitlist(userId, classId, classData)
    }

    if (isFull) {
      return {
        success: false,
        message: 'Class is full. Waitlist is currently disabled.',
      }
    }

    // 6. Check token balance
    const tokenBalance = await getTokenBalance(userId)
    if (tokenBalance.available < classData.token_cost) {
      return {
        success: false,
        message: `Insufficient tokens. You need ${classData.token_cost} token(s) but only have ${tokenBalance.available} available.`,
      }
    }

    // 7. Get an available user package to use
    const { data: userPackages } = await supabase
      .from(TABLES.USER_PACKAGES)
      .select('id, tokens_remaining, tokens_held')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })

    if (!userPackages || userPackages.length === 0) {
      return {
        success: false,
        message: 'No active token packages found',
      }
    }

    // Find a package with enough tokens
    let selectedPackage = userPackages.find(
      (pkg: any) => (pkg.tokens_remaining - pkg.tokens_held) >= classData.token_cost
    )

    if (!selectedPackage) {
      return {
        success: false,
        message: 'No package has enough available tokens',
      }
    }

    // 8. Hold tokens (update tokens_held)
    const { error: holdError } = await supabase
      .from(TABLES.USER_PACKAGES)
      .update({
        tokens_held: (selectedPackage.tokens_held || 0) + classData.token_cost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPackage.id)
      .eq('user_id', userId) // Ensure user can only update their own packages

    if (holdError) {
      console.error('Error holding tokens:', holdError)
      return {
        success: false,
        message: 'Failed to reserve tokens',
      }
    }

    // 9. Check if there's a cancelled booking we can reuse
    const { data: cancelledBooking } = await supabase
      .from(TABLES.BOOKINGS)
      .select('id, status')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .in('status', ['cancelled', 'cancelled-late'])
      .maybeSingle()

    let bookingId: string

    if (cancelledBooking) {
      // Update existing cancelled booking to confirmed
      const { data: updatedBooking, error: updateError } = await supabase
        .from(TABLES.BOOKINGS)
        .update({
          user_package_id: selectedPackage.id,
          tokens_used: classData.token_cost,
          status: 'confirmed',
          booked_at: new Date().toISOString(),
          cancelled_at: null,
          cancellation_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cancelledBooking.id)
        .select('id')
        .single()

      if (updateError) {
        // Rollback: release tokens
        await supabase
          .from(TABLES.USER_PACKAGES)
          .update({
            tokens_held: selectedPackage.tokens_held || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedPackage.id)

        return {
          success: false,
          message: 'Failed to update booking. Please try again.',
        }
      }

      bookingId = updatedBooking.id
    } else {
      // Create new booking
      const { data: booking, error: bookingError } = await supabase
        .from(TABLES.BOOKINGS)
        .insert({
          user_id: userId,
          class_id: classId,
          user_package_id: selectedPackage.id,
          tokens_used: classData.token_cost,
          status: 'confirmed',
          booked_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (bookingError) {
        // Rollback: release tokens
        await supabase
          .from(TABLES.USER_PACKAGES)
          .update({
            tokens_held: selectedPackage.tokens_held || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedPackage.id)

        // Check for duplicate key error
        if (bookingError.code === '23505') {
          // Double-check for existing booking
          const { data: existingBooking } = await supabase
            .from(TABLES.BOOKINGS)
            .select('id, status')
            .eq('user_id', userId)
            .eq('class_id', classId)
            .maybeSingle()

          if (existingBooking) {
            if (existingBooking.status === 'confirmed' || existingBooking.status === 'waitlist') {
              return {
                success: false,
                message: 'You already have a booking for this class',
              }
            }
            return {
              success: false,
              message: 'Unable to create booking. Please try again or contact support.',
            }
          }
        }

        return {
          success: false,
          message: bookingError.message || 'Failed to create booking. Please try again.',
        }
      }

      bookingId = booking.id
    }

    return {
      success: true,
      message: 'Class booked successfully!',
      bookingId: bookingId,
    }
  } catch (error) {
    console.error('Error booking class:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

/**
 * Join waitlist for a full class
 */
async function joinWaitlist(
  userId: string,
  classId: string,
  classData: any
): Promise<{
  success: boolean
  message: string
  waitlistPosition?: number
}> {
  const supabase = getSupabaseClient()

  try {
    // Get current max position
    const { data: maxPositionResult } = await supabase
      .from(TABLES.WAITLIST)
      .select('position')
      .eq('class_id', classId)
      .in('status', ['waiting', 'notified'])
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle()

    const newPosition = (maxPositionResult?.position || 0) + 1

    // Create waitlist entry
    const { data: waitlistEntry, error: insertError } = await supabase
      .from(TABLES.WAITLIST)
      .insert({
        user_id: userId,
        class_id: classId,
        position: newPosition,
        joined_at: new Date().toISOString(),
        status: 'waiting',
      })
      .select('id')
      .single()

    if (insertError) {
      // Check if it's a duplicate entry error
      if (insertError.code === '23505') {
        return {
          success: false,
          message: 'You are already on the waitlist for this class',
        }
      }
      return {
        success: false,
        message: 'Failed to join waitlist',
      }
    }

    return {
      success: true,
      message: `You are now #${newPosition} on the waitlist for ${classData.title}. You'll be notified if a spot opens up.`,
      waitlistPosition: newPosition,
    }
  } catch (error) {
    console.error('Error joining waitlist:', error)
    return {
      success: false,
      message: 'Failed to join waitlist',
    }
  }
}

/**
 * Cancel a booking - handles cancellation window and token refund/penalty
 */
export async function cancelBooking(
  userId: string,
  bookingId: string,
  reason?: string
): Promise<{
  success: boolean
  message: string
  tokensRefunded?: number
  penalty?: boolean
}> {
  // Use admin API for cancellations to ensure notifications are triggered
  const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  try {
    // Use centralized API fetch with automatic token refresh
    const { apiFetchJson } = await import('@/lib/api-fetch')
    
    const result = await apiFetchJson<{
      success: boolean;
      data?: any;
      error?: { code: string; message: string };
    }>(`${adminApiUrl}/api/bookings/${bookingId}`, {
      method: 'DELETE',
      body: JSON.stringify({
        userId,
        reason,
      }),
      requireAuth: true,
    })

    if (!result.success) {
      return {
        success: false,
        message: result.error?.message || 'Failed to cancel booking',
      }
    }

    return {
      success: true,
      message: result.data?.message || 'Booking cancelled successfully!',
      tokensRefunded: result.data?.tokensRefunded,
      penalty: result.data?.penalty,
    }
  } catch (error) {
    console.error('Error cancelling booking via admin API:', error)
    // Fall back to local cancellation if admin API fails
    console.log('Falling back to local cancellation...')
  }

  // FALLBACK: Local cancellation (if admin API is unavailable)
  // Note: Notifications won't be triggered in fallback mode
  const supabase = getSupabaseClient()

  try {
    // Get booking settings
    const settings = await getBookingSettings()

    // 1. Get booking with class details
    const { data: booking, error: fetchError } = await supabase
      .from(TABLES.BOOKINGS)
      .select(`
        *,
        class:classes (
          scheduled_at,
          title
        )
      `)
      .eq('id', bookingId)
      .eq('user_id', userId)
      .maybeSingle()

    if (fetchError || !booking) {
      return {
        success: false,
        message: 'Booking not found',
      }
    }

    if (booking.status !== 'confirmed') {
      return {
        success: false,
        message: `Cannot cancel booking with status: ${booking.status}`,
      }
    }

    const classData = Array.isArray((booking as any).class) 
      ? (booking as any).class[0] 
      : (booking as any).class

    if (!classData) {
      return {
        success: false,
        message: 'Class information not found',
      }
    }

    // 2. Check if class has already started
    const classTime = new Date(classData.scheduled_at)
    const now = new Date()
    
    if (classTime <= now) {
      return {
        success: false,
        message: 'Cannot cancel after class has started',
      }
    }

    // 3. Check cancellation window
    const hoursUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60 * 60)
    const isWithinWindow = hoursUntilClass >= settings.cancellationWindow
    const isLateCancel = !isWithinWindow && hoursUntilClass > 0

    let newStatus: 'cancelled' | 'cancelled-late'
    let tokensRefunded = 0

    // Get current package state
    const { data: userPackage } = await supabase
      .from(TABLES.USER_PACKAGES)
      .select('tokens_remaining, tokens_held')
      .eq('id', booking.user_package_id)
      .maybeSingle()

    if (!userPackage) {
      return {
        success: false,
        message: 'User package not found',
      }
    }

    if (isWithinWindow) {
      // Free cancellation - release tokens
      newStatus = 'cancelled'
      tokensRefunded = booking.tokens_used

      // Release held tokens (refund to available)
      const newTokensHeld = Math.max(0, (userPackage.tokens_held || 0) - booking.tokens_used)
      const { error: releaseError } = await supabase
        .from(TABLES.USER_PACKAGES)
        .update({
          tokens_held: newTokensHeld,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.user_package_id)

      if (releaseError) {
        console.error('Error releasing tokens:', releaseError)
        // Continue with cancellation even if token release fails
      }
    } else if (isLateCancel) {
      // Late cancellation - consume tokens as penalty
      newStatus = 'cancelled-late'
      tokensRefunded = 0

      // Consume tokens (reduce tokens_remaining and tokens_held)
      const newTokensRemaining = Math.max(0, (userPackage.tokens_remaining || 0) - booking.tokens_used)
      const newTokensHeld = Math.max(0, (userPackage.tokens_held || 0) - booking.tokens_used)
      
      const { error: consumeError } = await supabase
        .from(TABLES.USER_PACKAGES)
        .update({
          tokens_remaining: newTokensRemaining,
          tokens_held: newTokensHeld,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.user_package_id)

      if (consumeError) {
        console.error('Error consuming tokens:', consumeError)
        // Continue with cancellation even if token consumption fails
      }
    } else {
      return {
        success: false,
        message: 'Cannot cancel after class has started',
      }
    }

    // 4. Update booking status
    const { error: updateError } = await supabase
      .from(TABLES.BOOKINGS)
      .update({
        status: newStatus,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      return {
        success: false,
        message: 'Failed to cancel booking',
      }
    }

    // 5. Process waitlist if enabled (notify next person)
    if (settings.waitlistEnabled) {
      // This would ideally be done server-side, but we can trigger it here
      // For now, we'll just note that waitlist processing should happen
      // In production, this should be a server-side function or webhook
    }

    return {
      success: true,
      message: isLateCancel
        ? `Booking cancelled. ${booking.tokens_used} token(s) consumed as late cancellation penalty (cancelled less than ${settings.cancellationWindow} hours before class).`
        : `Booking cancelled. ${tokensRefunded} token(s) refunded.`,
      tokensRefunded,
      penalty: isLateCancel,
    }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while cancelling',
    }
  }
}

/**
 * Leave waitlist
 */
export async function leaveWaitlist(
  userId: string,
  classId: string
): Promise<{
  success: boolean
  message: string
}> {
  const supabase = getSupabaseClient()

  try {
    const { error } = await supabase
      .from(TABLES.WAITLIST)
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('class_id', classId)
      .in('status', ['waiting', 'notified'])

    if (error) {
      return {
        success: false,
        message: 'Failed to leave waitlist',
      }
    }

    return {
      success: true,
      message: 'You have been removed from the waitlist',
    }
  } catch (error) {
    console.error('Error leaving waitlist:', error)
    return {
      success: false,
      message: 'Failed to leave waitlist',
    }
  }
}

