/**
 * Resolve username to email for sign-in (e.g. child accounts that sign in with username).
 * GET /api/auth/email-by-username?username=xxx
 * Returns { email } when found, 404 when not found. No auth required (used on sign-in page).
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')?.trim()

    if (!username || username.length < 1 || username.length > 100) {
      return NextResponse.json(
        { error: 'Username is required and must be 1–100 characters' },
        { status: 400 }
      )
    }

    const normalized = username.toLowerCase()
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('username', normalized)
      .maybeSingle()

    if (error) {
      console.error('[email-by-username] DB error:', error)
      return NextResponse.json(
        { error: 'Unable to look up username' },
        { status: 500 }
      )
    }

    if (!data?.email) {
      return NextResponse.json(
        { error: 'Username not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ email: data.email })
  } catch (err) {
    console.error('[email-by-username] Error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
