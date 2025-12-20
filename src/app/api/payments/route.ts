/**
 * Payment API for Web App
 * POST /api/payments - Create HitPay payment request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// HitPay Configuration
const HITPAY_ENV = process.env.HITPAY_ENV || 'sandbox'
const HITPAY_API_URL =
  HITPAY_ENV === 'production'
    ? 'https://api.hit-pay.com/v1'
    : 'https://api.sandbox.hit-pay.com/v1'
const HITPAY_API_KEY = process.env.HITPAY_API_KEY

// App URL for redirects
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Initialize Supabase client for auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

/**
 * Get authenticated user from Authorization header
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  // Get the token from the header
  const token = authHeader.replace('Bearer ', '')

  // Verify the token by getting user data
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  // Get user profile for name using service role
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabaseAdmin
    .from('user_profiles')
    .select('name, email')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || profile?.email,
    name: profile?.name || 'Customer',
  }
}

/**
 * POST /api/payments - Create HitPay payment request
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check HitPay configuration
    if (!HITPAY_API_KEY) {
      console.error('[Payment] HITPAY_API_KEY not configured')
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 500 }
      )
    }

    // Get authenticated user from Authorization header
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please log in to purchase' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { packageId } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Package ID is required' },
        { status: 400 }
      )
    }

    // Get package details from Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: pkg, error: pkgError } = await supabase
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .eq('is_active', true)
      .single()

    if (pkgError || !pkg) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Package not found or inactive' },
        { status: 404 }
      )
    }

    // Create HitPay payment request
    const amount = (pkg.price_cents / 100).toFixed(2)
    const currency = pkg.currency || 'SGD'
    const referenceNumber = `${user.id}-${packageId}-${Date.now()}`

    const hitpayResponse = await fetch(`${HITPAY_API_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUSINESS-API-KEY': HITPAY_API_KEY,
      },
      body: JSON.stringify({
        amount,
        currency,
        email: user.email,
        name: user.name,
        purpose: `Purchase: ${pkg.name} (${pkg.token_count} tokens)`,
        reference_number: referenceNumber,
        redirect_url: `${APP_URL}/payment/success`,
        webhook: `${APP_URL}/api/payments/webhook`,
        send_email: true,
      }),
    })

    const hitpayData = await hitpayResponse.json()

    if (!hitpayResponse.ok) {
      console.error('[Payment] HitPay error:', hitpayData)
      return NextResponse.json(
        { error: 'Payment Error', message: hitpayData.message || 'Failed to create payment' },
        { status: 500 }
      )
    }

    // Save payment record to database
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        package_id: packageId,
        amount_cents: pkg.price_cents,
        currency: currency,
        status: 'pending',
        provider: 'hitpay',
        hitpay_payment_request_id: hitpayData.id,
        hitpay_payment_url: hitpayData.url,
        metadata: {
          package_name: pkg.name,
          token_count: pkg.token_count,
          reference_number: referenceNumber,
        },
      })

    if (insertError) {
      console.error('[Payment] Failed to save payment:', insertError)
      // Don't fail the request - payment was created in HitPay
    }

    console.log(`[Payment] Created payment request for user ${user.id}, package ${pkg.name}`)

    // Return the checkout URL
    return NextResponse.json({
      success: true,
      paymentUrl: hitpayData.url,
      paymentRequestId: hitpayData.id,
      amount: pkg.price_cents,
      currency: currency,
    })
  } catch (error) {
    console.error('[Payment] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
