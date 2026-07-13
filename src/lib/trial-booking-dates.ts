const SG_TIMEZONE = 'Asia/Singapore'

/** Calendar YYYY-MM-DD in Singapore time. */
export function formatYmdSingapore(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: SG_TIMEZONE })
}

/** Monday-start week containing anchorYmd (YYYY-MM-DD). */
export function startOfWeekMondayLocal(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dow = x.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  x.setDate(x.getDate() + diff)
  return x
}

export function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function weekRangeFromAnchorYmd(anchorYmd: string): { from: string; to: string } {
  const [y, m, d] = anchorYmd.split('-').map(Number)
  if (!y || !m || !d) return { from: anchorYmd, to: anchorYmd }
  const anchor = new Date(y, m - 1, d)
  const mon = startOfWeekMondayLocal(anchor)
  const sun = new Date(mon)
  sun.setDate(mon.getDate() + 6)
  return { from: formatYmdLocal(mon), to: formatYmdLocal(sun) }
}

export function getDefaultTrialBookingWeekRange(): { from: string; to: string } {
  return weekRangeFromAnchorYmd(formatYmdSingapore())
}

export function parseYmd(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDaysToYmd(ymd: string, days: number): string {
  const d = parseYmd(ymd)
  d.setDate(d.getDate() + days)
  return formatYmdLocal(d)
}

export function monthRangeFromYmd(anchorYmd: string): { from: string; to: string } {
  const [y, m] = anchorYmd.split('-').map(Number)
  if (!y || !m) return { from: anchorYmd, to: anchorYmd }
  const first = new Date(y, m - 1, 1)
  const last = new Date(y, m, 0)
  return { from: formatYmdLocal(first), to: formatYmdLocal(last) }
}

export function getWeekDayYmds(from: string, to: string): string[] {
  const days: string[] = []
  let current = from
  while (current <= to) {
    days.push(current)
    current = addDaysToYmd(current, 1)
  }
  return days
}

export function toSingaporeYmdFromIso(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: SG_TIMEZONE })
}

export function formatWeekRangeLabel(from: string, to: string): string {
  const start = parseYmd(from)
  const end = parseYmd(to)
  const sameYear = start.getFullYear() === end.getFullYear()
  const startLabel = start.toLocaleDateString('en-SG', {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
  })
  const endLabel = end.toLocaleDateString('en-SG', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${startLabel} – ${endLabel}`
}

export function formatMonthYearLabel(anchorYmd: string): string {
  return parseYmd(anchorYmd).toLocaleDateString('en-SG', {
    month: 'long',
    year: 'numeric',
  })
}

export interface CalendarCell {
  ymd: string
  date: Date
  inCurrentMonth: boolean
}

/** Monday-start calendar grid cells for the month containing anchorYmd. */
export function getMonthCalendarGrid(anchorYmd: string): CalendarCell[] {
  const { from, to } = monthRangeFromYmd(anchorYmd)
  const gridStart = formatYmdLocal(startOfWeekMondayLocal(parseYmd(from)))

  const lastDay = parseYmd(to)
  const dow = lastDay.getDay()
  const daysToSunday = dow === 0 ? 0 : 7 - dow
  const gridEnd = addDaysToYmd(to, daysToSunday)

  const cells: CalendarCell[] = []
  let current = gridStart
  while (current <= gridEnd) {
    cells.push({
      ymd: current,
      date: parseYmd(current),
      inCurrentMonth: current >= from && current <= to,
    })
    current = addDaysToYmd(current, 1)
  }
  return cells
}

export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
