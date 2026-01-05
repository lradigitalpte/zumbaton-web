import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

/**
 * GET /api/classes
 * Endpoint to fetch upcoming classes
 * Uses admin client for faster queries (bypasses RLS)
 * 
 * Query params:
 * - type: class type filter (optional)
 * - difficulty: difficulty level filter (optional)
 * - date: date filter (optional, ISO date string)
 * - recurrenceType: 'single' | 'recurring' | 'course' | 'all' (optional)
 * - categoryId: category ID filter (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const difficulty = searchParams.get('difficulty')
    const date = searchParams.get('date')
    const recurrenceType = searchParams.get('recurrenceType') as 'single' | 'recurring' | 'course' | 'all' | null
    const categoryId = searchParams.get('categoryId')

    const supabase = getSupabaseAdminClient()

    // Build query - similar to getUpcomingClasses but using admin client
    let query = supabase
      .from('classes')
      .select(`
        id,
        title,
        description,
        class_type,
        level,
        instructor_id,
        instructor_name,
        scheduled_at,
        duration_minutes,
        capacity,
        token_cost,
        location,
        room_id,
        category_id,
        status,
        recurrence_type,
        recurrence_pattern,
        parent_class_id,
        rooms (
          id,
          name
        ),
        class_categories (
          id,
          name,
          slug
        )
      `)
      .order('scheduled_at', { ascending: true })

    // Apply filters
    if (type && type !== 'all') {
      query = query.eq('class_type', type.toLowerCase())
    }

    if (difficulty && difficulty !== 'all') {
      query = query.eq('level', difficulty.toLowerCase())
    }

    if (recurrenceType && recurrenceType !== 'all') {
      query = query.eq('recurrence_type', recurrenceType)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      query = query
        .gte('scheduled_at', startOfDay.toISOString())
        .lte('scheduled_at', endOfDay.toISOString())
    } else {
      // If no date filter, exclude past classes (only show future classes)
      query = query.gte('scheduled_at', new Date().toISOString())
    }

    const { data: classes, error } = await query

    if (error) {
      console.error('[API Classes] Error fetching classes:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch classes',
          details: error.message 
        },
        { status: 500 }
      )
    }

    // Note: Booking counts will be fetched by processAndGroupClasses on the client side
    // This keeps the API endpoint simple and ensures consistency

    // Return raw classes data - the client-side processAndGroupClasses function will handle
    // transformation, instructor profiles, grouping, etc.
    // This ensures consistency between API and direct query paths
    return NextResponse.json({
      success: true,
      data: classes || [],
      count: (classes || []).length,
    })
  } catch (error) {
    console.error('[API Classes] Unexpected error:', error)
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

