'use client'

import { BOOKING_WINDOW_LABEL } from '@/lib/booking-window'

type BookingWindowBannerProps = {
  open: boolean
  className?: string
}

export function BookingWindowBanner({ open, className = '' }: BookingWindowBannerProps) {
  if (open) return null

  return (
    <div
      className={`flex items-center gap-2 text-sm font-semibold rounded-none border border-red-500/40 bg-red-50 dark:bg-red-950/30 px-4 py-3 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <span className="inline-block w-2 h-2 rounded-full shrink-0 bg-red-500" aria-hidden />
      <span className="text-red-800 dark:text-red-200">
        Online booking is closed for today. Hours: {BOOKING_WINDOW_LABEL}. Please come back tomorrow morning.
      </span>
    </div>
  )
}
