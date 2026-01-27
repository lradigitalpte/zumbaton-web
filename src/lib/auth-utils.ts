/**
 * Shared authentication utilities for web app API routes
 */

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export interface AuthenticatedUser {
  id: string
  email: string
}

/**
 * Get authenticated user from Authorization header
 * Also checks if user is active - deactivated users cannot access APIs
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  // Check if user is active - deactivated users cannot access APIs
  try {
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_active')
      .eq('id', user.id)
      .single()

    if (profile && profile.is_active === false) {
      console.warn('[Auth Utils] User account is deactivated:', user.email)
      return null // Return null to reject the request
    }
  } catch (profileError) {
    // If profile check fails, allow the request (fail open for backwards compatibility)
    console.warn('[Auth Utils] Failed to check user active status:', profileError)
  }

  return {
    id: user.id,
    email: user.email || '',
  }
}
