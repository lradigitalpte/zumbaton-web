/** Daily online booking hours in Singapore time (inclusive start, exclusive end). */
export const BOOKING_WINDOW_START_HOUR = 8
export const BOOKING_WINDOW_END_HOUR = 22
export const BOOKING_WINDOW_LOOKAHEAD_HOURS = 24

export const BOOKING_WINDOW_LABEL = '08:00–22:00 SGT'

export const BOOKING_WINDOW_CLOSED_MESSAGE =
  `Same-day booking is not allowed. For other classes starting within 24 hours, booking is available only during ${BOOKING_WINDOW_LABEL}.`

export function getSingaporeNow(): Date {
  return new Date()
}

export function isSameDayClassInSingapore(
  classStartsAt: string | Date,
  now = getSingaporeNow()
): boolean {
  const start = new Date(classStartsAt)
  if (Number.isNaN(start.getTime())) return false
  const singaporeDate = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Singapore',
  })
  return singaporeDate.format(start) === singaporeDate.format(now)
}

/**
 * Same-day classes cannot be booked. Classes more than 24 hours away can be
 * booked at any time; the daily window applies to other near-term classes.
 */
export function isBookingWindowOpen(
  classStartsAt?: string | Date | null,
  now = getSingaporeNow()
): boolean {
  if (!classStartsAt) return true

  const start = new Date(classStartsAt)
  if (Number.isNaN(start.getTime())) return false

  const millisecondsUntilClass = start.getTime() - now.getTime()
  if (millisecondsUntilClass <= 0) return false

  if (isSameDayClassInSingapore(start, now)) return false

  if (millisecondsUntilClass > BOOKING_WINDOW_LOOKAHEAD_HOURS * 60 * 60 * 1000) {
    return true
  }

  const hour = Number(new Intl.DateTimeFormat('en-SG', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore',
  }).format(now))
  return hour >= BOOKING_WINDOW_START_HOUR && hour < BOOKING_WINDOW_END_HOUR
}

export function logBookingWindowRejection(source: string): void {
  const now = getSingaporeNow()
  const time = now.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Singapore',
  })
  console.warn(`[Booking Window] Rejected ${source} at ${time} SGT (outside ${BOOKING_WINDOW_LABEL})`)
}
