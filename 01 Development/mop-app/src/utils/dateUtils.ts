/** Returns all days in a given year/month (1-indexed month) */
export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = []
  const d = new Date(year, month - 1, 1)
  while (d.getMonth() === month - 1) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
}

/** true if date is Saturday (6) or Sunday (0) */
export function isWeekend(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

/** Date → "YYYY-MM-DD" */
export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "YYYY-MM-DD" → Date (local, no timezone shift) */
export function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Returns 1=Mon … 7=Sun (ISO weekday) */
export function isoWeekday(date: Date): number {
  const d = date.getDay()
  return d === 0 ? 7 : d
}

/** Short weekday name: "Mon", "Tue", … */
export function shortDayName(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

/** Short month name: "Apr", "May", … */
export function shortMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'short' })
}

/** Splits days into ISO weeks (each starts Monday) */
export function splitIntoWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = []
  let week: Date[] = []
  for (const day of days) {
    if (isoWeekday(day) === 1 && week.length > 0) {
      weeks.push(week)
      week = []
    }
    week.push(day)
  }
  if (week.length > 0) weeks.push(week)
  return weeks
}

/** Weekday name from 1-5 number */
export const WEEKDAY_NAMES: Record<number, string> = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
}
