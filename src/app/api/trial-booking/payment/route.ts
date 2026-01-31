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

// Request schema
const TrialBookingPaymentSchema = z.object({
  classId: z.string().uuid('Invalid class ID'),
  guestName: z.string().min(1, 'Name is required').max(200),
  guestEmail: z.string().email('Invalid email address'), // Always required (from guest or guardian)
  guestPhone: z.string().min(1, 'Phone number is required').max(50), // Always required (from guest or guardian)
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine(
    (date) => {
      const dob = new Date(date)
      return !isNaN(dob.getTime()) && dob <= new Date()
    },
    { message: 'Invalid date of birth' }
  ),
  // Guardian fields (required for kids classes)
  guardianName: z.string().min(1, 'Guardian name is required').max(200).optional(),
  guardianEmail: z.string().email('Invalid guardian email address').optional(),
  guardianPhone: z.string().min(1, 'Guardian phone number is required').max(50).optional(),
  guardianOnPremises: z.boolean().optional(),
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

    const { classId, guestName, guestEmail, guestPhone, dateOfBirth, guardianName, guardianEmail, guardianPhone, guardianOnPremises } = validationResult.data

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

    // Validate age restrictions
    const { getUserType, isClassTypeCompatible } = await import('@/lib/user-age-utils')
    const userType = getUserType(dateOfBirth)
    const classAgeGroup = classData.age_group || 'all'

    if (!isClassTypeCompatible(classAgeGroup, userType)) {
      const userTypeLabel = userType === 'adult' ? 'adults' : 'children'
      const classTypeLabel = classAgeGroup === 'adult' ? 'adult' : classAgeGroup === 'kid' ? 'kids' : 'all'
      
      return NextResponse.json(
        { 
          error: 'Age Restriction', 
          message: `This class is for ${classTypeLabel} only. ${userTypeLabel === 'adults' ? 'Adults' : 'Children'} cannot book ${classTypeLabel} classes.` 
        },
        { status: 400 }
      )
    }

    // Validate guardian information for kids classes
    if (classAgeGroup === 'kid') {
      if (!guardianName || !guardianEmail || !guardianPhone) {
        return NextResponse.json(
          { 
            error: 'Guardian Information Required', 
            message: 'Guardian/parent information is required for kids classes' 
          },
          { status: 400 }
        )
      }
      if (guardianOnPremises !== true) {
        return NextResponse.json(
          { 
            error: 'Guardian Confirmation Required', 
            message: 'You must confirm that a parent/guardian will be on premises during the class' 
          },
          { status: 400 }
        )
      }
    }

    // Calculate price: use trial_price_cents from DB if set, otherwise fallback based on age group
    // Kids: $18 (1800 cents), Adults: $23 (2300 cents)
    const DEFAULT_TRIAL_CENTS = classAgeGroup === 'kid' ? 1800 : 2300
    const amountCents = classData.trial_price_cents && classData.trial_price_cents > 0
      ? classData.trial_price_cents
      : DEFAULT_TRIAL_CENTS

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
    if (bookedCount >= classData.capacity) {
      return NextResponse.json(
        { error: 'Class Full', message: 'This class is fully booked' },
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
    }

    // Add guardian information for kids classes
    if (classAgeGroup === 'kid' && guardianName && guardianEmail && guardianPhone) {
      bookingData.guardian_name = guardianName
      bookingData.guardian_email = guardianEmail
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
          class_title: classData.title,
          class_scheduled_at: classData.scheduled_at,
          draft_booking_id: draftBooking.id, // Link to draft booking
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

    // 4. Link draft booking to payment
    const { error: updateBookingError } = await supabaseAdmin
      .from('bookings')
      .update({ payment_id: paymentRecord.id })
      .eq('id', draftBooking.id)

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
        purpose: `Trial Class: ${classData.title}`,
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
