/**
 * Trial Booking Waiver API
 * POST /api/trial-booking/waiver - Save the signed waiver (NRIC + signature) after payment.
 *
 * The pre-payment form only captures the waiver agreement. NRIC last 4 and the typed
 * signature are collected on the success page (after payment) and persisted here onto
 * the booking + payment records.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const WaiverSchema = z.object({
  paymentId: z.string().uuid('Invalid payment ID'),
  nricLast4: z.string().min(1, 'Last 4 of NRIC is required').max(4),
  signature: z.string().min(1, 'Signature is required').max(200),
  guardianSignature: z.string().max(200).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = WaiverSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      )
    }
    const { paymentId, nricLast4, signature, guardianSignature } = parsed.data

    // Look up the trial payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('id, metadata')
      .eq('id', paymentId)
      .eq('is_trial_booking', true)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      )
    }

    const metadata = (payment.metadata as Record<string, unknown>) || {}
    const gender = typeof metadata.gender === 'string' ? metadata.gender : 'prefer_not_to_say'
    const nricUpper = nricLast4.toUpperCase()

    // Persist onto the payment metadata
    await supabaseAdmin
      .from('payments')
      .update({
        metadata: {
          ...metadata,
          nric_last_4: nricUpper,
          signature,
          ...(guardianSignature ? { guardian_signature: guardianSignature } : {}),
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)

    // Persist onto the linked booking(s) so admins see the completed waiver
    const cancellationReason = `NRIC: ${nricUpper} | Sign: ${signature} | Gender: ${gender}${
      guardianSignature ? ` | Guardian Sign: ${guardianSignature}` : ''
    }`

    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .update({ cancellation_reason: cancellationReason })
      .eq('payment_id', paymentId)

    if (bookingError) {
      console.error('[Trial Booking Waiver] Failed to update booking:', bookingError)
      // Metadata was saved; surface a soft error but don't lose the signature.
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Trial Booking Waiver] Error:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    )
  }
}
