import type { Client, Entry, ConflictLog } from '../types'
import {
  getDaysInMonth,
  formatDate,
  isWeekend,
  isoWeekday,
  splitIntoWeeks,
} from '../utils/dateUtils'
import { isFullDayFree } from './capacity'

export interface DraftResult {
  entries:   Record<string, Entry>
  conflicts: ConflictLog[]
}

/**
 * Find the closest workday to preferredWeekday, ignoring capacity.
 * Used to determine the "ideal" day so we can detect conflicts.
 */
function findPreferredDay(
  week: Date[],
  preferredWeekday: number,
  holidays: Set<string>
): Date | null {
  const workdays = week.filter(d => !isWeekend(d) && !holidays.has(formatDate(d)))
  if (workdays.length === 0) return null
  return [...workdays].sort(
    (a, b) =>
      Math.abs(isoWeekday(a) - preferredWeekday) -
      Math.abs(isoWeekday(b) - preferredWeekday)
  )[0]
}

/**
 * Within a week, find the best workday for a client respecting capacity.
 * "Best" = closest ISO weekday to preferredWeekday where all team members are free.
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
 * - Active clients only, sorted by priority score (assessed) or manual priority (fallback)
 * - 1 day per week per client (closest to preferredWeekday)
 * - Allocate full day (AM + PM) to the entire team
 * - Skip days where any team member already has an entry
 *
 * Returns both the entries map and a conflict log (days that were bumped or skipped).
 */
export function generateDraft(
  clients: Client[],
  month: { year: number; month: number },
  holidays: Set<string>
): DraftResult {
  const result:    Record<string, Entry> = {}
  const conflicts: ConflictLog[]         = []

  const days  = getDaysInMonth(month.year, month.month)
  const weeks = splitIntoWeeks(days)

  const activeClients = clients
    .filter(c => c.isActive)
    .sort((a, b) => {
      const aHas = a.priorityScore !== undefined
      const bHas = b.priorityScore !== undefined
      if (aHas && bHas)  return b.priorityScore! - a.priorityScore!
      if (aHas && !bHas) return -1
      if (!aHas && bHas) return 1
      return a.priority - b.priority
    })

  for (const client of activeClients) {
    for (const [weekIdx, week] of weeks.entries()) {
      // What day would this client ideally want?
      const preferred  = findPreferredDay(week, client.preferredWeekday, holidays)
      // What day can it actually get given current allocations?
      const best       = pickBestDay(week, client.preferredWeekday, holidays, result, client.team.memberIds)

      const preferredStr = preferred ? formatDate(preferred) : null
      const bestStr      = best      ? formatDate(best)      : null

      // Conflict = client wanted a specific day but got bumped (or nothing)
      if (preferredStr && bestStr !== preferredStr) {
        conflicts.push({
          clientId:      client.id,
          clientName:    client.name,
          weekIndex:     weekIdx,
          preferredDate: preferredStr,
          allocatedDate: bestStr,
        })
      }

      if (!best) continue

      for (const memberId of client.team.memberIds) {
        for (const slot of ['AM', 'PM'] as const) {
          const key = `${bestStr}__${slot}__${memberId}`
          result[key] = {
            date:         bestStr!,
            slot,
            consultantId: memberId,
            clientId:     client.id,
            source:       'draft',
          }
        }
      }
    }
  }

  return { entries: result, conflicts }
}
