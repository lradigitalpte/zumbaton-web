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

    // Get admin API URL from environment (for QR check-in only)
    const adminApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    
    // If QR code data is provided, use QR check-in endpoint (still needs admin API)
    if (qrData) {
      const adminResponse = await fetch(`${adminApiUrl}/attendance/qr-check-in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrData,
          userId,
        }),
      })

      const adminData = await adminResponse.json()

      if (!adminResponse.ok) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: adminData.error?.code || 'QR_CHECK_IN_ERROR',
              message: adminData.error?.message || 'Failed to check in via QR code',
              details: adminData.error,
            },
          },
          { status: adminResponse.status }
        )
      }

      return NextResponse.json({
        success: true,
        data: adminData.data,
        message: adminData.data?.message || 'Successfully checked in via QR code',
      })
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

    // Use admin client for direct database operations
    const adminClient = getSupabaseAdminClient()

    // 1. Get booking with class info
    const { data: booking, error: fetchError } = await adminClient
      .from(TABLES.BOOKINGS)
      .select(`
        *,
        class:${TABLES.CLASSES}(*)
      `)
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND_ERROR',
            message: 'Booking not found',
          },
        },
        { status: 404 }
      )
    }

    // Verify the booking belongs to the authenticated user
    if (booking.user_id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only check in to your own bookings',
          },
        },
        { status: 403 }
      )
    }

    // Validate booking status
    if (booking.status !== 'confirmed') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Cannot check in booking with status: ${booking.status}`,
          },
        },
        { status: 400 }
      )
    }

    // 2. Validate check-in window
    const classData = Array.isArray(booking.class) ? booking.class[0] : booking.class
    if (!classData || !classData.scheduled_at) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Class information not found',
          },
        },
        { status: 400 }
      )
    }

    const classTime = new Date(classData.scheduled_at)
    const now = new Date()
    const minutesUntilClass = (classTime.getTime() - now.getTime()) / (1000 * 60)
    const minutesAfterStart = -minutesUntilClass

    const canCheckIn = 
      (minutesUntilClass <= CHECK_IN_WINDOW_BEFORE_MINUTES && minutesUntilClass > 0) ||
      (minutesAfterStart >= 0 && minutesAfterStart <= CHECK_IN_WINDOW_AFTER_MINUTES)

    if (!canCheckIn) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Check-in window is ${CHECK_IN_WINDOW_BEFORE_MINUTES} minutes before to ${CHECK_IN_WINDOW_AFTER_MINUTES} minutes after class start`,
          },
        },
        { status: 400 }
      )
    }

    // 3. Check if already checked in
    const { data: existingAttendance } = await adminClient
      .from(TABLES.ATTENDANCES)
      .select('id')
      .eq('booking_id', bookingId)
      .single()

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'You have already checked in for this class',
          },
        },
        { status: 400 }
      )
    }

    // 4. Consume tokens from the user package
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
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'NOT_FOUND_ERROR',
              message: 'Booking package not found',
            },
          },
          { status: 404 }
        )
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
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'SERVER_ERROR',
              message: 'Failed to consume tokens',
            },
          },
          { status: 500 }
        )
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
          description: `Checked in via ${token ? 'qr-code' : 'manual'}`,
          performed_by: userId,
        })
        .select()
        .single()

      if (transactionError) {
        console.error('[Check-In] Failed to create token transaction:', transactionError)
        // Don't fail - tokens were already consumed
      }
    } else {
      // No package ID - shouldn't happen but handle gracefully
      console.warn('[Check-In] Booking has no user_package_id')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Booking package not found',
          },
        },
        { status: 400 }
      )
    }

    // 5. Update booking status
    const { error: updateError } = await adminClient
      .from(TABLES.BOOKINGS)
      .update({
        status: 'attended',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) {
      console.error('[Check-In] Failed to update booking status:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: 'Failed to update booking status',
          },
        },
        { status: 500 }
      )
    }

    // 6. Create attendance record
    const { data: attendance, error: attendanceError } = await adminClient
      .from(TABLES.ATTENDANCES)
      .insert({
        booking_id: bookingId,
        checked_in_at: new Date().toISOString(),
        checked_in_by: userId,
        check_in_method: token ? 'qr-code' : 'manual',
        notes: token ? `QR code check-in (token: ${token.substring(0, 8)}...)` : 'Manual check-in',
      })
      .select()
      .single()

    if (attendanceError) {
      console.error('[Check-In] Failed to create attendance record:', attendanceError)
      // Don't fail - booking is already marked as attended
    }

    // 7. Update user stats (non-blocking)
    try {
      // Increment total classes attended
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
          checkInMethod: token ? 'qr-code' : 'manual',
        },
        tokensRemaining: tokensAfter,
        tokensConsumed: tokensToConsume,
      },
      message: 'Successfully checked in',
    })
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

