export const MIN_BOOKING_LEAD_HOURS = 24

export const BOOKING_WINDOW_CLOSED_MESSAGE =
  'Classes must be booked at least 24 hours in advance. Same-day booking is not allowed.'

/** @deprecated Use MIN_BOOKING_LEAD_HOURS — kept for any stale imports */
export const BOOKING_WINDOW_LOOKAHEAD_HOURS = MIN_BOOKING_LEAD_HOURS

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
 * Booking is allowed any time of day when the class starts more than 24 hours
 * from now. Same-day and within-24-hour classes cannot be booked online.
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

  return millisecondsUntilClass >= MIN_BOOKING_LEAD_HOURS * 60 * 60 * 1000
}

export function logBookingWindowRejection(source: string): void {
  console.warn(`[Booking Window] Rejected ${source}: ${BOOKING_WINDOW_CLOSED_MESSAGE}`)
}
