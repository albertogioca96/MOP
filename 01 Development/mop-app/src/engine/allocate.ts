import type { Client, Entry } from '../types'
import {
  getDaysInMonth,
  formatDate,
  isWeekend,
  isoWeekday,
  splitIntoWeeks,
} from '../utils/dateUtils'
import { isFullDayFree } from './capacity'

/**
 * Within a week, find the best workday for a client.
 * "Best" = closest ISO weekday to client.preferredWeekday,
 * not blocked by weekend/holiday, all team members free.
 */
function pickBestDay(
  week: Date[],
  preferredWeekday: number,
  holidays: Set<string>,
  existingEntries: Record<string, Entry>,
  teamMemberIds: string[]
): Date | null {
  const workdays = week.filter(d => !isWeekend(d) && !holidays.has(formatDate(d)))
  if (workdays.length === 0) return null

  // Sort ascending by distance from preferred weekday
  const sorted = [...workdays].sort(
    (a, b) =>
      Math.abs(isoWeekday(a) - preferredWeekday) -
      Math.abs(isoWeekday(b) - preferredWeekday)
  )

  for (const day of sorted) {
    const dateStr = formatDate(day)
    const allFree = teamMemberIds.every(id => isFullDayFree(id, dateStr, existingEntries))
    if (allFree) return day
  }

  return null
}

/**
 * Generate a full draft allocation for the given month.
 *
 * Rules:
 * - Active clients only, sorted by priority (1 = highest)
 * - 1 day per week per client (closest to preferredWeekday)
 * - Allocate full day (AM + PM) to the entire team
 * - Skip days where any team member already has an entry
 */
export function generateDraft(
  clients: Client[],
  month: { year: number; month: number },
  holidays: Set<string>
): Record<string, Entry> {
  const result: Record<string, Entry> = {}
  const days = getDaysInMonth(month.year, month.month)
  const weeks = splitIntoWeeks(days)

  const activeClients = clients
    .filter(c => c.isActive)
    .sort((a, b) => {
      // Assessed clients take priority over unassessed ones
      const aHas = a.priorityScore !== undefined
      const bHas = b.priorityScore !== undefined
      if (aHas && bHas)  return b.priorityScore! - a.priorityScore!  // higher score first
      if (aHas && !bHas) return -1                                    // assessed beats unassessed
      if (!aHas && bHas) return 1
      return a.priority - b.priority                                  // fallback: manual number
    })

  for (const client of activeClients) {
    for (const week of weeks) {
      const best = pickBestDay(week, client.preferredWeekday, holidays, result, client.team.memberIds)
      if (!best) continue

      const dateStr = formatDate(best)

      for (const memberId of client.team.memberIds) {
        for (const slot of ['AM', 'PM'] as const) {
          const key = `${dateStr}__${slot}__${memberId}`
          result[key] = {
            date: dateStr,
            slot,
            consultantId: memberId,
            clientId: client.id,
            source: 'draft',
          }
        }
      }
    }
  }

  return result
}
