/**
 * Trial Booking Status API
 * GET /api/trial-booking/status - Get booking status by payment ID
 *
 * If payment is still pending, syncs with HitPay (GET payment-requests/{id})
 * and updates our DB when payment completed — so the success page can confirm
 * the booking even if the webhook didn't run.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const HITPAY_ENV = process.env.HITPAY_ENV || 'sandbox'
const HITPAY_API_URL =
  HITPAY_ENV === 'live'
    ? 'https://api.hit-pay.com/v1'
    : 'https://api.sandbox.hit-pay.com/v1'
const HITPAY_API_KEY = process.env.HITPAY_API_KEY

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
    let { data: payment, error: paymentError } = await supabaseAdmin
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

    // If payment is still pending, sync with HitPay (fallback when webhook didn't run)
    if (
      (payment.status === 'pending' || payment.status === 'in_progress') &&
      payment.hitpay_payment_request_id &&
      HITPAY_API_KEY
    ) {
      try {
        const hitpayRes = await fetch(
          `${HITPAY_API_URL}/payment-requests/${payment.hitpay_payment_request_id}`,
          {
            headers: { 'X-BUSINESS-API-KEY': HITPAY_API_KEY },
          }
        )
        const hitpayData = hitpayRes.ok ? await hitpayRes.json() : null
        const hitpayStatus = hitpayData?.status?.toLowerCase()

        if (hitpayStatus === 'completed' || hitpayStatus === 'succeeded') {
          // Update payment to succeeded
          await supabaseAdmin
            .from('payments')
            .update({
              status: 'succeeded',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.id)

          // Find and confirm draft booking (by payment_id or metadata.draft_booking_id)
          const metadata = (payment.metadata as Record<string, unknown>) || {}
          let draftId = metadata.draft_booking_id as string | undefined
          if (!draftId) {
            const { data: byPayment } = await supabaseAdmin
              .from('bookings')
              .select('id')
              .eq('payment_id', payment.id)
              .eq('status', 'draft')
              .eq('is_trial_booking', true)
              .maybeSingle()
            draftId = byPayment?.id
          }
          if (draftId) {
            await supabaseAdmin
              .from('bookings')
              .update({
                status: 'confirmed',
                payment_id: payment.id,
                booked_at: new Date().toISOString(),
              })
              .eq('id', draftId)
          }

          // Re-fetch payment so response has updated status
          const { data: updated } = await supabaseAdmin
            .from('payments')
            .select('*, classes(*)')
            .eq('id', paymentId)
            .single()
          if (updated) payment = updated
        }
      } catch (syncErr) {
        console.error('[Trial Booking Status] HitPay sync error:', syncErr)
        // Continue and return current status
      }
    }

    // Get booking details (may have been updated by sync above)
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
              timeZone: 'Asia/Singapore',
            })
          : 'TBA',
        classTime: classData?.scheduled_at
          ? new Date(classData.scheduled_at).toLocaleTimeString('en-SG', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
              timeZone: 'Asia/Singapore',
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
