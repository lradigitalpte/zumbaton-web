/**
 * Password Change API Route
 * POST /api/settings/password - Change user password
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
 * POST /api/settings/password - Change user password
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required',
        },
      }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be at least 8 characters long',
        },
      }, { status: 400 })
    }

    // Verify current password by attempting to sign in
    // This creates a temporary session that we'll use for the password update
    const { error: signInError } = await supabaseAuth.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password is incorrect',
        },
      }, { status: 400 })
    }

    // Update password using the session created by sign-in
    const { error: updateError } = await supabaseAuth.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('[API /settings/password] Update error:', updateError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update password',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Password changed successfully',
      },
    })
  } catch (error) {
    console.error('[API /settings/password]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}

