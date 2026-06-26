/**
 * Duo Trial Reservation API (pay at studio)
 * POST /api/promos/duo-trial/reserve
 *
 * Same lead-capture as the HitPay duo flow, but instead of taking payment
 * online it holds the two spots (status = confirmed) and records a pending
 * "pay at studio" payment so the admin can collect on arrival. Only available
 * when the admin booking mode is `reserve_only` or `both`.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { resolveGuestEmail } from '@/lib/guest-email-placeholder'
import { getDuoPromoConfig, isDuoPromoExpired } from '@/lib/duo-promo-config'
import {
  BOOKING_WINDOW_CLOSED_MESSAGE,
  isBookingWindowOpen,
  logBookingWindowRejection,
} from '@/lib/booking-window'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const emailField = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z.string().email('Enter a valid email address').max(200)
)

const ParticipantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().min(1, 'Phone number is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  nricLast4: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim().toUpperCase()
      return trimmed === '' ? undefined : trimmed
    },
    z.string().length(4, 'NRIC last 4 must be exactly 4 characters').optional()
  ),
  signature: z.preprocess(
    (value) => {
      if (typeof value !== 'string') return value
      const trimmed = value.trim()
      return trimmed === '' ? undefined : trimmed
    },
    z.string().min(1, 'Signature is required').optional()
  ),
})

const DuoReserveSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  promoId: z.enum(['indoor-duo', 'outdoor-duo']),
  participant1: ParticipantSchema.extend({ email: emailField }),
  participant2: ParticipantSchema.extend({
    email: z.preprocess(
      (value) => {
        if (typeof value !== 'string') return value
        const trimmed = value.trim().toLowerCase()
        return trimmed === '' ? undefined : trimmed
      },
      z.string().email('Enter a valid email address').max(200).optional()
    ),
  }),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const validationResult = DuoReserveSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    if (!isBookingWindowOpen()) {
      logBookingWindowRejection('duo-trial reserve')
      return NextResponse.json(
        { error: 'Booking Closed', message: BOOKING_WINDOW_CLOSED_MESSAGE },
        { status: 400 }
      )
    }

    const { classId, promoId, participant1, participant2 } = validationResult.data

    // Booking mode gate
    const promoConfig = await getDuoPromoConfig()
    if (!promoConfig.active || isDuoPromoExpired(promoConfig)) {
      return NextResponse.json(
        { error: 'Promo Unavailable', message: 'This promo is not currently available.' },
        { status: 400 }
      )
    }
    if (promoConfig.bookingMode === 'pay_online') {
      return NextResponse.json(
        { error: 'Reservation Disabled', message: 'Reservations are turned off for this promo. Please pay online to confirm your spot.' },
        { status: 400 }
      )
    }

    const samePhone =
      participant1.phone.trim().replace(/\s+/g, '') === participant2.phone.trim().replace(/\s+/g, '')
    const participants = [
      { ...participant1, email: participant1.email.trim().toLowerCase() },
      { ...participant2, email: resolveGuestEmail(participant2.email, participant2.phone, samePhone ? 'p2' : undefined) },
    ]

    // Validate class + eligibility (mirror the paid duo flow)
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('id', classId)
      .eq('status', 'scheduled')
      .single()

    if (classError || !classData) {
      return NextResponse.json(
        { error: 'Class not found', message: 'The selected class is not available' },
        { status: 404 }
      )
    }

    const isOutdoor = classData.is_outdoor === true
    if (promoId === 'indoor-duo' && isOutdoor) {
      return NextResponse.json({ error: 'Invalid Class', message: 'This session is not eligible for the Studio Duo Trial. Please choose a studio class.' }, { status: 400 })
    }
    if (promoId === 'outdoor-duo' && !isOutdoor) {
      return NextResponse.json({ error: 'Invalid Class', message: 'This session is not eligible for the Outdoor Duo Trial. Please choose an outdoor class.' }, { status: 400 })
    }

    // Capacity (need 2 spots)
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('class_id', classId)
      .in('status', ['confirmed', 'attended'])

    if (bookingsError) {
      console.error('[Duo Reserve] Error checking bookings:', bookingsError)
      return NextResponse.json({ error: 'Server Error', message: 'Failed to check class availability' }, { status: 500 })
    }
    const bookedCount = existingBookings?.length || 0
    if (bookedCount + 1 >= classData.capacity) {
      return NextResponse.json({ error: 'Class Full', message: 'This class does not have enough spots for two people' }, { status: 400 })
    }

    const amountCents = promoId === 'indoor-duo' ? promoConfig.indoorPriceCents : promoConfig.outdoorPriceCents
    const referenceNumber = `DUO-RESERVE-${promoId}-${Date.now()}`

    // Create a pending "pay at studio" payment record so admin can reconcile
    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        class_id: classId,
        is_trial_booking: true,
        amount_cents: amountCents,
        currency: 'SGD',
        status: 'pending',
        provider: 'pay_at_studio',
        metadata: {
          flow_type: 'duo_trial_reserve',
          promo_id: promoId,
          reference_number: referenceNumber,
          guest_name: participants[0].name,
          guest_email: participants[0].email,
          guest_phone: participants[0].phone,
          participant1: participants[0],
          participant2: participants[1],
          class_title: classData.title,
          class_scheduled_at: classData.scheduled_at,
        },
      })
      .select()
      .single()

    if (paymentError || !paymentRecord) {
      console.error('[Duo Reserve] Error creating payment record:', paymentError)
      return NextResponse.json({ error: 'Server Error', message: 'Failed to create reservation record' }, { status: 500 })
    }

    // Hold the two spots: confirmed bookings flagged as awaiting payment at studio
    const bookingIds: string[] = []
    for (const p of participants) {
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          class_id: classId,
          guest_name: p.name,
          guest_email: p.email.toLowerCase(),
          guest_phone: p.phone,
          guest_date_of_birth: p.dateOfBirth,
          is_trial_booking: true,
          status: 'confirmed',
          tokens_used: 0,
          booked_at: new Date().toISOString(),
          payment_id: paymentRecord.id,
          cancellation_reason: `RESERVED — PAY AT STUDIO ($${(amountCents / 100).toFixed(2)} duo) | NRIC: ${p.nricLast4 || 'N/A'} | Sign: ${p.signature || 'N/A'} | Gender: ${p.gender}`,
        })
        .select('id')
        .single()

      if (bookingError || !booking) {
        console.error('[Duo Reserve] Error creating booking:', bookingError)
        return NextResponse.json({ error: 'Server Error', message: 'Failed to create reservation' }, { status: 500 })
      }
      bookingIds.push(booking.id)
    }

    return NextResponse.json({
      success: true,
      reserved: true,
      reference: referenceNumber,
      amount: (amountCents / 100).toFixed(2),
      bookingIds,
      message: 'Your spots are reserved. Please pay at the studio on arrival.',
    })
  } catch (error) {
    console.error('[Duo Reserve] Unexpected error:', error)
    return NextResponse.json({ error: 'Server Error', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
