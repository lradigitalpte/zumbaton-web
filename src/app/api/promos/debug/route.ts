import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { claimEarlySteppers, getPromoEligibility } from '@/lib/promo-utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, email, early_bird_eligible, early_bird_expires_at, early_bird_granted_at')
      .eq('id', userId)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'User not found', details: profileError })
    }

    // Check current eligibility
    const eligibility = await getPromoEligibility(userId)

    // Count current early bird users
    const { count } = await supabase
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('early_bird_eligible', true)

    return NextResponse.json({
      user: profile,
      eligibility,
      totalEarlyBirdUsers: count || 0,
    })
  } catch (err) {
    console.error('[API] /api/promos/debug error:', err)
    return NextResponse.json({ error: 'Internal error', details: err }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const userId = body?.userId
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    console.log('[Debug] Manually claiming Early Steppers for user:', userId)
    const result = await claimEarlySteppers(userId)
    
    // Re-check eligibility after claiming
    const eligibility = await getPromoEligibility(userId)
    
    return NextResponse.json({
      claimResult: result,
      newEligibility: eligibility,
    })
  } catch (err) {
    console.error('[API] /api/promos/debug POST error:', err)
    return NextResponse.json({ error: 'Internal error', details: err }, { status: 500 })
  }
}