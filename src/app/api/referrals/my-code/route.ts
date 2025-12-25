import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/referrals/my-code
 * Get user's referral code for sharing
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user already has a referral code
    const { data: existing } = await supabase
      .from('referrals')
      .select('referral_code')
      .eq('referrer_id', user.id)
      .limit(1)
      .single()

    if (existing?.referral_code) {
      return NextResponse.json({
        code: existing.referral_code,
      })
    }

    // Generate new referral code
    const code = `ZUMB-${user.id.substring(0, 8).toUpperCase()}`

    // Create referral record (this will be used when someone uses the code)
    await supabase
      .from('referrals')
      .insert({
        referrer_id: user.id,
        referred_id: user.id, // Placeholder - will be updated when someone uses it
        referral_code: code,
        status: 'pending',
      })
      .select()
      .single()

    return NextResponse.json({
      code,
    })
  } catch (error) {
    console.error('[Referral] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

