import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      const cookies = request.headers.get('cookie')
      if (cookies) {
        // Try to extract session from cookies
        return NextResponse.json({ error: 'Please add Authorization header with your session token' })
      }
      return NextResponse.json({ error: 'No authorization found' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
    })
  } catch (err) {
    console.error('[API] /api/me error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}