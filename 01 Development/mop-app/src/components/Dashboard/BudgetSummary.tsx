import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { getBudgetSummaries } from '../../engine/budget'

export function BudgetSummary() {
  const { clients, entries, consultants } = useStore()

  const summaries = useMemo(
    () => getBudgetSummaries(clients, entries, consultants),
    [clients, entries, consultants]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={sectionTitle}>Budget vs Allocated</h3>

      {summaries.map(s => {
        const pct = s.budget > 0 ? Math.min((s.allocated / s.budget) * 100, 100) : 0
        const over = s.allocated > s.budget

        return (
          <div key={s.clientId} style={{
            background: '#1e293b',
            border: `1px solid ${s.color}33`,
            borderLeft: `3px solid ${s.color}`,
            borderRadius: 8,
            padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 9, height: 9, borderRadius: '50%',
                  background: s.color, display: 'inline-block',
                }} />
                <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{s.name}</span>
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: over ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e',
              }}>
                €{Math.round(s.allocated).toLocaleString()} / €{s.budget.toLocaleString()}
                {over && ' ⚠'}
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              height: 8,
              background: '#0f172a',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 4,
            }}>
              <div style={{
                height: '100%',
                width: `${pct}%`,
                background: over ? '#ef4444' : pct >= 80 ? '#f59e0b' : s.color,
                borderRadius: 4,
                transition: 'width 0.3s',
              }} />
            </div>

            <div style={{ fontSize: 11, color: '#475569', textAlign: 'right' }}>
              {Math.round(pct)}% of budget used
            </div>
          </div>
        )
      })}
    </div>
  )
}

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  margin: '0 0 4px 0',
}
