import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, email, name } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient()

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (existingProfile) {
      return NextResponse.json({ success: true, message: 'Profile already exists', userId })
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: email || 'phoenixkinh@gmail.com',
        name: name || 'Emma Smith',
        role: 'user',
        early_bird_eligible: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error('[API] Profile creation error:', profileError)
      return NextResponse.json({ error: 'Failed to create profile', details: profileError }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile,
    })
  } catch (err) {
    console.error('[API] /api/create-profile error:', err)
    return NextResponse.json({ error: 'Internal error', details: err }, { status: 500 })
  }
}