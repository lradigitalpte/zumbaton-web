/**
 * Payment Status & Sync API
 * GET /api/payments/status?reference=<reference_number>
 *
 * Checks the current payment status. If still pending, polls HitPay API and
 * runs the full confirmation flow (creates user_package + tokens) so the
 * success page works even when the webhook is delayed or missed.
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
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'reference is required' }, { status: 400 })
    }

    // Find payment by reference_number stored in metadata
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, packages(*)')
      .contains('metadata', { reference_number: reference })
      .eq('is_trial_booking', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (paymentError || !payment) {
      console.error('[PaymentStatus] Payment not found for reference:', reference, paymentError?.message)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Already processed — return current state immediately
    if (payment.status === 'succeeded' || payment.status === 'completed') {
      return NextResponse.json({
        status: payment.status,
        alreadyProcessed: true,
        tokenCount: payment.packages?.token_count ?? null,
        packageName: payment.packages?.name ?? null,
      })
    }

    // Payment is still pending — try to sync with HitPay
    if (
      (payment.status === 'pending' || payment.status === 'in_progress') &&
      payment.hitpay_payment_request_id &&
      HITPAY_API_KEY
    ) {
      let hitpayStatus: string | null = null
      let hitpayPaymentId: string | null = null

      try {
        const hitpayRes = await fetch(
          `${HITPAY_API_URL}/payment-requests/${payment.hitpay_payment_request_id}`,
          { headers: { 'X-BUSINESS-API-KEY': HITPAY_API_KEY } }
        )
        const hitpayData = hitpayRes.ok ? await hitpayRes.json() : null
        hitpayStatus = hitpayData?.status?.toLowerCase() ?? null

        // HitPay may nest the actual payment id inside `payments` array
        if (hitpayData?.payments && hitpayData.payments.length > 0) {
          hitpayPaymentId = hitpayData.payments[0].id ?? null
        }

        console.log('[PaymentStatus] HitPay status for', payment.hitpay_payment_request_id, ':', hitpayStatus)
      } catch (pollErr) {
        console.error('[PaymentStatus] Failed to poll HitPay:', pollErr)
        return NextResponse.json({ status: payment.status, synced: false })
      }

      if (hitpayStatus === 'completed' || hitpayStatus === 'succeeded') {
        // Check idempotency: has a user_package already been created?
        const { data: existingPackage } = await supabaseAdmin
          .from('user_packages')
          .select('id')
          .eq('payment_id', payment.id)
          .maybeSingle()

        if (existingPackage) {
          // Tokens already issued — just mark payment succeeded if not already
          await supabaseAdmin
            .from('payments')
            .update({ status: 'succeeded', hitpay_payment_id: hitpayPaymentId, updated_at: new Date().toISOString() })
            .eq('id', payment.id)

          return NextResponse.json({
            status: 'succeeded',
            alreadyProcessed: true,
            tokenCount: payment.packages?.token_count ?? null,
            packageName: payment.packages?.name ?? null,
          })
        }

        // --- Run full confirmation flow ---

        // 1. Get package details
        let pkg = payment.packages
        if (!pkg && payment.package_id) {
          const { data: packageData } = await supabaseAdmin
            .from('packages')
            .select('*')
            .eq('id', payment.package_id)
            .single()
          pkg = packageData
        }

        if (!pkg) {
          console.error('[PaymentStatus] Package not found for payment:', payment.id)
          return NextResponse.json({ error: 'Package not found' }, { status: 500 })
        }

        // 2. Update payment status
        const { error: updateError } = await supabaseAdmin
          .from('payments')
          .update({
            status: 'succeeded',
            hitpay_payment_id: hitpayPaymentId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        if (updateError) {
          console.error('[PaymentStatus] Failed to update payment:', updateError)
          return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
        }

        // 3. Create user_package with tokens
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + pkg.validity_days)

        const { data: userPackage, error: upError } = await supabaseAdmin
          .from('user_packages')
          .insert({
            user_id: payment.user_id,
            package_id: payment.package_id,
            payment_id: payment.id.toString(),
            tokens_remaining: pkg.token_count,
            tokens_held: 0,
            expires_at: expiresAt.toISOString(),
            status: 'active',
          })
          .select()
          .single()

        if (upError) {
          console.error('[PaymentStatus] Failed to create user_package:', upError)
          return NextResponse.json({ error: 'Failed to issue tokens', details: upError.message }, { status: 500 })
        }

        console.log('[PaymentStatus] Created user_package via status sync:', userPackage.id)

        // 4. Record promo usage if a discount was applied
        if (payment.promo_type && payment.discount_percent && payment.discount_percent > 0) {
          const { error: promoError } = await supabaseAdmin
            .from('promo_usage')
            .insert({
              user_id: payment.user_id,
              promo_type: payment.promo_type,
              discount_percent: payment.discount_percent,
              discount_amount_cents: payment.discount_amount_cents || 0,
              package_id: payment.package_id,
              payment_id: payment.id,
            })

          if (promoError) {
            console.error('[PaymentStatus] Failed to record promo usage:', promoError)
          }

          if (payment.promo_type === 'referral') {
            const { data: referral } = await supabaseAdmin
              .from('referrals')
              .select('id')
              .eq('referred_id', payment.user_id)
              .in('status', ['pending', 'completed'])
              .single()

            if (referral) {
              await supabaseAdmin
                .from('referrals')
                .update({ status: 'used', discount_used_at: new Date().toISOString(), updated_at: new Date().toISOString() })
                .eq('id', referral.id)
            }
          }
        }

        // 5. Mark admin-issued voucher as used
        const voucherId = (payment as { referral_voucher_id?: string | null }).referral_voucher_id
        if (voucherId) {
          await supabaseAdmin
            .from('referral_vouchers')
            .update({ used_at: new Date().toISOString(), payment_id: payment.id })
            .eq('id', voucherId)
        }

        // 6. Token transaction log
        await supabaseAdmin.from('token_transactions').insert({
          user_id: payment.user_id,
          user_package_id: userPackage.id,
          transaction_type: 'purchase',
          tokens_change: pkg.token_count,
          tokens_before: 0,
          tokens_after: pkg.token_count,
          description: `Purchased ${pkg.name} (synced from HitPay)`,
        })

        // 7. Update user stats (non-blocking)
        try {
          await supabaseAdmin.rpc('increment_user_stat', { p_user_id: payment.user_id, p_field: 'total_tokens_purchased', p_amount: pkg.token_count })
          await supabaseAdmin.rpc('increment_user_stat', { p_user_id: payment.user_id, p_field: 'total_spent_cents', p_amount: payment.amount_cents })
        } catch (_) { /* non-critical */ }

        // 8. Create invoice
        await supabaseAdmin.from('invoices').insert({
          user_id: payment.user_id,
          payment_id: payment.id,
          invoice_number: `INV-${Date.now()}`,
          amount_cents: payment.amount_cents,
          tax_cents: 0,
          total_cents: payment.amount_cents,
          currency: payment.currency,
          status: 'paid',
          issued_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        })

        // 9. In-app notification
        await supabaseAdmin.from('notifications').insert({
          user_id: payment.user_id,
          type: 'payment_successful',
          channel: 'in_app',
          subject: 'Payment Successful!',
          body: `Your purchase of ${pkg.name} was successful. ${pkg.token_count} tokens have been added to your account.`,
          status: 'sent',
          sent_at: new Date().toISOString(),
          data: { payment_id: payment.id, package_name: pkg.name, token_count: pkg.token_count, amount: payment.amount_cents / 100 },
        })

        // 10. Send confirmation email (non-blocking)
        try {
          const { data: userProfile } = await supabaseAdmin
            .from('user_profiles')
            .select('email, name')
            .eq('id', payment.user_id)
            .single()

          if (userProfile?.email) {
            const { sendTokenPurchaseEmail } = await import('@/lib/email')
            await sendTokenPurchaseEmail({
              userEmail: userProfile.email,
              userName: userProfile.name || 'User',
              packageName: pkg.name,
              tokenCount: pkg.token_count,
              amount: payment.amount_cents / 100,
              currency: payment.currency,
              expiresAt: userPackage.expires_at,
            })
          }
        } catch (emailErr) {
          console.error('[PaymentStatus] Email send failed:', emailErr)
        }

        console.log('[PaymentStatus] Payment confirmed via HitPay poll for payment:', payment.id)

        return NextResponse.json({
          status: 'succeeded',
          synced: true,
          tokenCount: pkg.token_count,
          packageName: pkg.name,
        })
      }

      // HitPay still shows pending/not-completed
      return NextResponse.json({ status: payment.status, synced: false, hitpayStatus })
    }

    // Payment is failed or unknown state
    return NextResponse.json({ status: payment.status })
  } catch (error) {
    console.error('[PaymentStatus] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
