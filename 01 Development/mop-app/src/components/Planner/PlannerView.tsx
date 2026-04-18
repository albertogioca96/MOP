import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { PlannerGrid } from './PlannerGrid'
import { BrushTool } from './BrushTool'
import { ZoomControls } from './ZoomControls'
import { formatSnapshotTime } from '../../engine/history'

export function PlannerView() {
  const {
    handleGenerateDraft,
    handleClearEntries,
    history,
    handleRollback,
    warnings,
    toastMessage,
    entries,
    brushMode,
  } = useStore()

  const [showHistory, setShowHistory] = useState(false)
  const entryCount = Object.keys(entries).length

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {/* Generate */}
        <button onClick={handleGenerateDraft} style={primaryBtn}>
          ⚡ Generate Draft
        </button>

        {/* Clear */}
        <button onClick={handleClearEntries} style={ghostBtn} disabled={entryCount === 0}>
          Clear
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#334155' }} />

        {/* Brush */}
        <BrushTool />

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#334155', marginLeft: 'auto' }} />

        {/* Zoom */}
        <ZoomControls />

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#334155' }} />

        {/* History */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowHistory(v => !v)}
            style={{ ...ghostBtn, opacity: history.length === 0 ? 0.4 : 1 }}
            disabled={history.length === 0}
          >
            ↩ History ({history.length})
          </button>

          {showHistory && history.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 36,
              right: 0,
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              minWidth: 220,
              zIndex: 50,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '8px 12px',
                fontSize: 11,
                color: '#64748b',
                fontWeight: 600,
                borderBottom: '1px solid #334155',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                Snapshots
              </div>
              {history.map((snap, i) => (
                <button
                  key={i}
                  onClick={() => { handleRollback(snap); setShowHistory(false) }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 2,
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #1e293b',
                    padding: '8px 12px',
                    cursor: 'pointer',
                    color: '#e2e8f0',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#334155')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{snap.label}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{formatSnapshotTime(snap.timestamp)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Warnings bar */}
      {warnings.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 8,
          padding: '6px 16px',
          background: '#451a03',
          borderBottom: '1px solid #92400e',
          flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: '#fb923c', fontWeight: 600 }}>⚠ OVER CAPACITY:</span>
          {warnings.map(w => (
            <span key={w.consultantId} style={{ fontSize: 11, color: '#fdba74' }}>
              {w.consultantName} — {w.usedDays}/{w.maxDays}d
            </span>
          ))}
        </div>
      )}

      {/* Grid — trash cursor when in erase mode */}
      <div style={brushMode === 'delete' ? eraseCursorStyle : { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PlannerGrid />
      </div>

      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e293b',
          border: '1px solid #f97316',
          color: '#fdba74',
          borderRadius: 8,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 500,
          zIndex: 100,
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          pointerEvents: 'none',
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}

const primaryBtn: React.CSSProperties = {
  background: '#3b82f6',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '6px 14px',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent',
  color: '#94a3b8',
  border: '1px solid #334155',
  borderRadius: 6,
  padding: '5px 12px',
  fontSize: 12,
  cursor: 'pointer',
}

// Trash bin SVG as data-URL cursor (24×24, hotspot centre)
const TRASH_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Crect x='3' y='6' width='18' height='2' rx='1' fill='%23ef4444'/%3E%3Crect x='9' y='3' width='6' height='2' rx='1' fill='%23ef4444'/%3E%3Cpath d='M5 8l1 12h12l1-12H5zm4 2h2l.5 8H9l-.5-8zm4 0h2l-.5 8h-2l.5-8z' fill='%23ef4444'/%3E%3C/svg%3E") 12 4, crosshair`

const eraseCursorStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  cursor: TRASH_CURSOR,
}
