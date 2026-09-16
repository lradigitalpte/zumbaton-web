/**
 * Trial Booking Payment API
 * POST /api/trial-booking/payment - Create HitPay payment for trial class booking
 *
 * Flow:
 * 1. User fills form → POST here
 * 2. Save guest info to DB as booking with status = 'draft'
 * 3. Create payment (HitPay) and redirect user to pay
 * 4. When user pays, HitPay webhook calls us → we update that draft booking to status = 'confirmed'
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { isPlaceholderGuestEmail } from '@/lib/guest-email-placeholder'
import { getTrialBookingEffectiveAgeGroup } from '@/lib/trial-booking-display'
import {
  BOOKING_WINDOW_CLOSED_MESSAGE,
  isBookingWindowOpen,
  logBookingWindowRejection,
} from '@/lib/booking-window'

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

const emailField = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z.string().email('Enter a valid email address').max(200)
)

// Optional free plus-one (adult classes only). Covered by the primary
// guest's waiver signature, so no waiver fields of their own — but does
// need a real email (their own confirmation) and counts as a 2nd spot.
const CompanionSchema = z.object({
  name: z.string().min(1, 'Companion name is required').max(200),
  phone: z.string().min(1, 'Companion phone number is required').max(50),
  email: emailField,
  dateOfBirth: z.string().min(1, 'Companion date of birth is required').refine(
    (date) => {
      const dob = new Date(date)
      return !isNaN(dob.getTime()) && dob <= new Date()
    },
    { message: 'Invalid companion date of birth' }
  ),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
})

// Request schema
const TrialBookingPaymentSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  guestName: z.string().min(1, 'Name is required').max(200),
  guestEmail: emailField.optional(),
  guestPhone: z.string().min(1, 'Phone number is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine(
    (date) => {
      const dob = new Date(date)
      return !isNaN(dob.getTime()) && dob <= new Date()
    },
    { message: 'Invalid date of birth' }
  ),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  // NRIC + signature are collected after payment on the success page, so they are
  // optional here. Pre-payment only requires the waiver agreement (enforced client-side).
  nricLast4: z.string().max(4).optional(),
  signature: z.string().optional(),
  // Guardian fields (required for kids classes)
  guardianName: z.string().min(1, 'Guardian name is required').max(200).optional(),
  guardianEmail: emailField.optional(),
  guardianPhone: z.string().min(1, 'Guardian phone number is required').max(50).optional(),
  guardianOnPremises: z.boolean().optional(),
  guardianSignature: z.string().min(1, 'Guardian signature is required').optional(),
  companion: CompanionSchema.optional(),
})

/**
 * POST /api/trial-booking/payment - Create HitPay payment request for trial booking
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check HitPay configuration
    if (!HITPAY_API_KEY) {
      console.error('[Trial Booking] HITPAY_API_KEY not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = TrialBookingPaymentSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const d = validationResult.data

    const {
      classId,
      guestName,
      guestPhone,
      dateOfBirth,
      gender,
      nricLast4,
      signature,
      guardianName,
      guardianPhone,
      guardianOnPremises,
      guardianSignature,
      companion,
    } = d

    // 1. Get class details and validate availability
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

    if (!isBookingWindowOpen(classData.scheduled_at)) {
      logBookingWindowRejection('trial-booking payment')
      return NextResponse.json(
        { error: 'Booking Closed', message: BOOKING_WINDOW_CLOSED_MESSAGE },
        { status: 400 }
      )
    }

    // Validate age restrictions
    const { getUserType, isClassTypeCompatible } = await import('@/lib/user-age-utils')
    const userType = getUserType(dateOfBirth)
    const rawAgeGroup = classData.age_group || 'all'
    const effectiveAgeGroup = getTrialBookingEffectiveAgeGroup(classData.title, classData.age_group)

    if (!isClassTypeCompatible(rawAgeGroup, userType)) {
      const userTypeLabel = userType === 'adult' ? 'adults' : 'children'
      const classTypeLabel = rawAgeGroup === 'adult' ? 'adult' : rawAgeGroup === 'kid' ? 'kids' : 'all'

      return NextResponse.json(
        {
          error: 'Age Restriction',
          message: `This class is for ${classTypeLabel} only. ${userTypeLabel === 'adults' ? 'Adults' : 'Children'} cannot book ${classTypeLabel} classes.`
        },
        { status: 400 }
      )
    }

    if (companion && effectiveAgeGroup === 'kid') {
      return NextResponse.json(
        { error: 'Not Available', message: 'Adding a companion is only available for adult classes' },
        { status: 400 }
      )
    }

    if (companion && companion.email.toLowerCase() === (d.guestEmail || '').toLowerCase()) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'Your companion needs their own email address' },
        { status: 400 }
      )
    }

    // Validate guardian information for kids sessions (includes One Familia + Lil Steppers)
    let guestEmail: string
    let guardianEmailResolved = ''

    if (effectiveAgeGroup === 'kid') {
      if (!guardianName || !guardianPhone) {
        return NextResponse.json(
          { 
            error: 'Guardian Information Required', 
            message: 'Guardian/parent name and phone are required for kids classes' 
          },
          { status: 400 }
        )
      }
      if (!d.guardianEmail || isPlaceholderGuestEmail(d.guardianEmail)) {
        return NextResponse.json(
          {
            error: 'Guardian Email Required',
            message: 'A valid guardian email is required — HitPay sends the payment receipt there',
          },
          { status: 400 }
        )
      }
      guardianEmailResolved = d.guardianEmail
      guestEmail = guardianEmailResolved
      if (guardianOnPremises !== true) {
        return NextResponse.json(
          { 
            error: 'Guardian Confirmation Required', 
            message: 'You must confirm that a parent/guardian will be on premises during the class' 
          },
          { status: 400 }
        )
      }
    } else {
      if (!d.guestEmail || isPlaceholderGuestEmail(d.guestEmail)) {
        return NextResponse.json(
          {
            error: 'Email Required',
            message: 'A valid email is required — HitPay sends the payment receipt there',
          },
          { status: 400 }
        )
      }
      guestEmail = d.guestEmail
    }

    // Calculate price: use trial_price_cents from DB if set, otherwise fallback based on age group
    // Kids: $18 (1800 cents), Adults: $23 (2300 cents). Treat kids DB value 1700 as legacy -> use 1800.
    const DEFAULT_TRIAL_CENTS = effectiveAgeGroup === 'kid' ? 1800 : 2300
    const fromDb = classData.trial_price_cents && classData.trial_price_cents > 0 ? classData.trial_price_cents : null
    const amountCents = effectiveAgeGroup === 'kid' && fromDb === 1700
      ? 1800
      : (fromDb ?? DEFAULT_TRIAL_CENTS)

    // Check capacity
    const { data: existingBookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('class_id', classId)
      .in('status', ['confirmed', 'attended'])

    if (bookingsError) {
      console.error('[Trial Booking] Error checking bookings:', bookingsError)
      return NextResponse.json(
        { error: 'Server Error', message: 'Failed to check class availability' },
        { status: 500 }
      )
    }

    const bookedCount = existingBookings?.length || 0
    const spotsNeeded = companion ? 2 : 1
    if (bookedCount + spotsNeeded > classData.capacity) {
      return NextResponse.json(
        {
          error: 'Class Full',
          message: companion
            ? 'This class does not have enough spots left for two people'
            : 'This class is fully booked',
        },
        { status: 400 }
      )
    }

    // Server-side enforcement — the client-side check on this page (on blur) can be
    // bypassed by calling this endpoint directly, and fails open on error.
    const { data: guestHasPriorTrial, error: guestEligibilityError } = await supabaseAdmin.rpc(
      'has_prior_paid_trial',
      { p_email: guestEmail, p_phone: guestPhone }
    )
    if (guestEligibilityError) {
      console.error('[Trial Booking] Guest eligibility RPC error:', guestEligibilityError)
      // Fail open — never block a real booking because the check itself broke.
    } else if (guestHasPriorTrial) {
      return NextResponse.json(
        {
          error: 'Already Trialed',
          message: 'This email/phone has already used a trial class. Please sign up to book a class.',
        },
        { status: 400 }
      )
    }

    // Check if guest already booked this class
    const { data: existingGuestBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('class_id', classId)
      .eq('guest_email', guestEmail)
      .in('status', ['confirmed', 'attended'])

    if (existingGuestBooking && existingGuestBooking.length > 0) {
      return NextResponse.json(
        { error: 'Already Booked', message: 'You have already booked this trial class' },
        { status: 400 }
      )
    }

    if (companion) {
      // Same abuse check the primary guest gets: don't let the free +1
      // slot become a way to dodge the one-trial-per-person rule.
      const { data: companionHasPriorTrial, error: companionEligibilityError } = await supabaseAdmin.rpc(
        'has_prior_paid_trial',
        { p_email: companion.email, p_phone: companion.phone }
      )
      if (companionEligibilityError) {
        console.error('[Trial Booking] Companion eligibility RPC error:', companionEligibilityError)
        // Fail open — never block a real booking because the check itself broke.
      } else if (companionHasPriorTrial) {
        return NextResponse.json(
          {
            error: 'Companion Already Trialed',
            message: 'Your companion has already used a trial class. They can sign up and purchase a package to join you.',
          },
          { status: 400 }
        )
      }

      const { data: companionExistingBooking } = await supabaseAdmin
        .from('bookings')
        .select('id')
        .eq('class_id', classId)
        .eq('guest_email', companion.email)
        .in('status', ['confirmed', 'attended'])

      if (companionExistingBooking && companionExistingBooking.length > 0) {
        return NextResponse.json(
          { error: 'Already Booked', message: 'Your companion has already booked this trial class' },
          { status: 400 }
        )
      }
    }

    // 2. Create draft booking first (lead capture)
    // Prepare booking data
    const bookingData: any = {
      class_id: classId,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone,
      guest_date_of_birth: dateOfBirth,
      is_trial_booking: true,
      status: 'draft', // Draft status for incomplete bookings
      tokens_used: 0,
      booked_at: new Date().toISOString(),
      // Store waiver details and gender in cancellation_reason for easy admin visibility.
      // NRIC/Signature are filled in after payment (success page) -> show as PENDING until then.
      cancellation_reason: `NRIC: ${nricLast4 || 'PENDING'} | Sign: ${signature || 'PENDING'} | Gender: ${gender}${guardianSignature ? ` | Guardian Sign: ${guardianSignature}` : ''}`,
    }

    // Add guardian information for kids sessions
    if (effectiveAgeGroup === 'kid' && guardianName && guardianPhone) {
      bookingData.guardian_name = guardianName
      bookingData.guardian_email = guardianEmailResolved
      bookingData.guardian_phone = guardianPhone
      bookingData.guardian_on_premises = guardianOnPremises === true
    }

    const { data: draftBooking, error: draftBookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single()

    if (draftBookingError || !draftBooking) {
      console.error('[Trial Booking] Error creating draft booking:', draftBookingError)
      return NextResponse.json(
        { 
          error: 'Server Error', 
          message: draftBookingError?.message || 'Failed to create booking record',
          details: draftBookingError?.details || draftBookingError?.hint
        },
        { status: 500 }
      )
    }

    console.log('[Trial Booking] Created draft booking:', draftBooking.id)

    // 2.5. Companion is a real second booking row (free, no waiver of their
    // own) so it counts toward class capacity like any other confirmed spot.
    let companionDraftBooking: { id: string } | null = null
    if (companion) {
      const { data: companionBooking, error: companionBookingError } = await supabaseAdmin
        .from('bookings')
        .insert({
          class_id: classId,
          guest_name: companion.name,
          guest_email: companion.email,
          guest_phone: companion.phone,
          guest_date_of_birth: companion.dateOfBirth,
          is_trial_booking: true,
          status: 'draft',
          tokens_used: 0,
          booked_at: new Date().toISOString(),
          // Tagged "DUO COMPANION" so the admin trial-bookings list hides this
          // row (same convention the list already uses) — the pair is shown
          // together as one row via payment.metadata.participant2 instead.
          cancellation_reason: `DUO COMPANION — Free companion of ${guestName} | Gender: ${companion.gender}`,
        })
        .select('id')
        .single()

      if (companionBookingError || !companionBooking) {
        console.error('[Trial Booking] Error creating companion draft booking:', companionBookingError)
        return NextResponse.json(
          { error: 'Server Error', message: 'Failed to create companion booking record' },
          { status: 500 }
        )
      }
      companionDraftBooking = companionBooking
      console.log('[Trial Booking] Created companion draft booking:', companionBooking.id)
    }

    // 3. Create payment record (linked to draft booking)
    const amount = (amountCents / 100).toFixed(2)
    const currency = 'SGD'
    const referenceNumber = `TRIAL-${classId}-${Date.now()}`

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
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          guest_date_of_birth: dateOfBirth,
          gender: gender,
          nric_last_4: nricLast4,
          signature: signature,
          guardian_name: guardianName,
          guardian_signature: guardianSignature,
          class_title: classData.title,
          class_scheduled_at: classData.scheduled_at,
          draft_booking_id: draftBooking.id, // Link to draft booking
          // The webhook and status-sync fallback both already know how to
          // confirm every id in draft_booking_ids (built for the duo-trial
          // promo), so listing the companion here is all that's needed to
          // get both rows confirmed together when payment succeeds.
          //
          // `participant2` uses the same shape the admin's own "Add 2nd
          // Guest" tool already writes, so the admin trial-bookings list
          // picks this up for free and shows one row with the companion
          // attached, instead of two separate rows (the companion's own
          // booking row is hidden from that list via the "DUO COMPANION"
          // tag on its cancellation_reason, same convention already used
          // there).
          ...(companionDraftBooking
            ? {
                draft_booking_ids: [draftBooking.id, companionDraftBooking.id],
                has_companion: true,
                participant2: {
                  name: companion!.name,
                  phone: companion!.phone,
                  email: companion!.email,
                  dateOfBirth: companion!.dateOfBirth,
                  gender: companion!.gender,
                },
              }
            : {}),
        },
      })
      .select()
      .single()

    if (paymentError || !paymentRecord) {
      // If payment creation fails, we still have the draft booking (lead captured)
      console.error('[Trial Booking] Error creating payment record (draft booking exists):', paymentError)
      console.error('[Trial Booking] Error creating payment record:', {
        error: paymentError,
        errorCode: paymentError?.code,
        errorMessage: paymentError?.message,
        errorDetails: paymentError?.details,
        errorHint: paymentError?.hint,
        insertData: {
          class_id: classId,
          is_trial_booking: true,
          amount_cents: amountCents,
          currency,
          status: 'pending',
          provider: 'hitpay',
        }
      })
      // Update draft booking to note payment creation failed
      await supabaseAdmin
        .from('bookings')
        .update({ 
          cancellation_reason: `Payment creation failed: ${paymentError?.message || 'Unknown error'}` 
        })
        .eq('id', draftBooking.id)

      return NextResponse.json(
        { 
          error: 'Server Error', 
          message: paymentError?.message || 'Failed to create payment record',
          details: paymentError?.details || paymentError?.hint || 'Please ensure the database migration has been run to make user_id nullable in payments table',
          note: 'Your details have been saved. Please contact us if you need assistance.'
        },
        { status: 500 }
      )
    }

    // 4. Link draft booking(s) to payment
    const draftBookingIds = companionDraftBooking ? [draftBooking.id, companionDraftBooking.id] : [draftBooking.id]
    const { error: updateBookingError } = await supabaseAdmin
      .from('bookings')
      .update({ payment_id: paymentRecord.id })
      .in('id', draftBookingIds)

    if (updateBookingError) {
      console.error('[Trial Booking] Error linking booking to payment:', updateBookingError)
      // Continue anyway - payment URL is still valid
    }

    // 5. Create HitPay payment request
    console.log('[Trial Booking] Creating HitPay request:', {
      amount,
      currency,
      email: guestEmail,
      referenceNumber,
    })

    // Ensure redirect_url and webhook are absolute URLs
    const redirectUrl = `${APP_URL}/trial-booking/success?payment_id=${paymentRecord.id}`
    const webhookUrl = `${APP_URL}/api/payments/webhook`
    
    // Ensure URLs are properly formatted (no trailing slashes except for root)
    const cleanRedirectUrl = redirectUrl.replace(/([^:]\/)\/+/g, '$1')
    const cleanWebhookUrl = webhookUrl.replace(/([^:]\/)\/+/g, '$1')

    const hitpayResponse = await fetch(`${HITPAY_API_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUSINESS-API-KEY': HITPAY_API_KEY,
      },
      body: JSON.stringify({
        amount: parseFloat(amount).toFixed(2), // Ensure proper decimal format
        currency: currency.toUpperCase(), // Ensure uppercase currency code
        email: guestEmail.trim(),
        name: guestName.trim(),
        purpose: `Trial Class: ${classData.title}${companion ? ' (+1 companion)' : ''}`,
        reference_number: referenceNumber,
        redirect_url: cleanRedirectUrl,
        webhook: cleanWebhookUrl,
        send_email: true,
      }),
    })

    let hitpayData
    try {
      hitpayData = await hitpayResponse.json()
    } catch (parseError) {
      const responseText = await hitpayResponse.text()
      console.error('[Trial Booking] HitPay response parse error:', {
        status: hitpayResponse.status,
        statusText: hitpayResponse.statusText,
        responseText,
        parseError,
      })
      
      // Update payment record to failed
      await supabaseAdmin
        .from('payments')
        .update({ status: 'failed', failure_reason: `HitPay API error: ${hitpayResponse.statusText}` })
        .eq('id', paymentRecord.id)

      void Promise.resolve().then(async () => {
        const { sendPaymentAlertEmail } = await import('@/lib/email')
        await sendPaymentAlertEmail({
          paymentId: paymentRecord.id,
          event: 'failed',
          paymentType: 'trial-booking',
          source: 'checkout-created',
          amount: paymentRecord.amount_cents / 100,
          currency: paymentRecord.currency,
          guestName,
          guestEmail,
          guestPhone,
          className: classData.title,
          failureReason: `HitPay API error: ${hitpayResponse.statusText}`,
        })
      }).catch((alertErr: unknown) => {
        console.error('[Trial Booking] Non-critical: failed to send failed payment alert:', alertErr)
      })

      return NextResponse.json(
        { 
          error: 'Payment Error', 
          message: `Failed to create payment: ${hitpayResponse.statusText}`,
          details: responseText.substring(0, 200) // First 200 chars of response
        },
        { status: 500 }
      )
    }

    if (!hitpayResponse.ok) {
      console.error('[Trial Booking] HitPay API error:', {
        status: hitpayResponse.status,
        statusText: hitpayResponse.statusText,
        data: hitpayData,
      })
      
      // Update payment record to failed
      await supabaseAdmin
        .from('payments')
        .update({ 
          status: 'failed', 
          failure_reason: hitpayData.message || hitpayData.error || `HitPay API error: ${hitpayResponse.statusText}` 
        })
        .eq('id', paymentRecord.id)

      void Promise.resolve().then(async () => {
        const { sendPaymentAlertEmail } = await import('@/lib/email')
        await sendPaymentAlertEmail({
          paymentId: paymentRecord.id,
          event: 'failed',
          paymentType: 'trial-booking',
          source: 'checkout-created',
          amount: paymentRecord.amount_cents / 100,
          currency: paymentRecord.currency,
          guestName,
          guestEmail,
          guestPhone,
          className: classData.title,
          failureReason: (hitpayData.message || hitpayData.error || `HitPay API error: ${hitpayResponse.statusText}`) as string,
        })
      }).catch((alertErr: unknown) => {
        console.error('[Trial Booking] Non-critical: failed to send failed payment alert:', alertErr)
      })

      return NextResponse.json(
        { 
          error: 'Payment Error', 
          message: hitpayData.message || hitpayData.error || 'Failed to create payment',
          details: hitpayData.details || hitpayData.errors || null
        },
        { status: 500 }
      )
    }

    // 4. Update payment record with HitPay details
    const { error: updateError } = await supabaseAdmin
      .from('payments')
      .update({
        hitpay_payment_request_id: hitpayData.id,
        hitpay_payment_url: hitpayData.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id)

    if (updateError) {
      console.error('[Trial Booking] Error updating payment:', updateError)
      // Continue anyway - payment URL is still valid
    }

    void Promise.resolve().then(async () => {
      const { sendPaymentAlertEmail } = await import('@/lib/email')
      await sendPaymentAlertEmail({
        paymentId: paymentRecord.id,
        event: 'initiated',
        paymentType: 'trial-booking',
        source: 'checkout-created',
        amount: paymentRecord.amount_cents / 100,
        currency: paymentRecord.currency,
        guestName,
        guestEmail,
        guestPhone,
        className: classData.title,
      })
    }).catch((alertErr: unknown) => {
      console.error('[Trial Booking] Non-critical: failed to send initiated payment alert:', alertErr)
    })

    // 5. Return payment URL
    return NextResponse.json({
      success: true,
      paymentUrl: hitpayData.url,
      paymentId: paymentRecord.id,
      draftBookingId: draftBooking.id,
      message: 'Your booking details have been saved. You will be redirected to complete payment.',
    })
  } catch (error) {
    console.error('[Trial Booking] Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}
