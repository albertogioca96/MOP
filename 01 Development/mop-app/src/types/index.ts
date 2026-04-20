export type Seniority    = 'trainee' | 'junior' | 'middle' | 'senior' | 'partner'
export type DayLabel     = 'holiday' | 'strategy' | 'event'
export type Slot         = 'AM' | 'PM'
export type EntrySource  = 'draft' | 'brush' | 'manual' | 'team'
export type EntryMode    = 'remote' | 'onsite'
export type EntryStatus  = 'P' | 'A' | 'E'   // Pianificato | Accettato | Eseguito

export interface Consultant {
  id: string
  name: string
  level: Seniority
  monthlyCapacityDays: number
}

export interface PriorityAssessment {
  revenueSize:            number  // 1–5
  growthPotential:        number  // 1–5
  marginQuality:          number  // 1–5
  relationshipFreshness:  number  // 1–5  (5 = brand-new client, 1 = 5+ yr settled)
  strategicValue:         number  // 1–5
}

export interface Client {
  id: string
  name: string
  isActive: boolean
  priority: number          // 1 = highest (manual fallback)
  preferredWeekday: number  // 1=Mon … 5=Fri
  monthlyBudget: number     // €
  rates: Record<Seniority, number>
  team: { memberIds: string[] }
  color: string
  // Priority assessment (optional — filled by wizard)
  priorityAssessment?: PriorityAssessment
  priorityScore?:      number           // 0–100 computed
  priorityClass?:      'A' | 'B' | 'C'
}

// Key: `${date}__${slot}__${consultantId}`
export interface Entry {
  date: string
  slot: Slot
  consultantId: string
  clientId: string
  source: EntrySource
  // detail fields (optional — filled from Log view or cell popup)
  mode?: EntryMode
  status?: EntryStatus
  what?: string        // activity description
  withWhom?: string    // client-side people present
  durationH?: number   // hours worked (0.5 default)
}

export interface HistorySnapshot {
  label: string
  timestamp: number
  entries: Record<string, Entry>
}

export interface CapacityWarning {
  consultantId: string
  consultantName: string
  usedDays: number
  maxDays: number
}

export function entryKey(date: string, slot: Slot, consultantId: string): string {
  return `${date}__${slot}__${consultantId}`
}
