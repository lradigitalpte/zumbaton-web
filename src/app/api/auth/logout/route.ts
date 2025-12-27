import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

/**
 * POST /api/auth/logout
 * Endpoint to handle user logout
 * Clears the Supabase session server-side
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      // No auth header - user might already be logged out, which is fine
      return NextResponse.json({
        success: true,
        message: 'Logged out successfully',
      })
    }

    // Get the token from the header
    const token = authHeader.replace('Bearer ', '')

    // Initialize Supabase client
    const supabase = getSupabaseClient()

    // Sign out from Supabase
    // This will clear the session on the server side
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[API Logout] Sign out error:', error)
      // Don't fail - logout should succeed even if there's an error
      // The client will clear local state anyway
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('[API Logout] Unexpected error:', error)
    // Don't fail - logout should succeed even if there's an error
    // The client will clear local state anyway
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
  }
}

