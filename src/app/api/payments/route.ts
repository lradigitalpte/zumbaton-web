/**
 * Payment API for Web App
 * POST /api/payments - Create HitPay payment request
 */

import { NextRequest, NextResponse } from 'next/server'
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

// Initialize Supabase admin client directly (no auth client needed)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * Get authenticated user from Authorization header
 * Uses admin client directly to avoid hanging on token validation
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Get the authorization header
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  // Get the token from the header
  const token = authHeader.replace('Bearer ', '')

  try {
    // Use admin client to verify JWT directly - faster and more reliable
    const { data: { user }, error } = await Promise.race([
      supabaseAdmin.auth.getUser(token),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      )
    ])
    
    if (error || !user) {
      return null
    }

    // Get user profile for name and guardian_email (child accounts: use for payment receipts)
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('name, email, guardian_email')
      .eq('id', user.id)
      .single()

    const email = user.email || profile?.email
    const guardianEmail = profile?.guardian_email as string | null | undefined
    return {
      id: user.id,
      email,
      name: profile?.name || 'Customer',
      guardianEmail: guardianEmail && guardianEmail.trim() ? guardianEmail.trim().toLowerCase() : null,
    }
  } catch (err) {
    console.warn('[Payment] Auth check failed:', err)
    return null
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
    const { packageId, promoType: requestedPromoType, voucherCode: rawVoucherCode } = body

    if (!packageId) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Package ID is required' },
        { status: 400 }
      )
    }

    const voucherCode = typeof rawVoucherCode === 'string' ? rawVoucherCode.trim().toUpperCase() : null

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

    // Validate package type matches user type (adult/kid restriction)
    try {
      const { getUserType, isPackageTypeCompatible } = await import('@/lib/user-age-utils')
      
      // Get user profile to check date of birth
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('date_of_birth')
        .eq('id', user.id)
        .single()

      const userType = getUserType(userProfile?.date_of_birth)
      const packageType = pkg.package_type || 'adult'

      if (!isPackageTypeCompatible(packageType, userType)) {
        const userTypeLabel = userType === 'adult' ? 'adults' : 'children'
        const packageTypeLabel = packageType === 'adult' ? 'adult' : packageType === 'kid' ? 'kids' : 'all'
        
        return NextResponse.json(
          { 
            error: 'Invalid Package', 
            message: `This package is for ${packageTypeLabel} only. ${userTypeLabel === 'adults' ? 'Adults' : 'Children'} cannot purchase ${packageTypeLabel} packages.` 
          },
          { status: 400 }
        )
      }
    } catch (validationError) {
      console.error('[Payment] Error validating package type:', validationError)
      // Continue with purchase if validation fails (fail open for backwards compatibility)
    }

    // Check for voucher first (admin-issued); if valid, use it and skip referral/early_bird
    let finalAmountCents = pkg.price_cents
    let discountPercent = 0
    let discountAmountCents = 0
    let promoType: 'referral' | 'early_bird' | null = null
    let promoUsageId: string | null = null
    let referralVoucherId: string | null = null

    if (voucherCode) {
      const { data: voucher, error: voucherError } = await supabase
        .from('referral_vouchers')
        .select('id, discount_percent')
        .eq('user_id', user.id)
        .eq('voucher_code', voucherCode)
        .is('used_at', null)
        .maybeSingle()

      if (voucherError || !voucher) {
        return NextResponse.json(
          { error: 'Invalid Voucher', message: 'Voucher code is invalid or already used.' },
          { status: 400 }
        )
      }

      discountPercent = voucher.discount_percent
      discountAmountCents = Math.round((pkg.price_cents * discountPercent) / 100)
      finalAmountCents = pkg.price_cents - discountAmountCents
      referralVoucherId = voucher.id
      console.log('[Payment] Applied voucher discount:', { voucherCode, discountPercent, finalAmountCents })
    }

    // If no voucher, check referral/early_bird promotions
    if (!referralVoucherId) {
      try {
        const { getPromoEligibility, applyDiscount } = await import('@/lib/promo-utils')
        const eligibility = await getPromoEligibility(user.id)

        if (requestedPromoType && eligibility.maxDiscountPercent > 0) {
          let canApplyPromo = false
          if (requestedPromoType === 'early_bird' && eligibility.hasEarlyBirdDiscount) canApplyPromo = true
          else if (requestedPromoType === 'referral' && eligibility.hasReferralDiscount) canApplyPromo = true

          if (canApplyPromo) {
            const discount = await applyDiscount(user.id, pkg.price_cents, requestedPromoType)
            finalAmountCents = discount.finalAmountCents
            discountPercent = discount.discountPercent
            discountAmountCents = discount.discountAmountCents
            promoType = discount.promoType
            console.log(`[Payment] Applied ${requestedPromoType} discount:`, { discountPercent, finalAmountCents })
          }
        }
      } catch (promoError) {
        console.warn('[Payment] Failed to check promotions:', promoError)
      }
    }

    // Create HitPay payment request with discounted amount
    const amount = (finalAmountCents / 100).toFixed(2)
    const currency = pkg.currency || 'SGD'
    const referenceNumber = `${user.id}-${packageId}-${Date.now()}`
    // Use guardian email for child accounts so parent receives HitPay receipt (not the plus-addressed kid email)
    const emailForPayment = user.guardianEmail || user.email

    console.log('[Payment] Creating HitPay request:', {
      amount,
      currency,
      email: emailForPayment,
      apiKeyLength: HITPAY_API_KEY?.length,
      apiKeyPrefix: HITPAY_API_KEY?.substring(0, 10),
      url: `${HITPAY_API_URL}/payment-requests`,
    })

    const hitpayResponse = await fetch(`${HITPAY_API_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-BUSINESS-API-KEY': HITPAY_API_KEY,
      },
      body: JSON.stringify({
        amount,
        currency,
        email: emailForPayment,
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

    // Save payment record to database (with discount info and optional voucher)
    const insertPayload: Record<string, unknown> = {
      user_id: user.id,
      package_id: packageId,
      amount_cents: finalAmountCents,
      original_amount_cents: pkg.price_cents,
      discount_percent: discountPercent,
      discount_amount_cents: discountAmountCents,
      promo_type: promoType,
      currency: currency,
      status: 'pending',
      provider: 'hitpay',
      hitpay_payment_request_id: hitpayData.id,
      hitpay_payment_url: hitpayData.url,
      metadata: {
        package_name: pkg.name,
        token_count: pkg.token_count,
        reference_number: referenceNumber,
        discount_applied: discountPercent > 0,
        discount_percent: discountPercent,
      },
    }
    if (referralVoucherId) {
      insertPayload.referral_voucher_id = referralVoucherId
    }
    const { error: insertError } = await supabase
      .from('payments')
      .insert(insertPayload)

    if (insertError) {
      console.error('[Payment] Failed to save payment:', insertError)
      // Don't fail the request - payment was created in HitPay
    }

    console.log(`[Payment] Created payment request for user ${user.id}, package ${pkg.name}`)

    // Return the checkout URL with discount info
    return NextResponse.json({
      success: true,
      paymentUrl: hitpayData.url,
      paymentRequestId: hitpayData.id,
      amount: finalAmountCents,
      originalAmount: pkg.price_cents,
      discountPercent,
      discountAmount: discountAmountCents,
      promoType,
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
