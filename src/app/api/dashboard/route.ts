import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient, TABLES } from '@/lib/supabase'

/**
 * GET /api/dashboard
 * Endpoint to fetch dashboard data (token balance, upcoming bookings, user stats)
 * Uses admin client for faster queries (bypasses RLS)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required' 
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

    // 1. Get token balance (from user_packages)
    const now = new Date().toISOString()
    const { data: userPackages, error: packagesError } = await supabase
      .from('user_packages')
      .select('tokens_remaining, tokens_held, status, expires_at')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', now) // Only non-expired packages

    if (packagesError) {
      console.error('[API Dashboard] Error fetching user packages:', packagesError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch token balance',
          details: packagesError.message 
        },
        { status: 500 }
      )
    }

    let totalTokens = 0
    let heldTokens = 0
    for (const pkg of userPackages || []) {
      totalTokens += pkg.tokens_remaining || 0
      heldTokens += pkg.tokens_held || 0
    }

    const tokenBalance = {
      available: totalTokens - heldTokens,
      pending: heldTokens,
      total: totalTokens,
    }

    // 2. Get upcoming bookings with class details (reuse `now` variable)
    const { data: bookings, error: bookingsError } = await supabase
      .from(TABLES.BOOKINGS)
      .select(`
        id,
        class_id,
        booked_at,
        classes (
          title,
          scheduled_at,
          location,
          instructor_name
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .order('booked_at', { ascending: false })
      .limit(10)

    if (bookingsError) {
      console.error('[API Dashboard] Error fetching bookings:', bookingsError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch bookings',
          details: bookingsError.message 
        },
        { status: 500 }
      )
    }

    const upcomingBookings = (bookings || [])
      .filter((booking: any) => {
        const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
        return classData && new Date(classData.scheduled_at) > new Date(now)
      })
      .map((booking: any) => {
        const classData = Array.isArray(booking.classes) ? booking.classes[0] : booking.classes
        return {
          id: booking.id,
          class_name: classData?.title || 'Unknown Class',
          instructor_name: classData?.instructor_name || 'TBA',
          scheduled_at: classData?.scheduled_at || '',
          location: classData?.location || 'Studio',
        }
      })
      .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

    // 3. Get user stats
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('total_classes_attended, total_tokens_used, streak_current')
      .eq('user_id', userId)
      .single()

    if (statsError && statsError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('[API Dashboard] Error fetching user stats:', statsError)
      // Don't fail - stats might not exist yet
    }

    const stats = {
      totalClassesAttended: userStats?.total_classes_attended || 0,
      tokensUsed: userStats?.total_tokens_used || 0,
      currentStreak: userStats?.streak_current || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        tokenBalance,
        upcomingBookings,
        stats,
      },
    })
  } catch (error) {
    console.error('[API Dashboard] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

