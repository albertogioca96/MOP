import type { Entry, HistorySnapshot } from '../types'

const MAX_SNAPSHOTS = 10

/** Add snapshot to front of history list, capped at MAX_SNAPSHOTS */
export function pushSnapshot(
  label: string,
  entries: Record<string, Entry>,
  history: HistorySnapshot[]
): HistorySnapshot[] {
  const snap: HistorySnapshot = {
    label,
    timestamp: Date.now(),
    entries: { ...entries },
  }
  return [snap, ...history].slice(0, MAX_SNAPSHOTS)
}

/** Restore entries from a snapshot */
export function restoreSnapshot(snap: HistorySnapshot): Record<string, Entry> {
  return { ...snap.entries }
}

/** Format snapshot timestamp to readable label */
export function formatSnapshotTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
