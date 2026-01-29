/**
 * Public Classes API
 * GET /api/classes/public - Fetch classes with trial pricing (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get('date')
    
    const supabase = getSupabaseAdminClient()

    // Build query
    let query = supabase
      .from('classes')
      .select(`
        id,
        title,
        description,
        class_type,
        level,
        age_group,
        instructor_id,
        instructor_name,
        scheduled_at,
        duration_minutes,
        capacity,
        token_cost,
        trial_price_cents,
        location,
        room_id,
        status,
        rooms (
          id,
          name
        )
      `)
      .eq('status', 'scheduled')

    // Apply date filter if provided
    if (dateFilter) {
      const startOfDay = new Date(dateFilter)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(dateFilter)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
    } else {
      // If no date filter, only show future classes
      query = query.gte('scheduled_at', new Date().toISOString())
    }

    const { data: classes, error } = await query.order('scheduled_at', { ascending: true })

    if (error) {
      console.error('[Public Classes API] Error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch classes' },
        { status: 500 }
      )
    }

    // Get booking counts for each class
    const classIds = classes?.map(c => c.id) || []
    let bookingCounts: Record<string, number> = {}

    if (classIds.length > 0) {
      const { data: bookings } = await supabase
        .from('bookings')
        .select('class_id')
        .in('class_id', classIds)
        .in('status', ['confirmed', 'attended'])

      if (bookings) {
        bookings.forEach(booking => {
          const classId = booking.class_id as string
          bookingCounts[classId] = (bookingCounts[classId] || 0) + 1
        })
      }
    }

    // Add booking counts and room names
    const classesWithAvailability = (classes || []).map(cls => ({
      ...cls,
      booked_count: bookingCounts[cls.id] || 0,
      room_name: (cls.rooms as any)?.name || null,
    }))

    return NextResponse.json({
      success: true,
      data: classesWithAvailability,
      count: classesWithAvailability.length,
    })
  } catch (error) {
    console.error('[Public Classes API] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
