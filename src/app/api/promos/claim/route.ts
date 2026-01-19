import { NextResponse } from 'next/server'
import { claimEarlySteppers } from '@/lib/promo-utils'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const userId = body?.userId
    if (!userId) {
      return NextResponse.json({ claimed: false, message: 'userId is required' }, { status: 400 })
    }

    const result = await claimEarlySteppers(userId)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[API] /api/promos/claim error', err)
    return NextResponse.json({ claimed: false, message: 'internal_error' }, { status: 500 })
  }
}
