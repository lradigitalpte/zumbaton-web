/**
 * Bookings API Route
 * POST /api/bookings - Create a booking (single or batch)
 * Uses server-side Supabase admin client to avoid client-side query lag
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client for auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

// Initialize Supabase admin client for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * Helpers for Singapore time booking window
 */
function getSingaporeNow() {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utcMs + 8 * 60 * 60 * 1000)
}

function isBookingWindowOpen() {
  const nowSG = getSingaporeNow()
  const hour = nowSG.getHours()
  // Allow booking from 08:00 (inclusive) to 22:00 (exclusive) - 8am to 10pm
  return hour >= 8 && hour < 22
}

/**
 * Get authenticated user from Authorization header
 */
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return user
}

/**
 * POST /api/bookings - Create booking(s)
 * 
 * Body:
 * - userId: string (optional, will use authenticated user if not provided)
 * - classId: string (for single booking)
 * - classIds: string[] (for batch booking)
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, classId, classIds } = body

    // Use authenticated user's ID if userId not provided
    const targetUserId = userId || user.id

    // Validate that user can only book for themselves (unless they're admin)
    if (targetUserId !== user.id) {
      // Check if user is admin
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin' && profile?.role !== 'super_admin') {
        return NextResponse.json(
          { success: false, error: { message: 'You can only book classes for yourself' } },
          { status: 403 }
        )
      }
    }

    // Check if batch booking or single booking
    if (classIds && Array.isArray(classIds) && classIds.length > 0) {
      // Enforce booking window for batch bookings as well
      if (!isBookingWindowOpen()) {
        return NextResponse.json(
          { success: false, error: { message: 'Bookings are only allowed between 08:00 and 22:00 SGT' } },
          { status: 400 }
        )
      }
      // Batch booking - delegate to admin API for now (complex logic)
      const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      try {
        const response = await fetch(`${adminApiUrl}/api/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': request.headers.get('authorization') || '',
          },
          body: JSON.stringify({
            userId: targetUserId,
            classIds,
          }),
        })

        const result = await response.json()
        return NextResponse.json(result, { status: response.status })
      } catch (error) {
        console.error('[API Bookings] Batch booking error:', error)
        return NextResponse.json(
          { success: false, error: { message: error instanceof Error ? error.message : 'Failed to process batch booking' } },
          { status: 500 }
        )
      }
    } else if (classId) {
      // Enforce booking window for single bookings
      if (!isBookingWindowOpen()) {
        return NextResponse.json(
          { success: false, error: { message: 'Bookings are only allowed between 08:00 and 22:00 SGT' } },
          { status: 400 }
        )
      }
      // Single booking - handle server-side
      return await handleSingleBooking(targetUserId, classId)
    } else {
      return NextResponse.json(
        { success: false, error: { message: 'Either classId or classIds is required' } },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('[API Bookings] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Internal server error' 
        } 
      },
      { status: 500 }
    )
  }
}

/**
 * Handle single booking creation
 */
async function handleSingleBooking(userId: string, classId: string) {
  try {
    // 1. Get class details
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('id', classId)
      .eq('status', 'scheduled')
      .single()

    if (classError || !classData) {
      return NextResponse.json(
        { success: false, error: { message: 'Class not found or not available' } },
        { status: 404 }
      )
    }

    // 1.5. Check if this is a course parent - courses book ALL sessions at once
    // Recurring classes book individual sessions, courses book all sessions
    const isCourseParent = classData.recurrence_type === 'course' && !classData.parent_class_id
    
    if (isCourseParent) {
      // Course parent - book all child sessions
      return await handleCourseBooking(userId, classId, classData)
    }
    
    // Check if this is a recurring parent (not a course) - these should not be booked directly
    if (classData.recurrence_type === 'recurring' && !classData.parent_class_id) {
      // Check if this class has child instances (it's a parent)
      const { data: childInstances } = await supabaseAdmin
        .from('classes')
        .select('id')
        .eq('parent_class_id', classId)
        .limit(1)

      if (childInstances && childInstances.length > 0) {
        return NextResponse.json(
          { success: false, error: { message: 'Cannot book recurring parent class directly. Please select individual sessions to book.' } },
          { status: 400 }
        )
      }
    }

    // 2. Check if class is in the future
    if (new Date(classData.scheduled_at) <= new Date()) {
      return NextResponse.json(
        { success: false, error: { message: 'Cannot book past classes' } },
        { status: 400 }
      )
    }

    // 2.5. Enforce booking window on server-side (SGT)
    if (!isBookingWindowOpen()) {
      return NextResponse.json(
        { success: false, error: { message: 'Bookings are only allowed between 09:00 and 17:00 SGT' } },
        { status: 400 }
      )
    }

    // 3. Check if user already has a booking
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id, status')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .maybeSingle()

    if (existingBooking) {
      if (existingBooking.status === 'confirmed' || existingBooking.status === 'waitlist') {
        return NextResponse.json(
          { success: false, error: { message: 'You already have a booking for this class' } },
          { status: 400 }
        )
      }
    }

    // 4. Check capacity
    const { data: bookings, count } = await supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('class_id', classId)
      .eq('status', 'confirmed')

    const bookedCount = count || 0
    const isFull = bookedCount >= classData.capacity

    if (isFull) {
      // Check if waitlist is enabled
      const { data: settings } = await supabaseAdmin
        .from('booking_settings')
        .select('waitlist_enabled')
        .single()

      if (settings?.waitlist_enabled) {
        // Join waitlist logic would go here
        return NextResponse.json(
          { success: false, error: { message: 'Class is full. Waitlist functionality coming soon.' } },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { success: false, error: { message: 'Class is full' } },
          { status: 400 }
        )
      }
    }

    // 5. Get user's available tokens
    const { data: userPackages } = await supabaseAdmin
      .from('user_packages')
      .select('id, tokens_remaining, tokens_held')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    // Calculate available tokens: tokens_remaining - tokens_held for each package
    const totalAvailable = userPackages?.reduce((sum, pkg) => {
      const remaining = pkg.tokens_remaining || 0
      const held = pkg.tokens_held || 0
      const available = Math.max(0, remaining - held) // Ensure non-negative
      return sum + available
    }, 0) || 0

    // Use token_cost from database (should be the same as tokens_required)
    const tokenCost = classData.token_cost || 1

    // Debug logging
    console.log('[API Bookings] Booking class:', {
      classId,
      className: classData.title || classData.name,
      tokenCost,
      recurrenceType: classData.recurrence_type,
      parentClassId: classData.parent_class_id,
    })

    // Additional validation: If this is a child session, ensure token_cost is reasonable
    // For child sessions, token_cost should be per session, not total
    if (classData.parent_class_id) {
      // This is a child session - token_cost should be per session
      // Validate it's not unreasonably high (e.g., > 10 tokens per session)
      if (tokenCost > 10) {
        console.warn('[API Bookings] Suspiciously high token cost for child session:', tokenCost)
        // Still allow it, but log a warning
      }
    }

    if (totalAvailable < tokenCost) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: `Insufficient tokens. You need ${tokenCost} token${tokenCost !== 1 ? 's' : ''} but only have ${totalAvailable} available.` 
          } 
        },
        { status: 400 }
      )
    }

    // 6. Find package with enough available tokens
    const selectedPackage = userPackages?.find(pkg => {
      const remaining = pkg.tokens_remaining || 0
      const held = pkg.tokens_held || 0
      const available = Math.max(0, remaining - held)
      return available >= tokenCost
    })

    if (!selectedPackage) {
      return NextResponse.json(
        { success: false, error: { message: 'No package has enough available tokens' } },
        { status: 400 }
      )
    }

    // 7. Hold tokens
    const { error: holdError } = await supabaseAdmin
      .from('user_packages')
      .update({
        tokens_held: (selectedPackage.tokens_held || 0) + tokenCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPackage.id)

    if (holdError) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to reserve tokens' } },
        { status: 500 }
      )
    }

    // 8. Create booking
    const bookingData = {
      user_id: userId,
      class_id: classId,
      user_package_id: selectedPackage.id,
      tokens_used: tokenCost,
      status: 'confirmed',
      booked_at: new Date().toISOString(),
    }

    // Update existing cancelled booking if exists, otherwise create new
    let bookingId: string
    if (existingBooking && (existingBooking.status === 'cancelled' || existingBooking.status === 'cancelled-late')) {
      const { data: updatedBooking, error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({
          ...bookingData,
          cancelled_at: null,
          cancellation_reason: null,
        })
        .eq('id', existingBooking.id)
        .select('id')
        .single()

      if (updateError) {
        // Rollback token hold
        await supabaseAdmin
          .from('user_packages')
          .update({
            tokens_held: selectedPackage.tokens_held || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedPackage.id)

        return NextResponse.json(
          { success: false, error: { message: 'Failed to create booking' } },
          { status: 500 }
        )
      }

      bookingId = updatedBooking.id
    } else {
      const { data: newBooking, error: insertError } = await supabaseAdmin
        .from('bookings')
        .insert(bookingData)
        .select('id')
        .single()

      if (insertError) {
        // Rollback token hold
        await supabaseAdmin
          .from('user_packages')
          .update({
            tokens_held: selectedPackage.tokens_held || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedPackage.id)

        return NextResponse.json(
          { success: false, error: { message: 'Failed to create booking' } },
          { status: 500 }
        )
      }

      bookingId = newBooking.id
    }

    // 9. Create token transaction
    await supabaseAdmin
      .from('token_transactions')
      .insert({
        user_id: userId,
        user_package_id: selectedPackage.id,
        transaction_type: 'booking',
        amount: -tokenCost,
        description: `Booking for class: ${classData.title || classData.name}`,
        booking_id: bookingId,
      })

    // 10. Update package tokens (reduce tokens_remaining, release held tokens)
    await supabaseAdmin
      .from('user_packages')
      .update({
        tokens_remaining: (selectedPackage.tokens_remaining || 0) - tokenCost,
        tokens_held: (selectedPackage.tokens_held || 0) - tokenCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPackage.id)

    return NextResponse.json({
      success: true,
      data: {
        booking: { id: bookingId },
        message: 'Class booked successfully!',
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[API Bookings] Single booking error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to create booking' 
        } 
      },
      { status: 500 }
    )
  }
}

/**
 * Handle course booking - books ALL future child sessions at once
 */
async function handleCourseBooking(userId: string, parentClassId: string, parentClassData: any) {
  try {
    const now = new Date()

    // Enforce booking window for course bookings as well
    if (!isBookingWindowOpen()) {
      return NextResponse.json(
        { success: false, error: { message: 'Bookings are only allowed between 09:00 and 17:00 SGT' } },
        { status: 400 }
      )
    }

    // 1. Find all child instances (sessions) for this course
    const { data: allSessions, error: sessionsError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('parent_class_id', parentClassId)
      .eq('status', 'scheduled')
      .order('scheduled_at', { ascending: true })

    if (sessionsError || !allSessions || allSessions.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Course has no sessions available' } },
        { status: 400 }
      )
    }

    // 2. Filter to only future sessions
    const futureSessions = allSessions.filter((session: any) => {
      const sessionDate = new Date(session.scheduled_at)
      return sessionDate > now
    })

    if (futureSessions.length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Course has no future sessions available' } },
        { status: 400 }
      )
    }

    // 3. Check if user already has bookings for any of these sessions
    const sessionIds = futureSessions.map((s: any) => s.id)
    const { data: existingBookings } = await supabaseAdmin
      .from('bookings')
      .select('class_id, class:classes(title)')
      .eq('user_id', userId)
      .in('class_id', sessionIds)
      .in('status', ['confirmed', 'waitlist'])

    if (existingBookings && existingBookings.length > 0) {
      const bookedSession = existingBookings[0]
      const sessionTitle = (bookedSession.class as any)?.title || 'a session'
      return NextResponse.json(
        { success: false, error: { message: `You already have a booking for ${sessionTitle} in this course` } },
        { status: 409 }
      )
    }

    // 4. Check capacity for all sessions
    const { data: bookingCounts } = await supabaseAdmin
      .from('bookings')
      .select('class_id')
      .in('class_id', sessionIds)
      .in('status', ['confirmed', 'attended'])

    const bookingsBySession: Record<string, number> = {}
    bookingCounts?.forEach((booking: any) => {
      const id = booking.class_id
      bookingsBySession[id] = (bookingsBySession[id] || 0) + 1
    })

    // Check if any session is full
    for (const session of futureSessions) {
      const bookedCount = bookingsBySession[session.id] || 0
      if (bookedCount >= session.capacity) {
        return NextResponse.json(
          { success: false, error: { message: `Session "${session.title}" is full. Cannot complete course booking.` } },
          { status: 400 }
        )
      }
    }

    // 5. Calculate total tokens needed
    const tokenCostPerSession = parentClassData.token_cost || futureSessions[0]?.token_cost || 1
    const totalTokensNeeded = futureSessions.length * tokenCostPerSession

    // 6. Get user's available tokens
    const { data: userPackages } = await supabaseAdmin
      .from('user_packages')
      .select('id, tokens_remaining, tokens_held')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())

    // Calculate available tokens: tokens_remaining - tokens_held for each package
    const totalAvailable = userPackages?.reduce((sum, pkg) => {
      const remaining = pkg.tokens_remaining || 0
      const held = pkg.tokens_held || 0
      const available = Math.max(0, remaining - held) // Ensure non-negative
      return sum + available
    }, 0) || 0

    if (totalAvailable < totalTokensNeeded) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: `Insufficient tokens. You need ${totalTokensNeeded} tokens for ${futureSessions.length} sessions but only have ${totalAvailable} available.` 
          } 
        },
        { status: 400 }
      )
    }

    // 7. Find package with enough available tokens
    let selectedPackage = userPackages?.find(pkg => {
      const remaining = pkg.tokens_remaining || 0
      const held = pkg.tokens_held || 0
      const available = Math.max(0, remaining - held)
      return available >= totalTokensNeeded
    })

    if (!selectedPackage) {
      return NextResponse.json(
        { success: false, error: { message: 'No package has enough available tokens for the entire course' } },
        { status: 400 }
      )
    }

    // 8. Hold tokens for the entire course
    const { error: holdError } = await supabaseAdmin
      .from('user_packages')
      .update({
        tokens_held: (selectedPackage.tokens_held || 0) + totalTokensNeeded,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPackage.id)

    if (holdError) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to reserve tokens' } },
        { status: 500 }
      )
    }

    // 9. Create bookings for all future sessions
    const bookingsToCreate = futureSessions.map((session: any) => ({
      user_id: userId,
      class_id: session.id,
      user_package_id: selectedPackage.id,
      tokens_used: tokenCostPerSession,
      status: 'confirmed',
      booked_at: new Date().toISOString(),
    }))

    const { data: createdBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingsToCreate)
      .select('id')

    if (bookingsError) {
      // Rollback: release tokens
      await supabaseAdmin
        .from('user_packages')
        .update({
          tokens_held: selectedPackage.tokens_held || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPackage.id)

      return NextResponse.json(
        { success: false, error: { message: 'Failed to create course bookings' } },
        { status: 500 }
      )
    }

    if (!createdBookings || createdBookings.length === 0) {
      // Rollback: release tokens
      await supabaseAdmin
        .from('user_packages')
        .update({
          tokens_held: selectedPackage.tokens_held || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedPackage.id)

      return NextResponse.json(
        { success: false, error: { message: 'Failed to create course bookings' } },
        { status: 500 }
      )
    }

    // 10. Create token transactions for each booking
    for (const booking of createdBookings) {
      await supabaseAdmin
        .from('token_transactions')
        .insert({
          user_id: userId,
          user_package_id: selectedPackage.id,
          transaction_type: 'booking',
          amount: -tokenCostPerSession,
          description: `Course booking: ${parentClassData.title || parentClassData.name}`,
          booking_id: booking.id,
        })
    }

    // 11. Update package tokens (reduce tokens_remaining, release held tokens)
    await supabaseAdmin
      .from('user_packages')
      .update({
        tokens_remaining: (selectedPackage.tokens_remaining || 0) - totalTokensNeeded,
        tokens_held: (selectedPackage.tokens_held || 0) - totalTokensNeeded,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedPackage.id)

    return NextResponse.json({
      success: true,
      data: {
        booking: { id: createdBookings[0].id },
        message: `Successfully enrolled in course "${parentClassData.title || parentClassData.name}". ${futureSessions.length} sessions booked. ${totalTokensNeeded} token(s) used.`,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('[API Bookings] Course booking error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to create course booking' 
        } 
      },
      { status: 500 }
    )
  }
}

