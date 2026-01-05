/**
 * Session API Route
 * GET /api/auth/session - Check and return current session/user info
 * Uses server-side Supabase client to avoid client-side query lag
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

// Initialize Supabase admin client for profile queries
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

/**
 * GET /api/auth/session - Get current session and user info
 * 
 * Accepts token via:
 * - Authorization header: Bearer <token>
 * - Or will check cookies if available
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    let token: string | null = null
    
    if (authHeader) {
      token = authHeader.replace('Bearer ', '')
    }

    // If no token in header, try to get from cookies (Supabase stores session in cookies)
    if (!token) {
      const cookies = request.cookies
      // Supabase stores access_token in cookies, but we need to verify via getUser
      // For now, require token in header for explicit session check
    }

    if (!token) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        data: null,
      })
    }

    // Verify token and get user
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        data: null,
        error: userError?.message || 'Invalid token',
      })
    }

    // Get user profile from database (non-blocking - return basic info if profile fetch fails)
    let profile = null
    try {
      const { data: profileData } = await supabaseAdmin
        .from('user_profiles')
        .select('id, email, name, role, created_at, updated_at')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        profile = profileData
      }
    } catch (profileError) {
      // Profile fetch failed - use auth metadata instead
      console.warn('[API Session] Profile fetch failed, using auth metadata:', profileError)
    }

    // Return user info
    const userResponse = {
      id: user.id,
      email: user.email || '',
      name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      role: profile?.role || (user.user_metadata?.role as 'user' | 'admin' | 'instructor' | 'super_admin') || 'user',
      createdAt: profile?.created_at || user.created_at,
      updatedAt: profile?.updated_at || user.updated_at || user.created_at,
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: userResponse,
    })
  } catch (error) {
    console.error('[API Session] Error:', error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      data: null,
      error: error instanceof Error ? error.message : 'Internal server error',
    }, { status: 500 })
  }
}

