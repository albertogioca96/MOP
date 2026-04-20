import { useState, useCallback, createContext, useContext } from 'react'
import type { Consultant, Client, Entry, HistorySnapshot, CapacityWarning, ConflictLog, DayLabel } from '../types'
import { entryKey } from '../types'
import { SEED_CONSULTANTS, SEED_CLIENTS } from '../data/seedData'
import { generateDraft } from '../engine/allocate'
import { checkCapacityWarnings } from '../engine/capacity'
import { pushSnapshot, restoreSnapshot } from '../engine/history'

export type ActiveView = 'setup' | 'planner' | 'log' | 'dashboard'
export type BrushMode  = 'assign' | 'delete'

function buildStore() {
  const now = new Date()

  const [consultants, setConsultants] = useState<Consultant[]>(SEED_CONSULTANTS)
  const [clients,     setClients]     = useState<Client[]>(SEED_CLIENTS)
  const [entries,     setEntries]     = useState<Record<string, Entry>>({})
  const [currentMonth, setCurrentMonth] = useState({ year: now.getFullYear(), month: now.getMonth() + 1 })
  const [history,     setHistory]     = useState<HistorySnapshot[]>([])
  const [brushClientId, setBrushClientId] = useState<string | null>(null)
  const [brushMode,   setBrushMode]   = useState<BrushMode>('assign')
  const [visibleDays, setVisibleDays] = useState(10)
  const [activeView,  setActiveView]  = useState<ActiveView>('planner')
  const [warnings,    setWarnings]    = useState<CapacityWarning[]>([])
  const [conflicts,   setConflicts]   = useState<ConflictLog[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [dayLabels,   setDayLabels]   = useState<Record<string, DayLabel>>({})
  const [logFocusClientId, setLogFocusClientId] = useState<string | null>(null)
  const [logFocusDate,     setLogFocusDate]     = useState<string | null>(null)

  // ── helpers ──────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }, [])

  const afterEntriesChange = useCallback(
    (next: Record<string, Entry>, source: string) => {
      const ws = checkCapacityWarnings(consultants, next)
      setWarnings(ws)
      if (ws.length > 0 && source !== 'silent') {
        const names = ws.map(w => `${w.consultantName} (${w.usedDays}/${w.maxDays}d)`).join(', ')
        showToast(`⚠️ Over capacity: ${names}`)
      }
    },
    [consultants, showToast]
  )

  // ── actions ──────────────────────────────────────────────────────────────

  const handleGenerateDraft = useCallback(() => {
    setHistory(prev => pushSnapshot('Before draft', entries, prev))
    const { entries: draft, conflicts: newConflicts } = generateDraft(clients, currentMonth, new Set<string>())
    setEntries(draft)
    setConflicts(newConflicts)
    afterEntriesChange(draft, 'draft')
  }, [clients, currentMonth, entries, afterEntriesChange])

  const handleCellClick = useCallback(
    (date: string, slot: 'AM' | 'PM', consultantId: string) => {
      if (brushMode === 'assign' && brushClientId) {
        const client = clients.find(c => c.id === brushClientId)
        if (!client) return

        setEntries(prev => {
          const next = { ...prev }

          const amKey = entryKey(date, 'AM', consultantId)
          const pmKey = entryKey(date, 'PM', consultantId)
          const isFullDayEmpty = !(amKey in prev) && !(pmKey in prev)
          const slotsToFill: Array<'AM' | 'PM'> =
            slot === 'AM' && isFullDayEmpty ? ['AM', 'PM'] : [slot]

          for (const s of slotsToFill) {
            next[entryKey(date, s, consultantId)] = {
              date, slot: s, consultantId, clientId: brushClientId, source: 'brush',
            }
          }

          const others = client.team.memberIds.filter(id => id !== consultantId)
          for (const memberId of others) {
            for (const s of slotsToFill) {
              const k = entryKey(date, s, memberId)
              if (!(k in prev)) {
                next[k] = { date, slot: s, consultantId: memberId, clientId: brushClientId, source: 'team' }
              }
            }
          }

          afterEntriesChange(next, 'brush')
          return next
        })
      } else if (brushMode === 'delete') {
        setEntries(prev => {
          const key = entryKey(date, slot, consultantId)
          if (!(key in prev)) return prev

          const next    = { ...prev }
          const amKey   = entryKey(date, 'AM', consultantId)
          const pmKey   = entryKey(date, 'PM', consultantId)
          const amEntry = prev[amKey]
          const pmEntry = prev[pmKey]

          if (amEntry && pmEntry && amEntry.clientId === pmEntry.clientId) {
            delete next[amKey]; delete next[pmKey]
          } else {
            delete next[key]
          }

          afterEntriesChange(next, 'delete')
          return next
        })
      }
    },
    [brushMode, brushClientId, clients, afterEntriesChange]
  )

  const handleRollback = useCallback(
    (snap: HistorySnapshot) => {
      const restored = restoreSnapshot(snap)
      setEntries(restored)
      afterEntriesChange(restored, 'silent')
      showToast(`↩ Rolled back to: ${snap.label}`)
    },
    [afterEntriesChange, showToast]
  )

  const handleClearEntries = useCallback(() => {
    setHistory(prev => pushSnapshot('Before clear', entries, prev))
    setEntries({})
    setWarnings([])
    setConflicts([])
  }, [entries])

  const handleZoomIn  = useCallback(() => setVisibleDays(v => Math.max(5, v - 1)),  [])
  const handleZoomOut = useCallback(() => setVisibleDays(v => Math.min(31, v + 1)), [])

  const handleChangeMonth = useCallback((year: number, month: number) => {
    setCurrentMonth({ year, month })
  }, [])

  const handleUpdateClient     = useCallback((u: Client)     => setClients(prev => prev.map(c => c.id === u.id ? u : c)), [])
  const handleUpdateConsultant = useCallback((u: Consultant) => setConsultants(prev => prev.map(c => c.id === u.id ? u : c)), [])
  const handleAddClient        = useCallback((c: Client)     => setClients(prev => [...prev, c]), [])
  const handleAddConsultant    = useCallback((c: Consultant) => setConsultants(prev => [...prev, c]), [])
  const handleDeleteConsultant = useCallback((id: string)    => setConsultants(prev => prev.filter(c => c.id !== id)), [])
  const handleDeleteClient     = useCallback((id: string)    => setClients(prev => prev.filter(c => c.id !== id)), [])

  const handleUpdateEntry = useCallback((key: string, patch: Partial<Entry>) => {
    setEntries(prev => {
      if (!(key in prev)) return prev
      return { ...prev, [key]: { ...prev[key], ...patch } }
    })
  }, [])

  // Day label — visual only, never blocks writing
  const handleSetDayLabel = useCallback((date: string, label: DayLabel | null) => {
    setDayLabels(prev => {
      const next = { ...prev }
      if (label === null) delete next[date]; else next[date] = label
      return next
    })
  }, [])

  const handleOpenClientLog = useCallback((clientId: string, date: string) => {
    setLogFocusClientId(clientId)
    setLogFocusDate(date)
    setActiveView('log')
  }, [])

  return {
    consultants, clients, entries, currentMonth,
    history, brushClientId, brushMode,
    visibleDays, activeView, warnings, conflicts, toastMessage,
    dayLabels, logFocusClientId, logFocusDate,
    setActiveView, setBrushClientId, setBrushMode, setVisibleDays,
    setLogFocusClientId, setLogFocusDate,
    handleGenerateDraft, handleCellClick,
    handleRollback, handleClearEntries,
    handleZoomIn, handleZoomOut, handleChangeMonth,
    handleUpdateClient, handleUpdateConsultant, handleUpdateEntry,
    handleAddClient, handleAddConsultant, handleDeleteConsultant, handleDeleteClient,
    handleSetDayLabel, handleOpenClientLog,
  }
}

export type Store = ReturnType<typeof buildStore>

export const StoreContext = createContext<Store | null>(null)

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreContext.Provider')
  return ctx
}

export { buildStore }
