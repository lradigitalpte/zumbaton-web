'use client'

import { useEffect, useState } from 'react'
import { isBookingWindowOpen } from '@/lib/booking-window'

/** Re-checks every minute so the UI closes/opens at 8am / 10pm SGT without a refresh. */
export function useBookingWindowOpen(classStartsAt?: string | Date | null): boolean {
  const [open, setOpen] = useState(() => isBookingWindowOpen(classStartsAt))

  useEffect(() => {
    const tick = () => setOpen(isBookingWindowOpen(classStartsAt))
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [classStartsAt])

  return open
}
