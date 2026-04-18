import { useMemo, useState, useRef } from 'react'
import { useStore } from '../../store/useStore'
import { PlannerCell } from './PlannerCell'
import { DayHeaderMenu } from './DayHeaderMenu'
import { getDaysInMonth, formatDate, isWeekend, shortDayName, shortMonthName } from '../../utils/dateUtils'
import type { DayLabel } from '../../types'

const CONSULTANT_COL_WIDTH = 120
const SLOT_COL_WIDTH       = 28
const WEEKEND_COL_WIDTH    = 34   // narrow — just fits "Sat\n4"

export const LABEL_COLOR: Record<DayLabel, string> = {
  holiday:  '#f59e0b',
  strategy: '#3b82f6',
  event:    '#8b5cf6',
}
const LABEL_ICON: Record<DayLabel, string> = {
  holiday:  '🏝️',
  strategy: '📋',
  event:    '📅',
}

export function PlannerGrid() {
  const { consultants, currentMonth, dayLabels, visibleDays } = useStore()
  const [menuDate, setMenuDate] = useState<string | null>(null)
  const [menuPos,  setMenuPos]  = useState({ x: 0, y: 0 })

  // Sync-scroll refs
  const mainRef    = useRef<HTMLDivElement>(null)
  const topBarRef  = useRef<HTMLDivElement>(null)
  const isSyncing  = useRef(false)

  const days = useMemo(
    () => getDaysInMonth(currentMonth.year, currentMonth.month),
    [currentMonth]
  )

  const totalDays  = days.length
  const isFullMonth = visibleDays >= totalDays

  // Slightly tighter default (100px @ 10d, scales with zoom)
  const cellWidth  = Math.max(52, Math.round(1050 / visibleDays))

  const getColW    = (day: Date) => isWeekend(day) ? WEEKEND_COL_WIDTH : cellWidth
  const tableWidth = CONSULTANT_COL_WIDTH + SLOT_COL_WIDTH + days.reduce((s, d) => s + getColW(d), 0)

  const onMainScroll = () => {
    if (isSyncing.current) return
    isSyncing.current = true
    if (topBarRef.current && mainRef.current)
      topBarRef.current.scrollLeft = mainRef.current.scrollLeft
    isSyncing.current = false
  }

  const onTopScroll = () => {
    if (isSyncing.current) return
    isSyncing.current = true
    if (mainRef.current && topBarRef.current)
      mainRef.current.scrollLeft = topBarRef.current.scrollLeft
    isSyncing.current = false
  }

  const openMenu = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setMenuPos({ x: rect.left, y: rect.bottom })
    setMenuDate(prev => prev === dateStr ? null : dateStr)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

      {/* ── Top scrollbar (above the header) ─────────────────────────────── */}
      <div
        ref={topBarRef}
        onScroll={onTopScroll}
        style={{
          overflowX: 'scroll',
          overflowY: 'hidden',
          flexShrink: 0,
          // Indent to align with the day columns (skip sticky left cols)
          paddingLeft: CONSULTANT_COL_WIDTH + SLOT_COL_WIDTH,
          background: '#0a0f1a',
          borderBottom: '1px solid #1e293b',
          // Force scrollbar to always show
          height: 14,
        }}
      >
        {/* Spacer matches exact table width minus the sticky left cols */}
        <div style={{ width: days.reduce((s, d) => s + getColW(d), 0), height: 1 }} />
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div
        ref={mainRef}
        onScroll={onMainScroll}
        style={{ overflowX: 'auto', overflowY: 'auto', flex: 1 }}
      >
        <table style={{
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          width: tableWidth,
        }}>
          <colgroup>
            <col style={{ width: CONSULTANT_COL_WIDTH }} />
            <col style={{ width: SLOT_COL_WIDTH }} />
            {days.map((d, i) => <col key={i} style={{ width: getColW(d) }} />)}
          </colgroup>

          <thead>
            <tr>
              <th colSpan={2} style={{
                ...stickyLeft,
                background: '#0f172a',
                borderBottom: '1px solid #334155',
                borderRight: '1px solid #334155',
                zIndex: 20,
                padding: '6px 10px',
                textAlign: 'left',
                color: '#64748b',
                fontSize: 12,
                fontWeight: 600,
                position: 'sticky',
                top: 0,
              }}>
                {shortMonthName(currentMonth.month)} {currentMonth.year}
              </th>

              {days.map(day => {
                const dateStr  = formatDate(day)
                const weekend  = isWeekend(day)
                const label    = dayLabels[dateStr] as DayLabel | undefined
                const labelClr = label ? LABEL_COLOR[label] : null
                const isOpen   = menuDate === dateStr

                return (
                  <th
                    key={dateStr}
                    onClick={e => openMenu(e, dateStr)}
                    title="Click to set day type"
                    style={{
                      background: labelClr ? labelClr + '20' : weekend ? '#0d1117' : '#0f172a',
                      borderBottom: `2px solid ${isOpen ? '#60a5fa' : labelClr ?? (weekend ? '#1e293b' : '#334155')}`,
                      borderRight: '1px solid #1e293b',
                      padding: '3px 2px',
                      textAlign: 'center',
                      position: 'sticky',
                      top: 0,
                      zIndex: 10,
                      cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    {/* Weekend: compact — just the day number */}
                    {weekend ? (
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#2a3a4a', lineHeight: 1.8 }}>
                        {day.getDate()}
                      </div>
                    ) : (
                      <>
                        {label
                          ? <div style={{ fontSize: 12 }}>{LABEL_ICON[label]}</div>
                          : <div style={{ fontSize: 10, color: '#64748b' }}>{shortDayName(day)}</div>
                        }
                        <div style={{ fontSize: 12, fontWeight: 700, color: labelClr ?? '#e2e8f0' }}>
                          {day.getDate()}
                        </div>
                        <div style={{ fontSize: 7, color: '#33415544' }}>▾</div>
                      </>
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>

          <tbody>
            {consultants.map((consultant, ci) => (
              ['AM', 'PM'].map((slot, si) => {
                const isFirstRow       = si === 0
                const isLastRow        = si === 1
                const isLastConsultant = ci === consultants.length - 1

                return (
                  <tr key={`${consultant.id}-${slot}`}>
                    {isFirstRow && (
                      <td rowSpan={2} style={{
                        ...stickyLeft,
                        background: '#1e293b',
                        borderRight: '1px solid #334155',
                        borderBottom: isLastConsultant ? 'none' : '1px solid #334155',
                        padding: '0 10px',
                        zIndex: 5,
                        verticalAlign: 'middle',
                      }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{consultant.name}</div>
                        <div style={{ fontSize: 10, color: '#475569', textTransform: 'capitalize', marginTop: 1 }}>{consultant.level}</div>
                      </td>
                    )}

                    <td style={{
                      ...stickySecond,
                      background: '#1e293b',
                      borderRight: '1px solid #334155',
                      borderBottom: isLastRow && !isLastConsultant ? '1px solid #334155' : '1px solid #1e293b',
                      padding: '0 2px',
                      textAlign: 'center',
                      zIndex: 5,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 600, color: '#475569', letterSpacing: '0.05em' }}>{slot}</span>
                    </td>

                    {days.map(day => {
                      const dateStr = formatDate(day)
                      const label   = dayLabels[dateStr] as DayLabel | undefined
                      return (
                        <td key={dateStr} style={{
                          padding: 2,
                          background: label ? LABEL_COLOR[label] + '10' : 'transparent',
                          borderBottom: isLastRow && !isLastConsultant ? '1px solid #334155' : '1px solid #1e293b',
                          borderRight: '1px solid #1e293b',
                        }}>
                          <PlannerCell
                            date={dateStr}
                            slot={slot as 'AM' | 'PM'}
                            consultantId={consultant.id}
                            isWeekend={isWeekend(day)}
                            dayLabel={label}
                            compact={isFullMonth}
                          />
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            ))}
          </tbody>
        </table>

        {menuDate && (
          <DayHeaderMenu date={menuDate} x={menuPos.x} y={menuPos.y} onClose={() => setMenuDate(null)} />
        )}
      </div>
    </div>
  )
}

const stickyLeft: React.CSSProperties = {
  position: 'sticky',
  left: 0,
  minWidth: CONSULTANT_COL_WIDTH,
}

const stickySecond: React.CSSProperties = {
  position: 'sticky',
  left: CONSULTANT_COL_WIDTH,
  width: SLOT_COL_WIDTH,
}
