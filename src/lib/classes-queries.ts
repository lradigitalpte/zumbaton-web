/**
 * Direct Supabase queries for classes and bookings
 * Uses RLS (Row Level Security) to ensure proper access control
 */

import { getSupabaseClient, TABLES } from './supabase'
import { getTokenBalance } from './dashboard-queries'
import { getBookingSettings, type BookingSettings } from './booking-settings'

export interface ClassWithAvailability {
  id: string
  name: string
  title: string
  description: string | null
  instructor_name: string | null
  scheduled_at: string
  duration_minutes: number
  location: string | null
  capacity: number
  token_cost: number
  class_type: string
  level: string
  booked_count: number
  tokens_required: number
  difficulty_level: string
  status: string
}

/**
 * Get all upcoming classes with booking counts
 */
export async function getUpcomingClasses(filters?: {
  type?: string
  difficulty?: string
  date?: string
}): Promise<ClassWithAvailability[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from(TABLES.CLASSES)
    .select(`
      id,
      title,
      description,
      class_type,
      level,
      instructor_name,
      scheduled_at,
      duration_minutes,
      capacity,
      token_cost,
      location,
      status,
      recurrence_type,
      parent_class_id
    `)
    .eq('status', 'scheduled')
    .order('scheduled_at', { ascending: true })

  // Apply filters
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('class_type', filters.type.toLowerCase())
  }

  if (filters?.difficulty && filters.difficulty !== 'all') {
    query = query.eq('level', filters.difficulty.toLowerCase())
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

  const now = new Date().toISOString()
  
  // Filter: Show future classes OR past classes that are recurring/course
  const filteredClasses = (classes || []).filter((classItem: any) => {
    const isFuture = new Date(classItem.scheduled_at) >= new Date(now)
    const isRecurring = classItem.recurrence_type && classItem.recurrence_type !== 'single'
    const isCourse = classItem.parent_class_id !== null
    
    // Show if: future class OR (past class that is recurring/course)
    return isFuture || isRecurring || isCourse
  })

  // Get booking counts for each class
  const classIds = filteredClasses.map((c: any) => c.id)
  
  let bookingCounts: Record<string, number> = {}
  
  if (classIds.length > 0) {
    const { data: bookings, error: bookingError } = await supabase
      .from(TABLES.BOOKINGS)
      .select('class_id, status')
      .in('class_id', classIds)
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


  // Transform to match expected format
  return filteredClasses.map((classItem: any) => {
    const bookedCount = bookingCounts[classItem.id] || 0
    
    return {
      id: classItem.id,
      name: classItem.title,
      title: classItem.title,
      description: classItem.description,
      instructor_name: classItem.instructor_name,
      scheduled_at: classItem.scheduled_at,
      duration_minutes: classItem.duration_minutes,
      location: classItem.location,
      capacity: classItem.capacity,
      token_cost: classItem.token_cost,
      class_type: classItem.class_type,
      level: classItem.level,
      booked_count: bookedCount,
      tokens_required: classItem.token_cost,
      difficulty_level: classItem.level === 'all_levels' ? 'Beginner' : classItem.level.charAt(0).toUpperCase() + classItem.level.slice(1),
      status: classItem.status,
    }
  })
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

    // Check if class is in the future
    if (new Date(classData.scheduled_at) <= new Date()) {
      return {
        success: false,
        message: 'Cannot book past classes',
      }
    }

    // 2. Check if user already has a booking or waitlist entry
    const { data: userBooking } = await supabase
      .from(TABLES.BOOKINGS)
      .select('id, status')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .in('status', ['confirmed', 'waitlist'])
      .maybeSingle()

    if (userBooking) {
      return {
        success: false,
        message: 'You already have a booking for this class',
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

    // 9. Create booking
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

      return {
        success: false,
        message: 'Failed to create booking',
      }
    }

    return {
      success: true,
      message: 'Class booked successfully!',
      bookingId: booking.id,
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

