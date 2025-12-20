/**
 * HitPay Webhook Handler for Web App
 * POST /api/payments/webhook - Handle HitPay payment confirmations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const HITPAY_SALT = process.env.HITPAY_SALT

/**
 * Verify HitPay webhook signature using HMAC-SHA256
 */
function verifyHitPayWebhook(
  payload: Record<string, string | null>,
  providedHmac: string
): boolean {
  if (!HITPAY_SALT) {
    console.error('[Webhook] HITPAY_SALT is not configured')
    return false
  }

  // Remove hmac from payload for verification
  const dataToSign = { ...payload }
  delete dataToSign.hmac

  // Sort keys alphabetically and concatenate values
  const sortedKeys = Object.keys(dataToSign).sort()
  const signatureSource = sortedKeys
    .map((key) => dataToSign[key] ?? '')
    .join('')

  // Generate HMAC-SHA256
  const calculatedHmac = crypto
    .createHmac('sha256', HITPAY_SALT)
    .update(signatureSource)
    .digest('hex')

  return calculatedHmac === providedHmac
}

/**
 * POST /api/payments/webhook - Handle HitPay webhook
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // HitPay sends data as form-urlencoded
    const formData = await request.formData()

    // Convert FormData to object
    const payload: Record<string, string | null> = {}
    formData.forEach((value, key) => {
      payload[key] = value?.toString() || null
    })

    console.log('[Webhook] Received:', {
      payment_id: payload.payment_id,
      payment_request_id: payload.payment_request_id,
      status: payload.status,
      amount: payload.amount,
    })

    // Verify HMAC signature
    const providedHmac = payload.hmac
    if (!providedHmac) {
      console.error('[Webhook] Missing HMAC signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const isValid = verifyHitPayWebhook(payload, providedHmac)
    if (!isValid) {
      console.error('[Webhook] Invalid HMAC signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Extract payment details
    const {
      payment_id,
      payment_request_id,
      status,
      amount,
    } = payload

    if (!payment_request_id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Connect to Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (status === 'completed') {
      // Get the payment record
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*, packages(*)')
        .eq('hitpay_payment_request_id', payment_request_id)
        .single()

      if (fetchError || !payment) {
        console.error('[Webhook] Payment not found:', payment_request_id)
        return NextResponse.json({ received: true })
      }

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          hitpay_payment_id: payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      // Create user package with tokens
      const pkg = payment.packages
      if (pkg) {
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + pkg.validity_days)

        // Create user_package
        const { data: userPackage, error: upError } = await supabase
          .from('user_packages')
          .insert({
            user_id: payment.user_id,
            package_id: payment.package_id,
            payment_id: payment.id,
            tokens_purchased: pkg.token_count,
            tokens_remaining: pkg.token_count,
            expires_at: expiresAt.toISOString(),
            status: 'active',
          })
          .select()
          .single()

        if (upError) {
          console.error('[Webhook] Failed to create user package:', upError)
        } else {
          console.log('[Webhook] Created user package:', userPackage?.id)

          // Create token transaction
          await supabase
            .from('token_transactions')
            .insert({
              user_id: payment.user_id,
              user_package_id: userPackage.id,
              type: 'purchase',
              amount: pkg.token_count,
              balance_after: pkg.token_count,
              description: `Purchased ${pkg.name}`,
              reference_type: 'payment',
              reference_id: payment.id,
            })

          // Update user stats
          await supabase.rpc('increment_user_stat', {
            p_user_id: payment.user_id,
            p_field: 'total_tokens_purchased',
            p_amount: pkg.token_count,
          })

          await supabase.rpc('increment_user_stat', {
            p_user_id: payment.user_id,
            p_field: 'total_spent_cents',
            p_amount: payment.amount_cents,
          })
        }
      }

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`
      await supabase
        .from('invoices')
        .insert({
          user_id: payment.user_id,
          payment_id: payment.id,
          invoice_number: invoiceNumber,
          amount_cents: payment.amount_cents,
          tax_cents: 0,
          total_cents: payment.amount_cents,
          currency: payment.currency,
          status: 'paid',
          issued_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        })

      // Send notification (in-app)
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          type: 'payment_successful',
          channel: 'in_app',
          subject: 'Payment Successful! 🎉',
          body: `Your purchase of ${pkg?.name || 'tokens'} was successful. ${pkg?.token_count || 0} tokens have been added to your account.`,
          status: 'sent',
          sent_at: new Date().toISOString(),
          data: {
            payment_id: payment.id,
            package_name: pkg?.name,
            token_count: pkg?.token_count,
            amount: payment.amount_cents / 100,
          },
        })

      console.log('[Webhook] Payment completed successfully:', payment.id)
    } else if (status === 'failed') {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: 'Payment failed',
          updated_at: new Date().toISOString(),
        })
        .eq('hitpay_payment_request_id', payment_request_id)

      console.log('[Webhook] Payment failed:', payment_request_id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ received: true })
  }
}

// Endpoint verification
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok', message: 'HitPay webhook active' })
}
