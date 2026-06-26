'use client'

import { useEffect, useState } from 'react'
import { isBookingWindowOpen } from '@/lib/booking-window'

/** Re-checks every minute so the UI closes/opens at 8am / 10pm SGT without a refresh. */
export function useBookingWindowOpen(): boolean {
  const [open, setOpen] = useState(() => isBookingWindowOpen())

  useEffect(() => {
    const tick = () => setOpen(isBookingWindowOpen())
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])

  return open
}
