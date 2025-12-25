import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

/**
 * GET /api/packages
 * Public endpoint to fetch available packages
 * Uses admin client to bypass RLS (for public pricing page)
 * 
 * Query params:
 * - packageType: 'adults' | 'kids' (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const packageType = searchParams.get('packageType') as 'adults' | 'kids' | null

    const supabase = getSupabaseAdminClient()

    // Build query
    let query = supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)

    // Filter by package type if provided
    if (packageType === 'adults') {
      query = query.in('package_type', ['adult', 'all'])
    } else if (packageType === 'kids') {
      query = query.eq('package_type', 'kid')
    }

    const { data, error } = await query.order('token_count', { ascending: true })

    if (error) {
      console.error('[API Packages] Error fetching packages:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch packages',
          details: error.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0,
    })
  } catch (error) {
    console.error('[API Packages] Unexpected error:', error)
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

