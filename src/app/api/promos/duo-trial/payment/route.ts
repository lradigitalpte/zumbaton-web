/**
 * Duo Trial Booking Payment API
 * POST /api/promos/duo-trial/payment - Create HitPay payment for Duo Trial (1-for-1)
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { placeholderGuestEmailFromPhone } from '@/lib/guest-email-placeholder'

export const dynamic = 'force-dynamic'

// HitPay Configuration
const HITPAY_ENV = process.env.HITPAY_ENV || 'sandbox'
const HITPAY_API_URL =
  HITPAY_ENV === 'live'
    ? 'https://api.hit-pay.com/v1'
    : 'https://api.sandbox.hit-pay.com/v1'
const HITPAY_API_KEY = process.env.HITPAY_API_KEY

// App URL for redirects
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

// Participant schema
const ParticipantSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  phone: z.string().min(1, 'Phone number is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  nricLast4: z.string().length(4, 'NRIC last 4 characters required').optional(),
  signature: z.string().min(1, 'Signature is required').optional(),
})

// Request schema
const DuoTrialPaymentSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  promoId: z.enum(['indoor-duo', 'outdoor-duo']),
  participant1: ParticipantSchema,
  participant2: ParticipantSchema,
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check HitPay configuration
    if (!HITPAY_API_KEY) {
      console.error('[Duo Trial] HITPAY_API_KEY not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = DuoTrialPaymentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { classId, promoId, participant1, participant2 } = validationResult.data

    const samePhone =
      participant1.phone.trim().replace(/\s+/g, '') === participant2.phone.trim().replace(/\s+/g, '')
    const participant1WithEmail = {
      ...participant1,
      email: placeholderGuestEmailFromPhone(participant1.phone, samePhone ? 'p1' : undefined),
    }
    const participant2WithEmail = {
      ...participant2,
      email: placeholderGuestEmailFromPhone(participant2.phone, samePhone ? 'p2' : undefined),
    }

    // 1. Get class details and validate availability
    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*, rooms(room_type)')
      .eq('id', classId)
      .eq('status', 'scheduled')
      .single()

    if (classError || !classData) {
      return NextResponse.json(
        { error: 'Class not found', message: 'The selected class is not available' },
        { status: 404 }
      )
    }

    // Validate class type matches promo
    const roomType = (classData.rooms as any)?.room_type
    if (promoId === 'indoor-duo' && roomType !== 'studio') {
      return NextResponse.json({ error: 'Invalid Class', message: 'This class is not eligible for the Studio Duo Trial' }, { status: 400 })
    }
    if (promoId === 'outdoor-duo' && roomType !== 'outdoor') {
      return NextResponse.json({ error: 'Invalid Class', message: 'This class is not eligible for the Outdoor Duo Trial' }, { status: 400 })
    }

    // Check capacity (need 2 spots)
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('class_id', classId)
      .in('status', ['confirmed', 'attended'])

    if (bookingsError) {
      console.error('[Duo Trial] Error checking bookings:', bookingsError)
      return NextResponse.json({ error: 'Server Error', message: 'Failed to check class availability' }, { status: 500 })
    }

    const bookedCount = existingBookings?.length || 0
    if (bookedCount + 1 >= classData.capacity) {
      return NextResponse.json({ error: 'Class Full', message: 'This class does not have enough spots for two people' }, { status: 400 })
    }

    // 2. Create draft bookings (lead capture)
    const participants = [participant1WithEmail, participant2WithEmail]
    const draftBookingIds: string[] = []

    for (const p of participants) {
      const { data: draftBooking, error: draftBookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          class_id: classId,
          guest_name: p.name,
          guest_email: p.email.toLowerCase(),
          guest_phone: p.phone,
          guest_date_of_birth: p.dateOfBirth,
          is_trial_booking: true,
          status: 'draft',
          tokens_used: 0,
          booked_at: new Date().toISOString(),
          // Store waiver details in cancellation_reason for easy admin visibility
          cancellation_reason: `NRIC: ${p.nricLast4 || 'N/A'} | Sign: ${p.signature || 'N/A'} | Gender: ${p.gender}`,
        })
        .select('id')
        .single()

      if (draftBookingError || !draftBooking) {
        console.error('[Duo Trial] Error creating draft booking:', draftBookingError)
        return NextResponse.json({ error: 'Server Error', message: 'Failed to create booking records' }, { status: 500 })
      }
      draftBookingIds.push(draftBooking.id)
    }

    // 3. Create payment record
    const amountCents = promoId === 'indoor-duo' ? 2300 : 3500
    const amount = (amountCents / 100).toFixed(2)
    const currency = 'SGD'
    const referenceNumber = `DUO-${promoId}-${Date.now()}`

    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        class_id: classId,
        is_trial_booking: true,
        amount_cents: amountCents,
        currency,
        status: 'pending',
        provider: 'hitpay',
        metadata: {
          flow_type: 'duo_trial',
          promo_id: promoId,
          participant1: participant1WithEmail,
          participant2: participant2WithEmail,
          draft_booking_ids: draftBookingIds,
          class_title: classData.title,
          class_scheduled_at: classData.scheduled_at,
        },
      })
      .select()
      .single()

    if (paymentError || !paymentRecord) {
      console.error('[Duo Trial] Error creating payment record:', paymentError)
      return NextResponse.json({ error: 'Server Error', message: 'Failed to create payment record' }, { status: 500 })
    }

    // 4. Link bookings to payment
    await supabaseAdmin
      .from('bookings')
      .update({ payment_id: paymentRecord.id })
      .in('id', draftBookingIds)

    // 5. Create HitPay payment request
    const redirectUrl = `${APP_URL}/trial-booking/success?payment_id=${paymentRecord.id}`
    const webhookUrl = `${APP_URL}/api/payments/webhook`
    
    const hitpayResponse = await fetch(`${HITPAY_API_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUSINESS-API-KEY': HITPAY_API_KEY,
      },
      body: JSON.stringify({
        amount,
        currency,
        email: participant1WithEmail.email.toLowerCase(),
        name: participant1WithEmail.name,
        purpose: `Duo Trial (1-for-1): ${classData.title}`,
        reference_number: referenceNumber,
        redirect_url: redirectUrl.replace(/([^:]\/)\/+/g, '$1'),
        webhook: webhookUrl.replace(/([^:]\/)\/+/g, '$1'),
        send_email: true,
      }),
    })

    const hitpayData = await hitpayResponse.json()

    if (!hitpayResponse.ok) {
      console.error('[Duo Trial] HitPay API error:', hitpayData)
      await supabaseAdmin.from('payments').update({ status: 'failed', failure_reason: 'HitPay API error' }).eq('id', paymentRecord.id)
      return NextResponse.json({ error: 'Payment Error', message: 'Failed to create payment request' }, { status: 500 })
    }

    // Update payment record with HitPay details
    await supabaseAdmin
      .from('payments')
      .update({
        hitpay_payment_request_id: hitpayData.id,
        hitpay_payment_url: hitpayData.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id)

    return NextResponse.json({
      success: true,
      paymentUrl: hitpayData.url,
      paymentId: paymentRecord.id,
    })
  } catch (error) {
    console.error('[Duo Trial] Unexpected error:', error)
    return NextResponse.json({ error: 'Server Error', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
