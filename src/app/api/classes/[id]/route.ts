import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Class ID is required' },
        { status: 400 }
      )
    }

    const supabaseAdmin = getSupabaseAdminClient()

    const { data: classData, error: classError } = await supabaseAdmin
      .from('classes')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (classError) {
      console.error('[API] Error fetching class detail:', classError)
      return NextResponse.json(
        { success: false, error: classError.message },
        { status: 500 }
      )
    }

    if (!classData) {
      return NextResponse.json(
        { success: false, error: 'Class not found' },
        { status: 404 }
      )
    }

    const { count: bookedCount, error: bookingCountError } = await supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', id)
      .eq('status', 'confirmed')

    if (bookingCountError) {
      console.warn('[API] Error fetching booking count:', bookingCountError)
    }

    let instructorAvatar: string | null = null
    let instructorBio: string | null = null

    if (classData.instructor_id) {
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('avatar_url,bio')
        .eq('id', classData.instructor_id)
        .maybeSingle()

      if (profileError) {
        console.warn('[API] Error fetching instructor profile:', profileError)
      } else {
        instructorAvatar = profileData?.avatar_url ?? null
        instructorBio = profileData?.bio ?? null
      }
    }

    const responsePayload = {
      ...classData,
      booked_count: bookedCount || 0,
      instructor_avatar: instructorAvatar,
      instructor_bio: instructorBio,
    }

    return NextResponse.json(
      { success: true, data: responsePayload },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error) {
    console.error('[API] Unexpected error in class detail endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch class detail',
      },
      { status: 500 }
    )
  }
}
