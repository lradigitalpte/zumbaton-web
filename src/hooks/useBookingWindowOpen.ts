'use client'

import { useEffect, useState } from 'react'
import { isBookingWindowOpen } from '@/lib/booking-window'

function subscribeBookingWindowRefresh(onRefresh: () => void) {
  const onVisibility = () => {
    if (document.visibilityState === 'visible') onRefresh()
  }

  window.addEventListener('focus', onRefresh)
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    window.removeEventListener('focus', onRefresh)
    document.removeEventListener('visibilitychange', onVisibility)
  }
}

/** Re-checks when the tab regains focus so book buttons reflect the SGT booking window. */
export function useBookingWindowOpen(classStartsAt?: string | Date | null): boolean {
  const [open, setOpen] = useState(() => isBookingWindowOpen(classStartsAt))

  useEffect(() => {
    const tick = () => setOpen(isBookingWindowOpen(classStartsAt))
    tick()
    return subscribeBookingWindowRefresh(tick)
  }, [classStartsAt])

  return open
}
