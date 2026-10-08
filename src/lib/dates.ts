/** All dates on the site are shown in India Standard Time. */
export const SITE_TIME_ZONE = 'Asia/Kolkata'

type DateInput = string | number | Date

const toDate = (value: DateInput) => (value instanceof Date ? value : new Date(value))

function parts(value: DateInput, options: Intl.DateTimeFormatOptions) {
  const out: Record<string, string> = {}
  for (const p of new Intl.DateTimeFormat('en-GB', {
    ...options,
    timeZone: SITE_TIME_ZONE,
  }).formatToParts(toDate(value))) {
    out[p.type] = p.value
  }
  return out
}

/** "Thursday, 8 October 2026" — header utility bar. */
export function formatLongDate(value: DateInput): string {
  const p = parts(value, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `${p.weekday}, ${p.day} ${p.month} ${p.year}`
}

/** "8 October 2026" — article bylines and profile lists. */
export function formatDate(value: DateInput): string {
  const p = parts(value, { day: 'numeric', month: 'long', year: 'numeric' })
  return `${p.day} ${p.month} ${p.year}`
}

/** "8 Oct 2026" — cards. */
export function formatShortDate(value: DateInput): string {
  const p = parts(value, { day: 'numeric', month: 'short', year: 'numeric' })
  return `${p.day} ${p.month.replace('Sept', 'Sep')} ${p.year}`
}

/** "March 2024" — press card "Joined". */
export function formatMonthYear(value: DateInput): string {
  const p = parts(value, { month: 'long', year: 'numeric' })
  return `${p.month} ${p.year}`
}

/** ISO string for <time datetime> and structured data. */
export function toISO(value: DateInput): string {
  return toDate(value).toISOString()
}
