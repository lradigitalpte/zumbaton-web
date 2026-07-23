import { NextResponse } from 'next/server'
import {
  BOOKING_WINDOW_CLOSED_MESSAGE,
  MIN_BOOKING_LEAD_HOURS,
  getSingaporeNow,
} from '@/lib/booking-window'

export const dynamic = 'force-dynamic'

/** GET /api/booking-window — online booking lead-time policy (SGT). */
export async function GET() {
  const now = getSingaporeNow()

  return NextResponse.json({
    open: true,
    minLeadHours: MIN_BOOKING_LEAD_HOURS,
    closedMessage: BOOKING_WINDOW_CLOSED_MESSAGE,
    singaporeTime: now.toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  })
}
