/** Daily online booking hours in Singapore time (inclusive start, exclusive end). */
export const BOOKING_WINDOW_START_HOUR = 8
export const BOOKING_WINDOW_END_HOUR = 22

export const BOOKING_WINDOW_LABEL = '08:00–22:00 SGT'

export const BOOKING_WINDOW_CLOSED_MESSAGE =
  `Online bookings are open daily ${BOOKING_WINDOW_LABEL}. Please try again during booking hours.`

export function getSingaporeNow(): Date {
  const now = new Date()
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000
  return new Date(utcMs + 8 * 60 * 60 * 1000)
}

export function isBookingWindowOpen(now = getSingaporeNow()): boolean {
  const hour = now.getHours()
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
