/**
 * Public Duo Trial promo config
 * GET /api/promos/config - returns admin-editable pricing + booking mode
 *
 * Public (no auth): the landing/promos page reads this to render the current
 * price and to decide whether to show "Pay now", "Reserve & pay at studio",
 * or both. Falls back to defaults on any error.
 */

import { NextResponse } from 'next/server'
import { getDuoPromoConfig, isDuoPromoExpired, isOutdoorQuickJoinAvailable } from '@/lib/duo-promo-config'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const config = await getDuoPromoConfig()
  const expired = isDuoPromoExpired(config)
  const outdoorAvailable = await isOutdoorQuickJoinAvailable(config)

  return NextResponse.json({
    success: true,
    data: {
      ...config,
      // Convenience for the client: live = active AND not past its end date.
      live: config.active && !expired,
      expired,
      outdoorAvailable,
    },
  })
}
