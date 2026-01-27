import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const EARLY_BIRD_LIMIT = 40 // From promo-utils.ts claimEarlySteppers function

export async function GET(request: NextRequest) {
  try {
    // Count current eligible users
    const { count, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('early_bird_eligible', true)

    if (error) {
      console.error('[Promos] Availability error:', error)
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }

    const currentCount = count || 0
    const remaining = Math.max(0, EARLY_BIRD_LIMIT - currentCount)
    const isAvailable = remaining > 0

    return NextResponse.json({
      success: true,
      data: {
        limit: EARLY_BIRD_LIMIT,
        current: currentCount,
        remaining,
        isAvailable,
        discountPercent: 10, // Early Steppers discount
        validMonths: 2 // Valid for 2 months
      }
    })
  } catch (err) {
    console.error('[Promos] Availability error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
