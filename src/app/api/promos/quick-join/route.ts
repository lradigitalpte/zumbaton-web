/**
 * Quick Join (pay-first) API
 * POST /api/promos/quick-join
 *
 * The simplest possible conversion path for cold social traffic:
 * visitor enters name + phone + email, picks studio or outdoor, and pays.
 * No class, no date, no waiver. After payment the webhook notifies staff,
 * who contact the guest to schedule their session.
 *
 * The guest's details are saved as a lead (a pending payment row) BEFORE we
 * redirect to HitPay, so even abandoned checkouts are captured. Payment terms
 * (full / deposit / none) are admin-controlled via the promo config.
 *
 * The /start sales page uses this route 24/7 (no per-class 24-hour lead-time bypass).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { getDuoPromoConfig, isDuoPromoExpired, computeCharge, isOutdoorQuickJoinAvailable, isFastTrialStartAllowed } from '@/lib/duo-promo-config'

export const dynamic = 'force-dynamic'

const HITPAY_ENV = process.env.HITPAY_ENV || 'sandbox'
const HITPAY_API_URL =
  HITPAY_ENV === 'live' ? 'https://api.hit-pay.com/v1' : 'https://api.sandbox.hit-pay.com/v1'
const HITPAY_API_KEY = process.env.HITPAY_API_KEY
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const QuickJoinSchema = z.object({
  name: z.string().min(1, 'Please enter your name').max(200),
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() : v),
    z.string().email('Enter a valid email address').max(200)
  ),
  phone: z.string().min(1, 'Please enter your phone number').max(50),
  venue: z.enum(['studio', 'outdoor']).optional(),
  bookingFlow: z.enum(['duo', 'trial']).optional(),
  termsAgreed: z.literal(true, { errorMap: () => ({ message: 'Please agree to the terms and waiver to continue.' }) }),
  preferredNote: z.string().max(500).optional(),
})

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const parsed = QuickJoinSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: parsed.error.errors[0].message },
        { status: 400 }
      )
    }
    const { name, email, phone, preferredNote } = parsed.data
    const bookingFlow = parsed.data.bookingFlow ?? 'duo'
    const isFastTrial = bookingFlow === 'trial'
    const venue = isFastTrial ? 'studio' : (parsed.data.venue ?? 'studio')

    // Promo must be active (or fast trial allowed)
    const promoConfig = await getDuoPromoConfig()

    if (isFastTrial) {
      if (!isFastTrialStartAllowed(promoConfig)) {
        return NextResponse.json(
          { error: 'Unavailable', message: 'Fast trial booking is not available right now.' },
          { status: 400 }
        )
      }
    } else if (!promoConfig.active || isDuoPromoExpired(promoConfig)) {
      return NextResponse.json(
        { error: 'Promo Unavailable', message: 'This offer is not currently available.' },
        { status: 400 }
      )
    }

    if (!isFastTrial && venue === 'outdoor' && !(await isOutdoorQuickJoinAvailable(promoConfig))) {
      return NextResponse.json(
        {
          error: 'Outdoor Unavailable',
          message: 'Outdoor sessions are not available right now. Please book a studio session.',
        },
        { status: 400 }
      )
    }

    const totalCents = isFastTrial
      ? promoConfig.indoorPriceCents
      : venue === 'outdoor'
        ? promoConfig.outdoorPriceCents
        : promoConfig.indoorPriceCents
    const { chargeCents, balanceCents } = computeCharge(promoConfig, totalCents)
    const venueLabel = isFastTrial
      ? 'Fast trial (studio)'
      : venue === 'outdoor'
        ? 'Outdoor 1-for-1'
        : 'Studio 1-for-1'
    const referenceNumber = isFastTrial
      ? `TRIAL-FAST-${Date.now()}`
      : `JOIN-${venue}-${Date.now()}`
    const payOnline = promoConfig.paymentTerms !== 'none' && chargeCents > 0

    const leadMetadata = {
      flow_type: isFastTrial ? 'quick_trial' : 'quick_join',
      needs_scheduling: true,
      lead_status: 'new',
      venue,
      promo_label: venueLabel,
      payment_terms: promoConfig.paymentTerms,
      full_amount_cents: totalCents,
      charged_amount_cents: chargeCents,
      balance_cents: balanceCents,
      guest_name: name,
      guest_email: email,
      guest_phone: phone,
      preferred_note: preferredNote || '',
      reference_number: referenceNumber,
      terms_agreed: true,
      terms_agreed_at: new Date().toISOString(),
    }

    // ── No-payment mode: just capture the lead, no HitPay ──
    if (!payOnline) {
      const { error: leadError } = await supabaseAdmin.from('payments').insert({
        is_trial_booking: true,
        amount_cents: totalCents, // amount owed (collected at studio)
        currency: 'SGD',
        status: 'pending',
        provider: 'pay_at_studio',
        metadata: { ...leadMetadata, charged_amount_cents: 0, balance_cents: totalCents },
      })
      if (leadError) {
        console.error('[Quick Join] Error creating no-payment lead:', leadError)
        const constraintHit =
          typeof leadError.message === 'string' &&
          leadError.message.toLowerCase().includes('payments_user_or_trial_check')
        return NextResponse.json(
          {
            error: 'Server Error',
            message: constraintHit
              ? 'Pay-first is not enabled in the database yet. Run migration 20260622_quick_join_payments.sql, then try again.'
              : leadError.message || 'Failed to save your details',
          },
          { status: 500 }
        )
      }
      return NextResponse.json({
        success: true,
        reserved: true,
        message: "You're on the list. We'll message you to confirm your class and arrange payment.",
      })
    }

    // ── Online payment (full or deposit) ──
    if (!HITPAY_API_KEY) {
      console.error('[Quick Join] HITPAY_API_KEY not configured')
      return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 })
    }

    const { data: paymentRecord, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        is_trial_booking: true,
        amount_cents: chargeCents, // amount charged online now (full or deposit)
        currency: 'SGD',
        status: 'pending',
        provider: 'hitpay',
        metadata: leadMetadata,
      })
      .select()
      .single()

    if (paymentError || !paymentRecord) {
      console.error('[Quick Join] Error creating payment record:', paymentError)
      const constraintHit =
        typeof paymentError?.message === 'string' &&
        paymentError.message.toLowerCase().includes('payments_user_or_trial_check')
      return NextResponse.json(
        {
          error: 'Server Error',
          message: constraintHit
            ? 'Pay-first is not enabled in the database yet. Run migration 20260622_quick_join_payments.sql, then try again.'
            : paymentError?.message || 'Failed to start payment',
        },
        { status: 500 }
      )
    }

    const postPaymentPath = isFastTrial
      ? `/start/pick-class?payment_id=${paymentRecord.id}`
      : `/start/success?payment_id=${paymentRecord.id}`
    const redirectUrl = `${APP_URL}${postPaymentPath}`.replace(/([^:]\/)\/+/g, '$1')
    const webhookUrl = `${APP_URL}/api/payments/webhook`.replace(/([^:]\/)\/+/g, '$1')
    const isDeposit = promoConfig.paymentTerms === 'deposit'
    const purpose = isDeposit
      ? `Deposit — ${venueLabel} (balance $${(balanceCents / 100).toFixed(2)} at studio)`
      : isFastTrial
        ? 'Studio trial class'
        : venue === 'outdoor'
          ? 'Outdoor 1-for-1 class'
          : 'Studio 1-for-1 class'

    const hitpayResponse = await fetch(`${HITPAY_API_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUSINESS-API-KEY': HITPAY_API_KEY,
      },
      body: JSON.stringify({
        amount: (chargeCents / 100).toFixed(2),
        currency: 'SGD',
        email,
        name,
        purpose,
        reference_number: referenceNumber,
        redirect_url: redirectUrl,
        webhook: webhookUrl,
        send_email: true,
      }),
    })

    const hitpayData = await hitpayResponse.json()

    if (!hitpayResponse.ok) {
      console.error('[Quick Join] HitPay API error:', hitpayData)
      await supabaseAdmin.from('payments').update({ status: 'failed', failure_reason: 'HitPay API error' }).eq('id', paymentRecord.id)
      const hitpayWebhookError = hitpayData?.errors?.webhook?.[0] as string | undefined
      const isLocalhostWebhook =
        typeof hitpayWebhookError === 'string' && hitpayWebhookError.toLowerCase().includes('localhost')
      return NextResponse.json(
        {
          error: 'Payment Error',
          message: isLocalhostWebhook
            ? 'Payments cannot use localhost. Set NEXT_PUBLIC_APP_URL to your public site URL (or ngrok) in .env.local.'
            : hitpayData?.message || 'Failed to create payment request',
        },
        { status: 500 }
      )
    }

    await supabaseAdmin
      .from('payments')
      .update({
        hitpay_payment_request_id: hitpayData.id,
        hitpay_payment_url: hitpayData.url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentRecord.id)

    // Alert staff that checkout has started. This is not confirmation of payment;
    // the webhook sends a separate successful-payment alert after HitPay confirms it.
    try {
      const { sendPaymentAlertEmail } = await import('@/lib/email')
      await sendPaymentAlertEmail({
        paymentId: paymentRecord.id,
        paymentType: 'trial-booking',
        event: 'initiated',
        source: 'checkout-created',
        amount: chargeCents / 100,
        currency: 'SGD',
        guestName: name,
        guestEmail: email,
        className: isFastTrial ? 'Class not selected yet' : `${venueLabel} — staff scheduling required`,
      })
    } catch (alertError) {
      console.error('[Quick Join] Non-critical: failed to send initiated payment alert:', alertError)
    }

    return NextResponse.json({ success: true, paymentUrl: hitpayData.url, paymentId: paymentRecord.id })
  } catch (error) {
    console.error('[Quick Join] Unexpected error:', error)
    return NextResponse.json({ error: 'Server Error', message: 'An unexpected error occurred' }, { status: 500 })
  }
}
