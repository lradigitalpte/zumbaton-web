import { NextRequest, NextResponse } from 'next/server'
import { getPublicPackages } from '@/lib/packages-server'

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

    const data = await getPublicPackages(packageType ?? undefined)

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
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

