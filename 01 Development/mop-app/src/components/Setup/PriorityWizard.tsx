import { useState, useMemo } from 'react'
import type { Client, PriorityAssessment } from '../../types'
import { computePriorityScore, computePriorityClass, CLASS_COLOR } from '../../engine/priority'

const QUESTIONS: {
  key: keyof PriorityAssessment
  label: string
  weight: string
  low: string
  high: string
}[] = [
  {
    key:    'revenueSize',
    label:  'Revenue Size',
    weight: '25%',
    low:    'Marginal budget',
    high:   'Major budget',
  },
  {
    key:    'growthPotential',
    label:  'Growth Potential',
    weight: '25%',
    low:    'Declining / closing',
    high:   'High-growth upside',
  },
  {
    key:    'marginQuality',
    label:  'Margin Quality',
    weight: '20%',
    low:    'Low / below cost',
    high:   'Premium margin',
  },
  {
    key:    'relationshipFreshness',
    label:  'Relationship Freshness',
    weight: '15%',
    low:    '5+ yr, fully settled',
    high:   'New / developing',
  },
  {
    key:    'strategicValue',
    label:  'Strategic Value',
    weight: '15%',
    low:    'No strategic value',
    high:   'Key logo / prestige',
  },
]

const DEFAULT_ASSESSMENT: PriorityAssessment = {
  revenueSize:           3,
  growthPotential:       3,
  marginQuality:         3,
  relationshipFreshness: 3,
  strategicValue:        3,
}

interface Props {
  client: Client
  onSave:  (assessment: PriorityAssessment, score: number, cls: 'A' | 'B' | 'C') => void
  onClose: () => void
}

export function PriorityWizard({ client, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<PriorityAssessment>(
    client.priorityAssessment ?? { ...DEFAULT_ASSESSMENT }
  )

  const score = useMemo(() => computePriorityScore(draft), [draft])
  const cls   = useMemo(() => computePriorityClass(score), [score])
  const color = CLASS_COLOR[cls]

  const set = (key: keyof PriorityAssessment, val: number) =>
    setDraft(d => ({ ...d, [key]: val }))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderTop: `3px solid ${client.color}`,
          borderRadius: 10,
          padding: 28,
          width: 520,
          maxHeight: '90vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        {/* ── Header ── */}
        <div>
          <div style={{
            fontSize: 10, fontWeight: 700, color: '#64748b',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
          }}>
            Priority Assessment
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9' }}>
            {client.name}
          </div>
        </div>

        {/* ── Live Score Bar ── */}
        <div style={{
          background: '#0f172a',
          border: `1px solid ${color}33`,
          borderRadius: 8,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 6, background: '#1e293b', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${score}%`,
                background: color,
                borderRadius: 3,
                transition: 'width 0.2s ease, background 0.3s ease',
              }} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color, minWidth: 46, textAlign: 'right', lineHeight: 1 }}>
            {score}
          </div>
          <div style={{
            background: color + '22',
            color,
            border: `1px solid ${color}55`,
            borderRadius: 6,
            padding: '5px 14px',
            fontSize: 16,
            fontWeight: 800,
            minWidth: 38,
            textAlign: 'center',
            transition: 'all 0.3s ease',
          }}>
            {cls}
          </div>
        </div>

        {/* ── Questions ── */}
        {QUESTIONS.map(q => (
          <div key={q.key}>
            {/* Label row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{q.label}</span>
              <span style={{
                fontSize: 10, fontWeight: 700,
                color: '#3b82f6',
                background: '#3b82f622',
                border: '1px solid #3b82f633',
                borderRadius: 4,
                padding: '1px 6px',
              }}>
                {q.weight}
              </span>
            </div>

            {/* Scale row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11, color: '#475569',
                width: 110, flexShrink: 0,
                textAlign: 'right', lineHeight: 1.3,
              }}>
                {q.low}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                {[1, 2, 3, 4, 5].map(n => {
                  const sel = draft[q.key] === n
                  return (
                    <button
                      key={n}
                      onClick={() => set(q.key, n)}
                      style={{
                        width: 38, height: 38,
                        borderRadius: 7,
                        border: sel ? `2px solid ${color}` : '1px solid #334155',
                        background: sel ? color + '22' : '#0f172a',
                        color: sel ? color : '#475569',
                        fontWeight: sel ? 800 : 400,
                        fontSize: 14,
                        cursor: 'pointer',
                        transition: 'all 0.1s',
                        flexShrink: 0,
                      }}
                    >
                      {n}
                    </button>
                  )
                })}
              </div>

              <span style={{
                fontSize: 11, color: '#475569',
                width: 110, flexShrink: 0,
                lineHeight: 1.3,
              }}>
                {q.high}
              </span>
            </div>
          </div>
        ))}

        {/* ── Footer ── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          paddingTop: 8, borderTop: '1px solid #334155',
        }}>
          <button onClick={onClose} style={btnStyle('#64748b')}>Cancel</button>
          <button onClick={() => onSave(draft, score, cls)} style={btnStyle('#22c55e')}>
            Save Assessment
          </button>
        </div>
      </div>
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    background: color + '22',
    color,
    border: `1px solid ${color}44`,
    borderRadius: 6,
    padding: '6px 18px',
    fontSize: 13,
    cursor: 'pointer',
    fontWeight: 600,
  }
}
