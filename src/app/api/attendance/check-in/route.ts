import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, getSupabaseAdminClient, TABLES } from '@/lib/supabase'
import { z } from 'zod'

const CheckInRequestSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID').optional(),
  classId: z.string().uuid('Invalid class ID').optional(),
  token: z.string().optional(), // QR code token for validation
  qrData: z.object({
    classId: z.string().uuid(),
    token: z.string().min(1),
    sessionDate: z.string().optional(),
    sessionTime: z.string().optional(),
    expiresAt: z.number().optional(),
  }).optional(), // Full QR code data
})

// Check-in window constants (matching admin service)
const CHECK_IN_WINDOW_BEFORE_MINUTES = 30 // 30 min before class
const CHECK_IN_WINDOW_AFTER_MINUTES = 120 // 2 hours after class start (matching dashboard logic)

// Helper function to perform check-in (used by both QR and regular check-in)
async function performCheckIn(
  adminClient: ReturnType<typeof getSupabaseAdminClient>,
  bookingId: string,
  userId: string,
  method: 'qr-code' | 'manual',
  qrToken?: string
): Promise<NextResponse> {
  // Get booking with class info
  const { data: booking, error: fetchError } = await adminClient
    .from(TABLES.BOOKINGS)
    .select(`
      *,
      class:${TABLES.CLASSES}(*)
    `)
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'NOT_FOUND_ERROR',
        message: 'Booking not found',
      },
    }, { status: 404 })
  }

  // Verify the booking belongs to the authenticated user
  if (booking.user_id !== userId) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You can only check in to your own bookings',
      },
    }, { status: 403 })
  }

  // Validate booking status
  if (booking.status !== 'confirmed') {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: `Cannot check in booking with status: ${booking.status}`,
      },
    }, { status: 400 })
  }

  // Check if already checked in
  const { data: existingAttendance } = await adminClient
    .from(TABLES.ATTENDANCES)
    .select('id')
    .eq('booking_id', bookingId)
    .single()

  if (existingAttendance) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'ALREADY_CHECKED_IN',
        message: 'You have already checked in for this class.',
      },
    }, { status: 400 })
  }

  // Consume tokens from the user package
  const tokensToConsume = booking.tokens_used || 1
  let tokensBefore = 0
  let tokensAfter = 0

  if (booking.user_package_id) {
    // Get the user package
    const { data: userPackage, error: pkgError } = await adminClient
      .from('user_packages')
      .select('tokens_remaining, tokens_held')
      .eq('id', booking.user_package_id)
      .single()

    if (pkgError || !userPackage) {
      console.error('[Check-In] Package not found:', pkgError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND_ERROR',
          message: 'Booking package not found',
        },
      }, { status: 404 })
    }

    tokensBefore = userPackage.tokens_remaining || 0
    const newRemaining = Math.max(0, tokensBefore - tokensToConsume)
    const newHeld = Math.max(0, (userPackage.tokens_held || 0) - tokensToConsume)
    tokensAfter = newRemaining

    // Update package tokens
    const { error: packageUpdateError } = await adminClient
      .from('user_packages')
      .update({
        tokens_remaining: newRemaining,
        tokens_held: newHeld,
        status: newRemaining <= 0 ? 'depleted' : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.user_package_id)

    if (packageUpdateError) {
      console.error('[Check-In] Failed to update package tokens:', packageUpdateError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to consume tokens',
        },
      }, { status: 500 })
    }

    // Create token transaction record
    const { data: transaction, error: transactionError } = await adminClient
      .from('token_transactions')
      .insert({
        user_id: userId,
        user_package_id: booking.user_package_id,
        booking_id: bookingId,
        transaction_type: 'attendance-consume',
        tokens_change: -tokensToConsume,
        tokens_before: tokensBefore,
        tokens_after: tokensAfter,
        description: method === 'qr-code' ? `Checked in via QR code` : 'Checked in manually',
        performed_by: userId,
      })
      .select()
      .single()

    if (transactionError) {
      console.error('[Check-In] Failed to create token transaction:', transactionError)
      // Don't fail - tokens were already consumed
    }
  } else {
    console.warn('[Check-In] Booking has no user_package_id')
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Booking package not found',
      },
    }, { status: 400 })
  }

  // Update booking status
  const { error: updateError } = await adminClient
    .from(TABLES.BOOKINGS)
    .update({
      status: 'attended',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId)

  if (updateError) {
    console.error('[Check-In] Failed to update booking status:', updateError)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update booking status',
      },
    }, { status: 500 })
  }

  // Create attendance record
  const { data: attendance, error: attendanceError } = await adminClient
    .from(TABLES.ATTENDANCES)
    .insert({
      booking_id: bookingId,
      checked_in_at: new Date().toISOString(),
      checked_in_by: userId,
      check_in_method: method,
      notes: method === 'qr-code' 
        ? (qrToken ? `QR code check-in (token: ${qrToken.substring(0, 8)}...)` : 'QR code check-in')
        : 'Manual check-in',
    })
    .select()
    .single()

  if (attendanceError) {
    console.error('[Check-In] Failed to create attendance record:', attendanceError)
    // Don't fail - booking is already marked as attended
  }

  // Update user stats (non-blocking)
  try {
    const { data: userStats } = await adminClient
      .from('user_stats')
      .select('total_classes_attended')
      .eq('user_id', userId)
      .single()

    if (userStats) {
      await adminClient
        .from('user_stats')
        .update({
          total_classes_attended: (userStats.total_classes_attended || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
    } else {
      await adminClient
        .from('user_stats')
        .insert({
          user_id: userId,
          total_classes_attended: 1,
        })
    }
  } catch (statsError) {
    console.error('[Check-In] Failed to update user stats:', statsError)
    // Non-blocking - check-in was successful
  }

  return NextResponse.json({
    success: true,
    data: {
      attendance: {
        id: attendance?.id || 'pending',
        bookingId,
        checkedInAt: attendance?.checked_in_at || new Date().toISOString(),
        checkInMethod: method,
      },
      tokensRemaining: tokensAfter,
      tokensConsumed: tokensToConsume,
    },
    message: 'Successfully checked in',
  })
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = getSupabaseClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse and validate request body
    const body = await request.json()
    const parseResult = CheckInRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parseResult.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const { bookingId, classId, token, qrData } = parseResult.data

    // Use admin client for direct database operations (like packages do)
    const adminClient = getSupabaseAdminClient()

    // If QR code data is provided, handle QR check-in directly (no API hopping)
    if (qrData) {
      // 1. Validate QR token expiration (if provided)
      if (qrData.expiresAt && qrData.expiresAt < Date.now()) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'QR_EXPIRED',
            message: 'QR code has expired. Please scan the new code displayed on screen.',
          },
        }, { status: 400 })
      }

      // 2. Get the class to verify it exists
      const { data: classData, error: classError } = await adminClient
        .from(TABLES.CLASSES)
        .select('id, title, scheduled_at, duration_minutes, status, capacity, token_cost, instructor_id, allow_drop_in, drop_in_token_cost')
        .eq('id', qrData.classId)
        .single()

      if (classError || !classData) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'CLASS_NOT_FOUND',
            message: 'Class not found. The QR code may be invalid.',
          },
        }, { status: 404 })
      }

      // 3. Check if class is cancelled
      if (classData.status === 'cancelled') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'CLASS_CANCELLED',
            message: 'This class has been cancelled.',
          },
        }, { status: 400 })
      }

      // 4. Check check-in time window
      const classTime = new Date(classData.scheduled_at)
      const now = new Date()
      const minutesUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60)
      const classEndTime = new Date(classTime.getTime() + classData.duration_minutes * 60 * 1000)

      const canCheckIn = 
        (minutesUntilClass <= CHECK_IN_WINDOW_BEFORE_MINUTES && minutesUntilClass > -classData.duration_minutes)

      if (!canCheckIn) {
        if (minutesUntilClass > CHECK_IN_WINDOW_BEFORE_MINUTES) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'CHECK_IN_WINDOW_CLOSED',
              message: `Check-in opens ${CHECK_IN_WINDOW_BEFORE_MINUTES} minutes before class. Please come back later.`,
            },
          }, { status: 400 })
        } else {
          return NextResponse.json({
            success: false,
            error: {
              code: 'CHECK_IN_WINDOW_CLOSED',
              message: 'This class has already ended. Check-in is no longer available.',
            },
          }, { status: 400 })
        }
      }

      // 5. Get user profile
      const { data: userProfile, error: userError } = await adminClient
        .from('user_profiles')
        .select('id, name, email')
        .eq('id', userId)
        .single()

      if (userError || !userProfile) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User account not found. Please sign in again.',
          },
        }, { status: 404 })
      }

      // 6. Find user's booking for this class
      const { data: booking, error: bookingError } = await adminClient
        .from(TABLES.BOOKINGS)
        .select(`
          id,
          user_id,
          class_id,
          status,
          tokens_used,
          user_package_id,
          booked_at
        `)
        .eq('user_id', userId)
        .eq('class_id', qrData.classId)
        .in('status', ['confirmed', 'waitlist'])
        .single()

      // 7. Handle different scenarios
      
      // Scenario A: User has a confirmed booking
      if (booking && booking.status === 'confirmed') {
        // Check if already checked in
        const { data: existingAttendance } = await adminClient
          .from(TABLES.ATTENDANCES)
          .select('id')
          .eq('booking_id', booking.id)
          .single()

        if (existingAttendance) {
          return NextResponse.json({
            success: false,
            error: {
              code: 'ALREADY_CHECKED_IN',
              message: 'You have already checked in for this class.',
            },
          }, { status: 400 })
        }

        // Use the same check-in logic as regular check-in
        return await performCheckIn(adminClient, booking.id, userId, 'qr-code', qrData.token)
      }

      // Scenario B: User is on waitlist
      if (booking && booking.status === 'waitlist') {
        return NextResponse.json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'You are on the waitlist for this class. You cannot check in until a spot becomes available.',
            action: 'waitlist',
          },
        }, { status: 400 })
      }

      // Scenario C: No booking found - check if class allows walk-in
      const allowsDropIn = classData.allow_drop_in === true

      if (!allowsDropIn) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'BOOKING_NOT_FOUND',
            message: 'You are not registered for this class. Please book the class through the app first.',
            action: 'book',
            classId: qrData.classId,
            classTitle: classData.title,
          },
        }, { status: 400 })
      }

      // Scenario D: Walk-in attendance allowed - check capacity and create booking
      
      // Check class capacity
      const { count: currentBookings } = await adminClient
        .from(TABLES.BOOKINGS)
        .select('*', { count: 'exact', head: true })
        .eq('class_id', qrData.classId)
        .in('status', ['confirmed', 'attended'])

      if (currentBookings && currentBookings >= classData.capacity) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'CLASS_FULL',
            message: 'This class is full. No walk-in spots available.',
          },
        }, { status: 400 })
      }

      // Get user's active package with enough tokens
      const tokenCost = classData.drop_in_token_cost || classData.token_cost || 1
      
      const { data: userPackages, error: packageError } = await adminClient
        .from(TABLES.USER_PACKAGES)
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('tokens_remaining', 0)
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true })

      if (packageError || !userPackages || userPackages.length === 0) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INSUFFICIENT_TOKENS',
            message: 'You don\'t have any active tokens. Please purchase a token package first.',
            action: 'purchase',
          },
        }, { status: 400 })
      }

      // Find package with enough available tokens
      const availablePackage = userPackages.find(pkg => 
        (pkg.tokens_remaining - (pkg.tokens_held || 0)) >= tokenCost
      )

      if (!availablePackage) {
        return NextResponse.json({
          success: false,
          error: {
            code: 'INSUFFICIENT_TOKENS',
            message: `You need ${tokenCost} token(s) for this class but don't have enough available.`,
            action: 'purchase',
          },
        }, { status: 400 })
      }

      // Create walk-in booking
      const { data: newBooking, error: createBookingError } = await adminClient
        .from(TABLES.BOOKINGS)
        .insert({
          user_id: userId,
          class_id: qrData.classId,
          user_package_id: availablePackage.id,
          tokens_used: tokenCost,
          status: 'confirmed',
          booked_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createBookingError || !newBooking) {
        console.error('[QR Check-in] Failed to create walk-in booking:', createBookingError)
        return NextResponse.json({
          success: false,
          error: {
            code: 'BOOKING_ERROR',
            message: 'Failed to create walk-in booking. Please try again.',
          },
        }, { status: 500 })
      }

      // Hold tokens for the booking
      const { error: holdError } = await adminClient
        .from(TABLES.USER_PACKAGES)
        .update({
          tokens_held: (availablePackage.tokens_held || 0) + tokenCost,
          updated_at: new Date().toISOString(),
        })
        .eq('id', availablePackage.id)

      if (holdError) {
        console.error('[QR Check-in] Failed to hold tokens:', holdError)
        // Continue anyway - check-in will handle this
      }

      // Now check in the walk-in booking
      const checkInResult = await performCheckIn(adminClient, newBooking.id, userId, 'qr-code', qrData.token)
      
      if (checkInResult.status === 200) {
        const resultData = await checkInResult.json()
        return NextResponse.json({
          success: true,
          data: {
            ...resultData.data,
            wasWalkIn: true,
            message: `Walk-in check-in successful! ${resultData.data.tokensConsumed} token(s) consumed.`,
            classTitle: classData.title,
            userName: userProfile.name,
          },
        })
      }
      
      // If check-in fails, try to clean up the booking
      await adminClient
        .from(TABLES.BOOKINGS)
        .delete()
        .eq('id', newBooking.id)

      return checkInResult
    }

    // Otherwise, use regular check-in (requires bookingId) - DIRECT IMPLEMENTATION
    if (!bookingId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Either bookingId or qrData is required',
          },
        },
        { status: 400 }
      )
    }

    // Use the shared performCheckIn function
    return await performCheckIn(adminClient, bookingId, userId, token ? 'qr-code' : 'manual', token)
  } catch (error) {
    console.error('[Attendance Check-In] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    )
  }
}

