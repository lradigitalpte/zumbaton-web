import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const CheckInRequestSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  classId: z.string().uuid('Invalid class ID').optional(),
  token: z.string().optional(), // QR code token for validation
})

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

    const { bookingId, classId, token } = parseResult.data

    // Get admin API URL from environment
    const adminApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    
    // Call admin API to mark attendance
    const adminResponse = await fetch(`${adminApiUrl}/attendance/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization if available (for admin API)
        ...(request.headers.get('authorization') && {
          'authorization': request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify({
        bookingId,
        method: 'qr-code',
        checkedInBy: userId,
        notes: token ? `QR code check-in (token: ${token.substring(0, 8)}...)` : 'QR code check-in',
      }),
    })

    const adminData = await adminResponse.json()

    if (!adminResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: adminData.error?.code || 'CHECK_IN_ERROR',
            message: adminData.error?.message || 'Failed to check in',
            details: adminData.error,
          },
        },
        { status: adminResponse.status }
      )
    }

    return NextResponse.json({
      success: true,
      data: adminData.data,
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
          details: error,
        },
      },
      { status: 500 }
    )
  }
}

