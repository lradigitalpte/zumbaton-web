/**
 * Trial Eligibility Check API
 * GET /api/trial-booking/check-eligibility?email=&phone=
 *
 * Checked from every guest checkout form as soon as the guest finishes
 * entering their email/phone, so someone who already completed a paid
 * trial gets redirected to sign up + buy tokens instead of paying for
 * a second trial.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.trim() || null
    const phone = searchParams.get('phone')?.trim() || null

    if (!email && !phone) {
      return NextResponse.json({ error: 'email or phone is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin.rpc('has_prior_paid_trial', {
      p_email: email,
      p_phone: phone,
    })

    if (error) {
      console.error('[TrialEligibility] RPC error:', error)
      // Fail open — never block a real booking because the check itself broke.
      return NextResponse.json({ eligible: true })
    }

    return NextResponse.json({ eligible: !data })
  } catch (error) {
    console.error('[TrialEligibility] Unexpected error:', error)
    return NextResponse.json({ eligible: true })
  }
}
