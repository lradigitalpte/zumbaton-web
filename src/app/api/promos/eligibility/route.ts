import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { auth: { persistSession: false } }
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  try {
    // Try to get auth from header first (client-side)
    const authHeader = request.headers.get('authorization')
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
      if (error || !user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

      // Import server-side promo util
      const { getPromoEligibility } = await import('@/lib/promo-utils')
      const eligibility = await getPromoEligibility(user.id)

      return NextResponse.json({ success: true, data: eligibility })
    }

    // For server-side requests (from page.tsx), try to get user from cookies
    const cookieStore = request.cookies
    const authToken = cookieStore.get('sb-ejeihiyxuzlqamlgudnr-auth-token')
    
    if (!authToken) {
      return NextResponse.json({ success: false, error: 'No auth token' }, { status: 401 })
    }

    // Parse the auth token to get the user
    try {
      const tokenData = JSON.parse(authToken.value)
      if (!tokenData.access_token) {
        return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
      }

      const { data: { user }, error } = await supabaseAuth.auth.getUser(tokenData.access_token)
      if (error || !user) {
        return NextResponse.json({ success: false, error: 'Invalid user' }, { status: 401 })
      }

      // Import server-side promo util
      const { getPromoEligibility } = await import('@/lib/promo-utils')
      const eligibility = await getPromoEligibility(user.id)

      return NextResponse.json({ success: true, data: eligibility })
    } catch (parseError) {
      console.error('[Promos] Token parse error:', parseError)
      return NextResponse.json({ success: false, error: 'Token parse failed' }, { status: 401 })
    }

  } catch (err) {
    console.error('[Promos] Eligibility error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
