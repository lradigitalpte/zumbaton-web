/** Daily online booking hours in Singapore time (inclusive start, exclusive end). */
export const BOOKING_WINDOW_START_HOUR = 8
export const BOOKING_WINDOW_END_HOUR = 22
export const BOOKING_WINDOW_LOOKAHEAD_HOURS = 24

export const BOOKING_WINDOW_LABEL = '08:00–22:00 SGT'

export const BOOKING_WINDOW_CLOSED_MESSAGE =
  `Classes starting within 24 hours can only be booked during ${BOOKING_WINDOW_LABEL}. Classes more than 24 hours away remain available.`

export function getSingaporeNow(): Date {
  return new Date()
}

/**
 * Classes more than 24 hours away can be booked at any time. The daily window
 * only applies to a class starting within the next 24 hours.
 */
export function isBookingWindowOpen(
  classStartsAt?: string | Date | null,
  now = getSingaporeNow()
): boolean {
  if (!classStartsAt) return true

  const start = new Date(classStartsAt)
  if (Number.isNaN(start.getTime())) return false

  const millisecondsUntilClass = start.getTime() - now.getTime()
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
