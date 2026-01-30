/**
 * POST /api/promos/voucher/validate
 * Validate an admin-issued voucher code for the current user.
 * Returns { valid, discountPercent, voucherId } if valid and not yet used.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const code = typeof body.voucherCode === 'string' ? body.voucherCode.trim().toUpperCase() : ''
    if (!code) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Voucher code is required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: voucher, error } = await supabase
      .from('referral_vouchers')
      .select('id, discount_percent, used_at')
      .eq('user_id', user.id)
      .eq('voucher_code', code)
      .is('used_at', null)
      .maybeSingle()

    if (error) {
      console.error('[Voucher Validate]', error)
      return NextResponse.json(
        { success: false, valid: false, error: 'Failed to validate voucher' },
        { status: 500 }
      )
    }

    if (!voucher) {
      return NextResponse.json({
        success: true,
        valid: false,
        error: 'Invalid or already used voucher code',
      })
    }

    return NextResponse.json({
      success: true,
      valid: true,
      discountPercent: voucher.discount_percent,
      voucherId: voucher.id,
    })
  } catch (err) {
    console.error('[Voucher Validate]', err)
    return NextResponse.json(
      { success: false, valid: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
