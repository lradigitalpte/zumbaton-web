/**
 * Privacy Settings API Route
 * GET and PUT operations for user privacy preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client for auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * Get authenticated user from Authorization header
 */
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return {
    id: user.id,
    email: user.email || '',
  }
}

/**
 * GET /api/settings/privacy - Get current user's privacy preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get privacy preferences from user_profiles
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('show_profile, show_stats')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[API /settings/privacy] Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch privacy preferences',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        showProfile: profile?.show_profile ?? true,
        showStats: profile?.show_stats ?? false,
      },
    })
  } catch (error) {
    console.error('[API /settings/privacy GET]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}

/**
 * PUT /api/settings/privacy - Update privacy preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { showProfile, showStats } = body

    // Build update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (showProfile !== undefined) updateData.show_profile = showProfile
    if (showStats !== undefined) updateData.show_stats = showStats

    // Update user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('show_profile, show_stats')
      .single()

    if (error) {
      console.error('[API /settings/privacy PUT] Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update privacy preferences',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        showProfile: data.show_profile,
        showStats: data.show_stats,
      },
    })
  } catch (error) {
    console.error('[API /settings/privacy PUT]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}

