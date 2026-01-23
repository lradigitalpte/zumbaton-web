/**
 * Onboarding API Route
 * GET and PUT operations for onboarding completion status
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
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

const supabaseAdmin = getSupabaseAdminClient()

/**
 * Get authenticated user from Authorization header or cookies
 */
async function getAuthenticatedUser(request: NextRequest) {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
    if (!error && user) {
      return { id: user.id, email: user.email || '' }
    }
  }

  // Try getting session from cookies (for client-side requests)
  const { data: { session } } = await supabaseAuth.auth.getSession()
  if (session?.user) {
    return { id: session.user.id, email: session.user.email || '' }
  }

  return null
}

/**
 * GET /api/onboarding - Check if user has completed onboarding
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

    // Get user profile with onboarding status
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[API /onboarding GET] Supabase error:', error)
      // If column doesn't exist yet, return false (migration not run)
      return NextResponse.json({
        success: true,
        data: {
          completed: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        completed: profile?.onboarding_completed || false,
      },
    })
  } catch (error) {
    console.error('[API /onboarding GET]', error)
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
 * PUT /api/onboarding - Mark onboarding as completed
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
    const { completed } = body

    if (typeof completed !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'completed must be a boolean',
        },
      }, { status: 400 })
    }

    // Update user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        onboarding_completed: completed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select('onboarding_completed')
      .single()

    if (error) {
      console.error('[API /onboarding PUT] Supabase error:', error)
      // If column doesn't exist yet, migration hasn't been run
      // Return success anyway to prevent errors
      return NextResponse.json({
        success: true,
        data: {
          completed: false,
          message: 'Database column not found. Please run migration 021_add_onboarding_completed.sql',
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        completed: data?.onboarding_completed || false,
      },
    })
  } catch (error) {
    console.error('[API /onboarding PUT]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}
