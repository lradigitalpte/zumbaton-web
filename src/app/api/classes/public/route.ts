import { NextRequest, NextResponse } from 'next/server'
import { getPublicClasses } from '@/lib/classes-server'

/**
 * Public Classes API
 * GET /api/classes/public - Fetch classes with trial pricing (no auth required)
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFilter = searchParams.get('date')
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    const data = await getPublicClasses({
      date: dateFilter ?? undefined,
      from: fromParam ?? undefined,
      to: toParam ?? undefined,
    })

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
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
