import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/referrals/process
 * Process referral code after user signup
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { userId, referralCode } = body

    if (!userId || !referralCode) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'userId and referralCode are required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Find referrer by referral code
    const { data: referral, error: refError } = await supabase
      .from('referrals')
      .select('referrer_id, referral_code')
      .eq('referral_code', referralCode.toUpperCase())
      .single()

    if (refError || !referral) {
      return NextResponse.json(
        { error: 'Invalid Referral Code', message: 'Referral code not found' },
        { status: 404 }
      )
    }

    // Check if user already has a referral record
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Already Referred', message: 'You have already used a referral code' },
        { status: 400 }
      )
    }

    // Create referral relationship
    const { data: newReferral, error: createError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referral.referrer_id,
        referred_id: userId,
        referral_code: referralCode.toUpperCase(),
        status: 'pending', // Will be 'completed' when referred user makes first purchase
      })
      .select()
      .single()

    if (createError || !newReferral) {
      console.error('[Referral] Failed to create referral:', createError)
      return NextResponse.json(
        { error: 'Server Error', message: 'Failed to process referral code' },
        { status: 500 }
      )
    }

    // Update user profile with referral code used
    await supabase
      .from('user_profiles')
      .update({ referral_code_used: referralCode.toUpperCase() })
      .eq('id', userId)

    return NextResponse.json({
      success: true,
      message: 'Referral code applied successfully. You will get 8% off your first package purchase!',
      referralId: newReferral.id,
    })
  } catch (error) {
    console.error('[Referral] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to process referral' },
      { status: 500 }
    )
  }
}

