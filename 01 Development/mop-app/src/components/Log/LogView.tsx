import { useMemo, useState, useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import type { EntryMode, EntryStatus } from '../../types'
import { formatDate, getDaysInMonth, shortDayName } from '../../utils/dateUtils'

const STATUS_LABELS: Record<EntryStatus, string> = { P: 'Pianificato', A: 'Accettato', E: 'Eseguito' }
const STATUS_COLORS: Record<EntryStatus, string> = { P: '#f59e0b', A: '#3b82f6', E: '#22c55e' }
const MODE_ICON: Record<EntryMode, string>         = { remote: '🏠', onsite: '🏢' }

export function LogView() {
  const {
    clients, consultants, entries, currentMonth,
    handleUpdateEntry,
    logFocusClientId, logFocusDate,
    setLogFocusClientId, setLogFocusDate,
  } = useStore()

  const [filterClientId, setFilterClientId] = useState<string | null>(logFocusClientId)
  const [editingKey, setEditingKey]         = useState<string | null>(null)
  const focusRowRef = useRef<HTMLTableRowElement>(null)

  // Sync filter when focus changes from planner click
  useEffect(() => {
    if (logFocusClientId) setFilterClientId(logFocusClientId)
  }, [logFocusClientId])

  // Scroll to focused row after render
  useEffect(() => {
    if (logFocusDate && focusRowRef.current) {
      focusRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [logFocusDate, filterClientId])

  const clearFocus = () => {
    setLogFocusClientId(null)
    setLogFocusDate(null)
    setFilterClientId(null)
  }

  // Build date range: for focus mode show ±full month; otherwise current month
  const days = useMemo(
    () => getDaysInMonth(currentMonth.year, currentMonth.month),
    [currentMonth]
  )

  // All rows, filtered by client
  const rows = useMemo(() => {
    return days.flatMap(day => {
      const dateStr = formatDate(day)
      const dayEntries = Object.entries(entries)
        .filter(([, e]) => e.date === dateStr)
        .filter(([, e]) => !filterClientId || e.clientId === filterClientId)
        .map(([k, e]) => ({ key: k, entry: e }))
        .sort((a, b) => {
          if (a.entry.slot !== b.entry.slot) return a.entry.slot === 'AM' ? -1 : 1
          const na = consultants.find(c => c.id === a.entry.consultantId)?.name ?? ''
          const nb = consultants.find(c => c.id === b.entry.consultantId)?.name ?? ''
          return na.localeCompare(nb)
        })
      return dayEntries.map((r, i) => ({ ...r, day, isFirstOfDay: i === 0 }))
    })
  }, [days, entries, filterClientId, consultants])

  const focusClient = clients.find(c => c.id === logFocusClientId)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Focus banner */}
      {logFocusClientId && focusClient && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 20px',
          background: focusClient.color + '18',
          borderBottom: `1px solid ${focusClient.color}44`,
          flexShrink: 0,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: focusClient.color, display: 'inline-block' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: focusClient.color }}>
            {focusClient.name}
          </span>
          {logFocusDate && (
            <span style={{ fontSize: 12, color: '#64748b' }}>
              — Opened from {logFocusDate}
            </span>
          )}
          <button
            onClick={clearFocus}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: '1px solid #334155',
              color: '#64748b',
              borderRadius: 5,
              padding: '3px 10px',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            ✕ Clear focus
          </button>
        </div>
      )}

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 20px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginRight: 4 }}>CLIENT</span>
        <FilterPill label="All" color="#64748b" active={filterClientId === null} onClick={clearFocus} />
        {clients.map(c => (
          <FilterPill
            key={c.id}
            label={c.name}
            color={c.color}
            active={filterClientId === c.id}
            onClick={() => {
              const next = filterClientId === c.id ? null : c.id
              setFilterClientId(next)
              if (!next) { setLogFocusClientId(null); setLogFocusDate(null) }
            }}
          />
        ))}
      </div>

      {/* Table */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {rows.length === 0 ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 200, color: '#475569', fontSize: 14, flexDirection: 'column', gap: 8,
          }}>
            <span style={{ fontSize: 32 }}>📭</span>
            <span>No entries yet — generate a draft or use the brush in the Planner.</span>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1e293b', position: 'sticky', top: 0, zIndex: 10 }}>
                {['Date', 'Slot', 'Consultant', 'Client', 'Mode', 'Duration (h)', 'Activity', 'Client Staff', 'Status'].map(h => (
                  <Th key={h}>{h}</Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ key, entry, day, isFirstOfDay }) => {
                const client     = clients.find(c => c.id === entry.clientId)
                const consultant = consultants.find(c => c.id === entry.consultantId)
                const isEditing  = editingKey === key
                const isFocused  = entry.date === logFocusDate && entry.clientId === logFocusClientId
                const status     = entry.status ?? 'P'
                const mode       = entry.mode   ?? 'onsite'

                return (
                  <tr
                    key={key}
                    ref={isFocused && isFirstOfDay ? focusRowRef : undefined}
                    onClick={() => setEditingKey(isEditing ? null : key)}
                    style={{
                      background: isFocused
                        ? (client?.color ?? '#3b82f6') + '18'
                        : isEditing
                          ? '#1e3a5f'
                          : 'transparent',
                      borderBottom: '1px solid #1e293b',
                      borderLeft: isFocused ? `3px solid ${client?.color ?? '#3b82f6'}` : '3px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!isEditing && !isFocused) e.currentTarget.style.background = '#1e293b' }}
                    onMouseLeave={e => { if (!isEditing && !isFocused) e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Date */}
                    <Td style={{ width: 110 }}>
                      {isFirstOfDay && (
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>
                            {day.getDate().toString().padStart(2, '0')}/{currentMonth.month.toString().padStart(2, '0')}/{currentMonth.year}
                          </div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{shortDayName(day)}</div>
                        </div>
                      )}
                    </Td>

                    {/* Slot */}
                    <Td style={{ width: 48 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: entry.slot === 'AM' ? '#a78bfa' : '#fb923c' }}>
                        {entry.slot}
                      </span>
                    </Td>

                    {/* Consultant */}
                    <Td style={{ width: 130 }}>
                      <span style={{ color: '#cbd5e1' }}>{consultant?.name ?? '—'}</span>
                    </Td>

                    {/* Client */}
                    <Td style={{ width: 130 }}>
                      {client && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: client.color, display: 'inline-block', flexShrink: 0 }} />
                          <span style={{ color: client.color, fontWeight: 500 }}>{client.name}</span>
                        </span>
                      )}
                    </Td>

                    {/* Mode */}
                    <Td style={{ width: 80 }}>
                      {isEditing ? (
                        <ModeToggle value={mode} onChange={v => handleUpdateEntry(key, { mode: v })} />
                      ) : (
                        <span title={mode === 'remote' ? 'Remote' : 'On-site'} style={{ fontSize: 16 }}>
                          {MODE_ICON[mode]}
                        </span>
                      )}
                    </Td>

                    {/* Duration */}
                    <Td style={{ width: 100 }}>
                      {isEditing ? (
                        <InlineNumber value={entry.durationH ?? 0.5} onChange={v => handleUpdateEntry(key, { durationH: v })} />
                      ) : (
                        <span style={{ color: '#94a3b8' }}>{entry.durationH ?? 0.5}h</span>
                      )}
                    </Td>

                    {/* Activity */}
                    <Td>
                      {isEditing ? (
                        <InlineText value={entry.what ?? ''} placeholder="Describe activity…" onChange={v => handleUpdateEntry(key, { what: v })} />
                      ) : (
                        <span style={{ color: entry.what ? '#e2e8f0' : '#334155' }}>{entry.what || '—'}</span>
                      )}
                    </Td>

                    {/* Client staff */}
                    <Td style={{ width: 180 }}>
                      {isEditing ? (
                        <InlineText value={entry.withWhom ?? ''} placeholder="Client staff present…" onChange={v => handleUpdateEntry(key, { withWhom: v })} />
                      ) : (
                        <span style={{ color: entry.withWhom ? '#94a3b8' : '#334155' }}>{entry.withWhom || '—'}</span>
                      )}
                    </Td>

                    {/* Status */}
                    <Td style={{ width: 130 }}>
                      {isEditing ? (
                        <StatusToggle value={status} onChange={v => handleUpdateEntry(key, { status: v })} />
                      ) : (
                        <span style={{
                          background: STATUS_COLORS[status] + '22',
                          color: STATUS_COLORS[status],
                          border: `1px solid ${STATUS_COLORS[status]}44`,
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}>
                          {status} — {STATUS_LABELS[status]}
                        </span>
                      )}
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterPill({ label, color, active, onClick }: {
  label: string; color: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      background: active ? color : color + '18',
      color: active ? '#fff' : color,
      border: `1px solid ${color}${active ? 'ff' : '44'}`,
      borderRadius: 6,
      padding: '4px 12px',
      fontSize: 12,
      fontWeight: active ? 700 : 400,
      cursor: 'pointer',
      transition: 'all 0.12s',
    }}>
      {label}
    </button>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: '8px 12px',
      textAlign: 'left',
      fontSize: 11,
      fontWeight: 600,
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      borderBottom: '1px solid #334155',
    }}>
      {children}
    </th>
  )
}

function Td({ children, style }: { children?: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '8px 12px', verticalAlign: 'middle', color: '#94a3b8', ...style }}>
      {children}
    </td>
  )
}

function ModeToggle({ value, onChange }: { value: EntryMode; onChange: (v: EntryMode) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {(['remote', 'onsite'] as EntryMode[]).map(m => (
        <button key={m} onClick={e => { e.stopPropagation(); onChange(m) }} title={m === 'remote' ? 'Remote' : 'On-site'} style={{
          background: value === m ? '#334155' : 'transparent',
          border: `1px solid ${value === m ? '#475569' : '#1e293b'}`,
          borderRadius: 5,
          padding: '3px 6px',
          fontSize: 15,
          cursor: 'pointer',
        }}>
          {MODE_ICON[m]}
        </button>
      ))}
    </div>
  )
}

function StatusToggle({ value, onChange }: { value: EntryStatus; onChange: (v: EntryStatus) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {(['P', 'A', 'E'] as EntryStatus[]).map(s => (
        <button key={s} onClick={e => { e.stopPropagation(); onChange(s) }} title={STATUS_LABELS[s]} style={{
          background: value === s ? STATUS_COLORS[s] + '33' : 'transparent',
          color: value === s ? STATUS_COLORS[s] : '#475569',
          border: `1px solid ${value === s ? STATUS_COLORS[s] + '88' : '#334155'}`,
          borderRadius: 5,
          padding: '2px 8px',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}>
          {s}
        </button>
      ))}
    </div>
  )
}

function InlineText({ value, placeholder, onChange }: { value: string; placeholder?: string; onChange: (v: string) => void }) {
  return (
    <input value={value} placeholder={placeholder} onClick={e => e.stopPropagation()} onChange={e => onChange(e.target.value)} style={{
      background: '#0f172a',
      border: '1px solid #475569',
      borderRadius: 5,
      color: '#f1f5f9',
      padding: '4px 8px',
      fontSize: 13,
      outline: 'none',
      width: '100%',
      minWidth: 120,
    }} />
  )
}

function InlineNumber({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input type="number" value={value} min={0.25} max={12} step={0.25} onClick={e => e.stopPropagation()} onChange={e => onChange(Number(e.target.value))} style={{
      background: '#0f172a',
      border: '1px solid #475569',
      borderRadius: 5,
      color: '#f1f5f9',
      padding: '4px 8px',
      fontSize: 13,
      outline: 'none',
      width: 72,
    }} />
  )
}
