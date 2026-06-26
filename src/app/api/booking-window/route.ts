import { NextResponse } from 'next/server'
import {
  BOOKING_WINDOW_CLOSED_MESSAGE,
  BOOKING_WINDOW_LABEL,
  getSingaporeNow,
  isBookingWindowOpen,
} from '@/lib/booking-window'

export const dynamic = 'force-dynamic'

/** GET /api/booking-window — current public/member online booking hours (SGT). */
export async function GET() {
  const now = getSingaporeNow()
  const open = isBookingWindowOpen(now)

  return NextResponse.json({
    open,
    label: BOOKING_WINDOW_LABEL,
    closedMessage: BOOKING_WINDOW_CLOSED_MESSAGE,
    singaporeTime: now.toLocaleString('en-SG', {
      timeZone: 'Asia/Singapore',
      dateStyle: 'medium',
      timeStyle: 'short',
    }),
  })
}
