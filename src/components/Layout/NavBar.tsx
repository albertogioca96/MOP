import { useStore } from '../../store/useStore'
import type { ActiveView } from '../../store/useStore'

const TABS: { id: ActiveView; label: string; icon: string }[] = [
  { id: 'setup',     label: 'Setup',     icon: '⚙️' },
  { id: 'planner',   label: 'Planner',   icon: '📅' },
  { id: 'log',       label: 'Log',       icon: '📋' },
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function NavBar() {
  const { activeView, setActiveView, currentMonth, handleChangeMonth } = useStore()

  const prevMonth = () => {
    const m = currentMonth.month === 1 ? 12 : currentMonth.month - 1
    const y = currentMonth.month === 1 ? currentMonth.year - 1 : currentMonth.year
    handleChangeMonth(y, m)
  }
  const nextMonth = () => {
    const m = currentMonth.month === 12 ? 1 : currentMonth.month + 1
    const y = currentMonth.month === 12 ? currentMonth.year + 1 : currentMonth.year
    handleChangeMonth(y, m)
  }

  return (
    <header style={{
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      flexShrink: 0,
    }}>
      {/* Top row: logo + tabs + year nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        height: 48,
        gap: 8,
      }}>
        {/* Logo */}
        <span style={{ fontWeight: 800, fontSize: 17, color: '#f1f5f9', marginRight: 16, letterSpacing: '-0.5px' }}>
          Mop!
        </span>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 3 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              style={{
                background: activeView === tab.id ? '#3b82f6' : 'transparent',
                color: activeView === tab.id ? '#fff' : '#94a3b8',
                border: 'none',
                borderRadius: 6,
                padding: '5px 13px',
                fontSize: 13,
                fontWeight: activeView === tab.id ? 600 : 400,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                transition: 'all 0.12s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        {/* Year navigator — pushed right */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <YearBtn onClick={prevMonth}>◀</YearBtn>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', minWidth: 36, textAlign: 'center' }}>
            {currentMonth.year}
          </span>
          <YearBtn onClick={nextMonth}>▶</YearBtn>
        </div>
      </div>

      {/* Month pills row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        padding: '0 20px 8px',
      }}>
        {MONTHS.map((name, i) => {
          const month  = i + 1
          const active = currentMonth.month === month
          return (
            <button
              key={month}
              onClick={() => handleChangeMonth(currentMonth.year, month)}
              style={{
                background: active ? '#3b82f6' : 'transparent',
                color: active ? '#fff' : '#64748b',
                border: `1px solid ${active ? '#3b82f6' : '#334155'}`,
                borderRadius: 5,
                padding: '3px 9px',
                fontSize: 12,
                fontWeight: active ? 700 : 400,
                cursor: 'pointer',
                transition: 'all 0.12s',
                minWidth: 36,
                textAlign: 'center',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#e2e8f0' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#64748b' }}
            >
              {name}
            </button>
          )
        })}
      </div>
    </header>
  )
}

function YearBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent',
      color: '#64748b',
      border: '1px solid #334155',
      borderRadius: 5,
      width: 26, height: 26,
      fontSize: 11,
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {children}
    </button>
  )
}
