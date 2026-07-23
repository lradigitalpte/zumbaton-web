'use client'

import { useEffect, useState } from 'react'

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

/** Bumps when the tab regains focus so class lists re-check the SGT booking window. */
export function useBookingWindowTick(): number {
  const [tick, setTick] = useState(0)

  useEffect(() => subscribeBookingWindowRefresh(() => setTick((t) => t + 1)), [])

  return tick
}
