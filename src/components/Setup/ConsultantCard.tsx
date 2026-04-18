import { useState } from 'react'
import { useStore } from '../../store/useStore'
import type { Consultant, Seniority } from '../../types'

const LEVELS: Seniority[] = ['trainee', 'junior', 'middle', 'senior', 'partner']

const LEVEL_COLORS: Record<Seniority, string> = {
  trainee: '#64748b',
  junior:  '#3b82f6',
  middle:  '#8b5cf6',
  senior:  '#f59e0b',
  partner: '#ef4444',
}

interface Props { consultant: Consultant; autoEdit?: boolean; onCancelNew?: () => void }

export function ConsultantCard({ consultant, autoEdit = false, onCancelNew }: Props) {
  const { handleUpdateConsultant, handleDeleteConsultant } = useStore()
  const [editing, setEditing] = useState(autoEdit)
  const [draft, setDraft] = useState(consultant)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const save = () => { handleUpdateConsultant(draft); setEditing(false) }
  const cancel = () => { setDraft(consultant); setEditing(false); onCancelNew?.() }

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {editing ? (
          <input
            value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            style={inputStyle}
            autoFocus
          />
        ) : (
          <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{consultant.name}</span>
        )}

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {editing ? (
            <><Btn onClick={save} color="#22c55e">Save</Btn><Btn onClick={cancel} color="#64748b">Cancel</Btn></>
          ) : confirmDelete ? (
            <>
              <span style={{ fontSize: 11, color: '#ef4444' }}>Delete?</span>
              <Btn onClick={() => handleDeleteConsultant(consultant.id)} color="#ef4444">Yes</Btn>
              <Btn onClick={() => setConfirmDelete(false)} color="#64748b">No</Btn>
            </>
          ) : (
            <>
              <Btn onClick={() => setEditing(true)} color="#3b82f6">Edit</Btn>
              <button onClick={() => setConfirmDelete(true)} title="Delete consultant" style={{
                background: 'transparent', border: '1px solid #334155', borderRadius: 5,
                color: '#475569', width: 28, height: 28, cursor: 'pointer', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>🗑</button>
            </>
          )}
        </div>
      </div>

      {/* Level */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: '#64748b', width: 60 }}>Level</span>
        {editing ? (
          <select
            value={draft.level}
            onChange={e => setDraft(d => ({ ...d, level: e.target.value as Seniority }))}
            style={{ ...inputStyle, width: 'auto' }}
          >
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        ) : (
          <span style={{
            background: LEVEL_COLORS[consultant.level] + '22',
            color: LEVEL_COLORS[consultant.level],
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 12,
            fontWeight: 600,
            textTransform: 'capitalize',
          }}>
            {consultant.level}
          </span>
        )}
      </div>

      {/* Capacity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: '#64748b', width: 60 }}>Capacity</span>
        {editing ? (
          <input
            type="number"
            value={draft.monthlyCapacityDays}
            min={1} max={31}
            onChange={e => setDraft(d => ({ ...d, monthlyCapacityDays: Number(e.target.value) }))}
            style={{ ...inputStyle, width: 64 }}
          />
        ) : (
          <span style={{ fontSize: 13, color: '#cbd5e1' }}>
            {consultant.monthlyCapacityDays} days/month
          </span>
        )}
      </div>
    </div>
  )
}

function Btn({ onClick, color, children }: { onClick: () => void; color: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: color + '22',
      color,
      border: `1px solid ${color}44`,
      borderRadius: 5,
      padding: '3px 10px',
      fontSize: 12,
      cursor: 'pointer',
      fontWeight: 500,
    }}>
      {children}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #475569',
  borderRadius: 5,
  color: '#f1f5f9',
  padding: '4px 8px',
  fontSize: 13,
  outline: 'none',
  width: '100%',
}
