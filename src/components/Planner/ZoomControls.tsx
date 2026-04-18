import { useStore } from '../../store/useStore'
import { getDaysInMonth } from '../../utils/dateUtils'

const DEFAULT_ZOOM = 10

export function ZoomControls() {
  const { visibleDays, setVisibleDays, handleZoomIn, handleZoomOut, currentMonth } = useStore()
  const totalDays   = getDaysInMonth(currentMonth.year, currentMonth.month).length
  const isFullMonth = visibleDays >= totalDays

  const toggleFullMonth = () => {
    setVisibleDays(isFullMonth ? DEFAULT_ZOOM : totalDays)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginRight: 2 }}>ZOOM</span>

      <IconBtn onClick={handleZoomIn} disabled={visibleDays <= 5} title="Wider columns">＋</IconBtn>
      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, minWidth: 32, textAlign: 'center' }}>
        {visibleDays}d
      </span>
      <IconBtn onClick={handleZoomOut} disabled={visibleDays >= totalDays} title="Narrower columns">－</IconBtn>

      <div style={{ width: 1, height: 20, background: '#334155', margin: '0 2px' }} />

      {/* Full month toggle */}
      <button
        onClick={toggleFullMonth}
        title={isFullMonth ? 'Back to default (10d)' : 'Show full month'}
        style={{
          background: isFullMonth ? '#3b82f622' : 'transparent',
          color: isFullMonth ? '#3b82f6' : '#94a3b8',
          border: `1px solid ${isFullMonth ? '#3b82f655' : '#334155'}`,
          borderRadius: 5,
          padding: '4px 9px',
          fontSize: 11,
          fontWeight: isFullMonth ? 700 : 400,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {isFullMonth ? '← 10d' : 'All'}
      </button>
    </div>
  )
}

function IconBtn({ onClick, disabled, title, children }: {
  onClick: () => void; disabled?: boolean; title?: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      background: 'transparent',
      color: disabled ? '#334155' : '#94a3b8',
      border: '1px solid #334155',
      borderRadius: 5,
      width: 28, height: 28,
      fontSize: 14,
      cursor: disabled ? 'default' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  )
}
