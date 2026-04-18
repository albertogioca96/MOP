import type { Consultant, Entry, CapacityWarning } from '../types'

/** Days used by a consultant (each slot = 0.5 days) */
export function getUsedDays(
  consultantId: string,
  entries: Record<string, Entry>
): number {
  return Object.values(entries).filter(e => e.consultantId === consultantId).length * 0.5
}

/** Check all consultants and return warnings for overloaded ones */
export function checkCapacityWarnings(
  consultants: Consultant[],
  entries: Record<string, Entry>
): CapacityWarning[] {
  return consultants
    .map(c => ({ c, used: getUsedDays(c.id, entries) }))
    .filter(({ c, used }) => used > c.monthlyCapacityDays)
    .map(({ c, used }) => ({
      consultantId: c.id,
      consultantName: c.name,
      usedDays: used,
      maxDays: c.monthlyCapacityDays,
    }))
}

/** true if a specific slot is free */
export function isSlotFree(
  consultantId: string,
  date: string,
  slot: 'AM' | 'PM',
  entries: Record<string, Entry>
): boolean {
  return !(`${date}__${slot}__${consultantId}` in entries)
}

/** true if both AM and PM are free */
export function isFullDayFree(
  consultantId: string,
  date: string,
  entries: Record<string, Entry>
): boolean {
  return (
    isSlotFree(consultantId, date, 'AM', entries) &&
    isSlotFree(consultantId, date, 'PM', entries)
  )
}
