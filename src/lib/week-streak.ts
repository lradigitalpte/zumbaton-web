/**
 * Singapore week bounds for the member dashboard.
 * Keep in sync with zumbaton-admin/src/lib/week-streak.ts.
 */

const SG_TIMEZONE = 'Asia/Singapore'

const singaporeDate = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: SG_TIMEZONE,
})

function formatUtcDate(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Monday (YYYY-MM-DD) of the Singapore week that contains `value`. */
export function singaporeWeekStart(value: Date): string {
  const [year, month, day] = singaporeDate.format(value).split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  const weekday = utc.getUTCDay()
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1
  utc.setUTCDate(utc.getUTCDate() - daysFromMonday)
  return formatUtcDate(utc)
}

function addDaysToDateString(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number)
  const utc = new Date(Date.UTC(year, month - 1, day))
  utc.setUTCDate(utc.getUTCDate() + days)
  return formatUtcDate(utc)
}

/** Inclusive start and exclusive end of the Singapore week, as +08:00 timestamps. */
export function singaporeWeekBounds(now: Date = new Date()): {
  weekStart: string
  startIso: string
  endIso: string
} {
  const weekStart = singaporeWeekStart(now)
  const weekEnd = addDaysToDateString(weekStart, 7)
  return {
    weekStart,
    startIso: `${weekStart}T00:00:00+08:00`,
    endIso: `${weekEnd}T00:00:00+08:00`,
  }
}
