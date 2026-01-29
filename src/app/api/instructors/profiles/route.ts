/**
 * GET /api/instructors/profiles
 * Fetch instructor profiles for avatar display
 * Uses admin client to bypass RLS
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const instructorIds = searchParams.get('ids')?.split(',').filter(Boolean) || []
    const instructorNames = searchParams.get('names')?.split(',').filter(Boolean) || []

    if (instructorIds.length === 0 && instructorNames.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      })
    }

    const supabase = getSupabaseAdminClient()
    const profiles: Record<string, { id: string; name: string; avatar_url: string | null }> = {}

    // Fetch by IDs
    if (instructorIds.length > 0) {
      const { data: profilesById, error: errorById } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .in('id', instructorIds)

      if (errorById) {
        console.error('[API Instructors] Error fetching by IDs:', errorById)
      } else {
        profilesById?.forEach((profile: any) => {
          profiles[profile.id] = {
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
          }
        })
      }
    }

    // Fetch by names (case-insensitive)
    if (instructorNames.length > 0) {
      // Fetch all profiles and match client-side (since Supabase doesn't support case-insensitive IN)
      const { data: allProfiles, error: errorByName } = await supabase
        .from('user_profiles')
        .select('id, name, avatar_url')
        .limit(1000) // Reasonable limit

      if (errorByName) {
        console.error('[API Instructors] Error fetching by names:', errorByName)
      } else {
        allProfiles?.forEach((profile: any) => {
          const lowerProfileName = profile.name.toLowerCase().trim()
          const normalizedProfileName = lowerProfileName.replace(/_/g, ' ').replace(/\s+/g, ' ')
          
          instructorNames.forEach((instructorName: string) => {
            const lowerInstructorName = instructorName.toLowerCase().trim()
            const normalizedInstructorName = lowerInstructorName.replace(/_/g, ' ').replace(/\s+/g, ' ')
            
            const exactMatch = normalizedProfileName === normalizedInstructorName || lowerProfileName === lowerInstructorName
            const firstNameMatch = normalizedProfileName.startsWith(normalizedInstructorName + ' ') || normalizedInstructorName.startsWith(normalizedProfileName + ' ')
            
            if ((exactMatch || firstNameMatch) && !profiles[profile.id]) {
              profiles[profile.id] = {
                id: profile.id,
                name: profile.name,
                avatar_url: profile.avatar_url ?? null,
              }
            }
          })
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: Object.values(profiles),
    })
  } catch (error) {
    console.error('[API Instructors] Unexpected error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
