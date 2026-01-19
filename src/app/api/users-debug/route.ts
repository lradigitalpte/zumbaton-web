import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()
    
    // Get all users from user_profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id, name, email, created_at, early_bird_eligible, early_bird_expires_at')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (profilesError) {
      console.error('[Users Debug] Profiles error:', profilesError)
      return NextResponse.json({ error: 'Failed to get profiles', details: profilesError }, { status: 500 })
    }

    // Get all users from auth.users for comparison
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('[Users Debug] Auth users error:', authError)
      return NextResponse.json({ error: 'Failed to get auth users', details: authError }, { status: 500 })
    }

    // Find users in auth but not in profiles
    const profileIds = new Set(profiles?.map(p => p.id) || [])
    const missingProfiles = (authUsers as any).users?.filter((user: any) => !profileIds.has(user.id)) || []

    return NextResponse.json({
      profileCount: profiles?.length || 0,
      authUserCount: authUsers.users?.length || 0,
      profiles: profiles || [],
      missingProfiles: missingProfiles.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        name: user.user_metadata?.name || user.raw_user_meta_data?.name
      })),
      summary: {
        totalAuthUsers: authUsers.users?.length || 0,
        totalProfiles: profiles?.length || 0,
        missingProfilesCount: missingProfiles.length
      }
    })
  } catch (err) {
    console.error('[Users Debug] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err }, { status: 500 })
  }
}