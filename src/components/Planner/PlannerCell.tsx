import { useStore } from '../../store/useStore'
import type { Slot, EntryStatus, DayLabel } from '../../types'
import { LABEL_COLOR } from './PlannerGrid'

interface Props {
  date: string
  slot: Slot
  consultantId: string
  isWeekend: boolean
  dayLabel?: DayLabel
  compact?: boolean
}

const STATUS_COLORS: Record<EntryStatus, string> = {
  P: '#f59e0b',
  A: '#3b82f6',
  E: '#22c55e',
}

export function PlannerCell({ date, slot, consultantId, isWeekend, dayLabel, compact }: Props) {
  const { entries, clients, brushClientId, brushMode, handleCellClick, handleOpenClientLog } = useStore()

  const key    = `${date}__${slot}__${consultantId}`
  const entry  = entries[key]
  const client = entry ? clients.find(c => c.id === entry.clientId) : null
  const brushActive = brushClientId !== null || brushMode === 'delete'

  const handleClick = () => {
    if (isWeekend) return
    if (brushActive) {
      handleCellClick(date, slot, consultantId)
    } else if (entry) {
      handleOpenClientLog(entry.clientId, date)
    }
  }

  // Weekend — always blocked
  if (isWeekend) {
    return (
      <div style={{
        height: 34,
        background: '#0d1117',
        border: '1px solid #1e293b',
        borderRadius: 3,
      }} />
    )
  }

  // Filled cell
  if (client && entry) {
    const status   = entry.status ?? 'P'
    const modeIcon = entry.mode === 'remote' ? '🏠' : '🏢'
    return (
      <div
        onClick={handleClick}
        style={{
          height: 30,
          background: client.color + '1a',
          border: `1px solid ${client.color}44`,
          borderLeft: `3px solid ${client.color}`,
          borderRadius: 3,
          cursor: 'pointer',
          overflow: 'hidden',
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          padding: compact ? '0 3px' : '0 4px 0 5px',
          gap: compact ? 0 : 3,
        }}
      >
        <span style={{
          flex: 1,
          fontSize: compact ? 9 : 10,
          fontWeight: 600,
          color: client.color,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}>
          {client.name.split(' ')[0]}
        </span>
        {/* Hide mode icon and status letter in compact/full-month mode */}
        {!compact && <span style={{ fontSize: 11, lineHeight: 1, flexShrink: 0 }}>{modeIcon}</span>}
        {!compact && (
          <span style={{ fontSize: 10, fontWeight: 800, color: STATUS_COLORS[status], flexShrink: 0, lineHeight: 1 }}>
            {status}
          </span>
        )}
      </div>
    )
  }

  // Empty cell — tinted if dayLabel present
  const emptyBg = brushActive && brushClientId
    ? (clients.find(c => c.id === brushClientId)?.color ?? '#475569') + '0d'
    : dayLabel
      ? LABEL_COLOR[dayLabel] + '14'
      : '#0f172a'

  return (
    <div
      onClick={handleClick}
      style={{
        height: 30,
        background: emptyBg,
        border: '1px solid #1e293b',
        borderRadius: 3,
        cursor: brushActive ? 'crosshair' : 'default',
        transition: 'background 0.1s',
      }}
    />
  )
}
