import { useEffect, useRef } from 'react'
import { useStore } from '../../store/useStore'
import type { DayLabel } from '../../types'

interface Props { date: string; x: number; y: number; onClose: () => void }

const OPTIONS: { value: DayLabel; icon: string; label: string; desc: string; color: string }[] = [
  { value: 'holiday',  icon: '🏝️', label: 'Holiday',      desc: 'Mark as holiday for all',    color: '#f59e0b' },
  { value: 'strategy', icon: '📋', label: 'Strategy Day',  desc: 'Mark as strategy day',        color: '#3b82f6' },
  { value: 'event',    icon: '📅', label: 'Event',         desc: 'Mark as event / special day', color: '#8b5cf6' },
]

export function DayHeaderMenu({ date, x, y, onClose }: Props) {
  const { dayLabels, handleSetDayLabel } = useStore()
  const ref = useRef<HTMLDivElement>(null)
  const current = dayLabels[date] ?? null

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const menuWidth = 210
  const left = Math.min(x, window.innerWidth - menuWidth - 8)

  return (
    <div ref={ref} style={{
      position: 'fixed',
      top: y + 4,
      left,
      width: menuWidth,
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 10,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 1000,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '7px 14px',
        fontSize: 11,
        fontWeight: 700,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        borderBottom: '1px solid #334155',
      }}>
        {date}
      </div>

      <div style={{ padding: '6px 0' }}>
        {OPTIONS.map(opt => {
          const active = current === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => { handleSetDayLabel(date, active ? null : opt.value); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%',
                background: active ? opt.color + '22' : 'transparent',
                border: 'none',
                padding: '8px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                color: active ? opt.color : '#cbd5e1',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#334155' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: 17, width: 24, textAlign: 'center', flexShrink: 0 }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: active ? 600 : 400 }}>{opt.label}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{opt.desc}</div>
              </div>
              {active && <span style={{ marginLeft: 'auto', color: opt.color, fontSize: 13 }}>✓</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
