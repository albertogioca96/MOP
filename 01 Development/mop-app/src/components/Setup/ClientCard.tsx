import { useState } from 'react'
import { useStore } from '../../store/useStore'
import type { Client, Seniority, PriorityAssessment } from '../../types'
import { WEEKDAY_NAMES } from '../../utils/dateUtils'
import { CLASS_COLOR } from '../../engine/priority'
import { PriorityWizard } from './PriorityWizard'

interface Props {
  client: Client
  /** If true, card opens in edit mode immediately (used for newly created clients) */
  autoEdit?: boolean
  /** Called when a new unsaved card is cancelled */
  onCancelNew?: () => void
}

const LEVELS: Seniority[] = ['trainee', 'junior', 'middle', 'senior', 'partner']

export function ClientCard({ client, autoEdit = false, onCancelNew }: Props) {
  const { consultants, handleUpdateClient } = useStore()
  const [editing,    setEditing]    = useState(autoEdit)
  const [draft,      setDraft]      = useState(client)
  const [showWizard, setShowWizard] = useState(false)

  const save   = () => { handleUpdateClient(draft); setEditing(false) }
  const cancel = () => { setDraft(client); setEditing(false); onCancelNew?.() }

  const teamNames = client.team.memberIds
    .map(id => consultants.find(c => c.id === id)?.name ?? id)
    .join(', ')

  const toggleMember = (id: string) => {
    const ids = draft.team.memberIds.includes(id)
      ? draft.team.memberIds.filter(m => m !== id)
      : [...draft.team.memberIds, id]
    setDraft(d => ({ ...d, team: { memberIds: ids } }))
  }

  const setRate = (level: Seniority, val: number) =>
    setDraft(d => ({ ...d, rates: { ...d.rates, [level]: val } }))

  // Wizard saves into draft — persisted only when the card is Saved
  const handleWizardSave = (
    assessment: PriorityAssessment,
    score: number,
    cls: 'A' | 'B' | 'C'
  ) => {
    setDraft(d => ({ ...d, priorityAssessment: assessment, priorityScore: score, priorityClass: cls }))
    setShowWizard(false)
  }

  return (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${draft.color}44`,
      borderLeft: `3px solid ${draft.color}`,
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: draft.color, flexShrink: 0, display: 'inline-block',
          }} />
          {editing ? (
            <input
              value={draft.name}
              onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
              style={inputStyle}
              autoFocus
            />
          ) : (
            <>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{client.name}</span>
              {client.priorityClass && (
                <span style={{
                  background: CLASS_COLOR[client.priorityClass] + '22',
                  color: CLASS_COLOR[client.priorityClass],
                  border: `1px solid ${CLASS_COLOR[client.priorityClass]}44`,
                  borderRadius: 4,
                  padding: '1px 7px',
                  fontSize: 11,
                  fontWeight: 800,
                  lineHeight: 1.6,
                }}>
                  {client.priorityClass}
                </span>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => handleUpdateClient({ ...client, isActive: !client.isActive })}
            style={{
              background: client.isActive ? '#22c55e22' : '#64748b22',
              color: client.isActive ? '#22c55e' : '#64748b',
              border: `1px solid ${client.isActive ? '#22c55e44' : '#64748b44'}`,
              borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600,
            }}
          >
            {client.isActive ? 'Active' : 'Inactive'}
          </button>
          {editing ? (
            <><Btn onClick={save} color="#22c55e">Save</Btn><Btn onClick={cancel} color="#64748b">Cancel</Btn></>
          ) : (
            <Btn onClick={() => setEditing(true)} color="#3b82f6">Edit</Btn>
          )}
        </div>
      </div>

      {/* ── Priority ── */}
      <Row label="Priority">
        {editing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <input
              type="number" min={1} max={10} value={draft.priority}
              onChange={e => setDraft(d => ({ ...d, priority: Number(e.target.value) }))}
              style={{ ...inputStyle, width: 64 }}
            />
            <button
              onClick={() => setShowWizard(true)}
              style={{
                background: '#8b5cf622', color: '#8b5cf6',
                border: '1px solid #8b5cf644',
                borderRadius: 5, padding: '3px 10px',
                fontSize: 12, cursor: 'pointer', fontWeight: 600,
              }}
            >
              ★ Assess
            </button>
            {draft.priorityClass && (
              <span style={{
                background: CLASS_COLOR[draft.priorityClass] + '22',
                color: CLASS_COLOR[draft.priorityClass],
                border: `1px solid ${CLASS_COLOR[draft.priorityClass]}44`,
                borderRadius: 4, padding: '2px 8px',
                fontSize: 11, fontWeight: 800,
              }}>
                {draft.priorityClass} · {draft.priorityScore}pts
              </span>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={valueStyle}>#{client.priority}</span>
            {client.priorityScore !== undefined && (
              <span style={{ fontSize: 12, color: '#475569' }}>{client.priorityScore} pts</span>
            )}
          </div>
        )}
      </Row>

      {/* ── Preferred weekday ── */}
      <Row label="Pref. day">
        {editing
          ? <select
              value={draft.preferredWeekday}
              onChange={e => setDraft(d => ({ ...d, preferredWeekday: Number(e.target.value) }))}
              style={{ ...inputStyle, width: 'auto' }}
            >
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{WEEKDAY_NAMES[n]}</option>)}
            </select>
          : <span style={valueStyle}>{WEEKDAY_NAMES[client.preferredWeekday]}</span>}
      </Row>

      {/* ── Budget ── */}
      <Row label="Budget">
        {editing
          ? <input
              type="number" min={0} value={draft.monthlyBudget}
              onChange={e => setDraft(d => ({ ...d, monthlyBudget: Number(e.target.value) }))}
              style={{ ...inputStyle, width: 110 }}
            />
          : <span style={valueStyle}>€{client.monthlyBudget.toLocaleString()}</span>}
      </Row>

      {/* ── Team ── */}
      <Row label="Team">
        {editing
          ? <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {consultants.map(c => {
                const sel = draft.team.memberIds.includes(c.id)
                return (
                  <button key={c.id} onClick={() => toggleMember(c.id)} style={{
                    background: sel ? draft.color + '33' : '#0f172a',
                    color: sel ? draft.color : '#64748b',
                    border: `1px solid ${sel ? draft.color : '#334155'}`,
                    borderRadius: 5, padding: '3px 10px', fontSize: 12,
                    cursor: 'pointer', fontWeight: sel ? 600 : 400,
                  }}>{c.name}</button>
                )
              })}
            </div>
          : <span style={valueStyle}>{teamNames || '—'}</span>}
      </Row>

      {/* ── Rates (edit only) ── */}
      {editing && (
        <div style={{ borderTop: '1px solid #334155', paddingTop: 10, marginTop: 2 }}>
          <div style={{
            fontSize: 11, color: '#64748b', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8,
          }}>
            Rates (€ / day)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
            {LEVELS.map(level => (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: '#94a3b8', textTransform: 'capitalize', width: 60, flexShrink: 0 }}>
                  {level}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, color: '#475569' }}>€</span>
                  <input
                    type="number" min={0} step={50}
                    value={draft.rates[level] ?? 0}
                    onChange={e => setRate(level, Number(e.target.value))}
                    style={{ ...inputStyle, width: 80 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Rates display (view mode) ── */}
      {!editing && (
        <Row label="Rates">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {LEVELS.filter(l => client.rates[l]).map(l => (
              <span key={l} style={{ fontSize: 11, color: '#64748b' }}>
                <span style={{ textTransform: 'capitalize', color: '#475569' }}>{l}</span> €{client.rates[l]}
              </span>
            ))}
          </div>
        </Row>
      )}

      {/* ── Color (edit only) ── */}
      {editing && (
        <Row label="Color">
          <input
            type="color" value={draft.color}
            onChange={e => setDraft(d => ({ ...d, color: e.target.value }))}
            style={{ width: 36, height: 28, border: 'none', background: 'none', cursor: 'pointer' }}
          />
        </Row>
      )}

      {/* ── Priority Wizard modal ── */}
      {showWizard && (
        <PriorityWizard
          client={draft}
          onSave={handleWizardSave}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 12, color: '#64748b', width: 72, flexShrink: 0, paddingTop: 2 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: color + '22', color,
      border: `1px solid ${color}44`,
      borderRadius: 5, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontWeight: 500,
    }}>{children}</button>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0f172a', border: '1px solid #475569', borderRadius: 5,
  color: '#f1f5f9', padding: '4px 8px', fontSize: 13, outline: 'none', width: '100%',
}
const valueStyle: React.CSSProperties = { fontSize: 13, color: '#cbd5e1' }
