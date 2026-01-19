/**
 * Profile API Route
 * GET and PUT operations for user profile
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
 * GET /api/profile - Get current user's profile
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

    // Get user profile
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('[API /profile GET] Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch profile',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || null,
        avatarUrl: profile.avatar_url || null,
        dateOfBirth: profile.date_of_birth || null,
        emergencyContactName: profile.emergency_contact_name || null,
        emergencyContactPhone: profile.emergency_contact_phone || null,
        bio: profile.bio || null,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        // Add early bird fields for promo system
        earlyBirdEligible: profile.early_bird_eligible || false,
        earlyBirdExpiresAt: profile.early_bird_expires_at || null,
        earlyBirdGrantedAt: profile.early_bird_granted_at || null,
      },
    })
  } catch (error) {
    console.error('[API /profile GET]', error)
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
 * PUT /api/profile - Update user profile
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
    const { 
      name,
      phone,
      avatarUrl,
      dateOfBirth,
      emergencyContactName,
      emergencyContactPhone,
      bio,
    } = body

    // Build update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl || null
    if (dateOfBirth !== undefined) updateData.date_of_birth = dateOfBirth || null
    if (emergencyContactName !== undefined) updateData.emergency_contact_name = emergencyContactName || null
    if (emergencyContactPhone !== undefined) updateData.emergency_contact_phone = emergencyContactPhone || null
    if (bio !== undefined) updateData.bio = bio || null

    // Update user profile
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[API /profile PUT] Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update profile',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        avatarUrl: data.avatar_url || null,
        dateOfBirth: data.date_of_birth || null,
        emergencyContactName: data.emergency_contact_name || null,
        emergencyContactPhone: data.emergency_contact_phone || null,
        bio: data.bio || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    })
  } catch (error) {
    console.error('[API /profile PUT]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}

