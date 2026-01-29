/**
 * Trial Booking Status API
 * GET /api/trial-booking/status - Get booking status by payment ID
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get payment and booking details
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, classes(*)')
      .eq('id', paymentId)
      .eq('is_trial_booking', true)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Get booking details
    const { data: booking } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('payment_id', paymentId)
      .single()

    const classData = payment.classes as any

    return NextResponse.json({
      success: true,
      data: {
        className: classData?.title || 'Unknown',
        classDate: classData?.scheduled_at
          ? new Date(classData.scheduled_at).toLocaleDateString('en-SG', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'TBA',
        classTime: classData?.scheduled_at
          ? new Date(classData.scheduled_at).toLocaleTimeString('en-SG', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'TBA',
        classLocation: classData?.location || 'TBA',
        instructorName: classData?.instructor_name || null,
        guestName: booking?.guest_name || payment.metadata?.guest_name || '',
        guestEmail: booking?.guest_email || payment.metadata?.guest_email || '',
        amount: payment.amount_cents / 100,
        currency: payment.currency,
        status: payment.status,
      },
    })
  } catch (error) {
    console.error('[Trial Booking Status] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
