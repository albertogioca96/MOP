import { useStore } from '../../store/useStore'
import { UtilizationBar } from './UtilizationBar'
import { BudgetSummary } from './BudgetSummary'

export function DashboardView() {
  const { entries, clients, currentMonth } = useStore()

  const totalSlots  = Object.keys(entries).length
  const totalDays   = totalSlots * 0.5
  const activeCount = clients.filter(c => c.isActive).length

  return (
    <div style={{ padding: 24, overflowY: 'auto', height: '100%' }}>
      {/* Header stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 16,
        marginBottom: 28,
      }}>
        <StatCard label="Active Clients"    value={activeCount}          unit="" />
        <StatCard label="Allocated Days"    value={totalDays}            unit="days" />
        <StatCard label="Month"             value={MONTH_NAMES[currentMonth.month - 1]} unit={String(currentMonth.year)} />
      </div>

      {/* Two-column layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        alignItems: 'start',
      }}>
        <UtilizationBar />
        <BudgetSummary />
      </div>
    </div>
  )
}

function StatCard({ label, value, unit }: { label: string; value: string | number; unit: string }) {
  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '14px 18px',
    }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9' }}>{value}</span>
        {unit && <span style={{ fontSize: 13, color: '#475569' }}>{unit}</span>}
      </div>
    </div>
  )
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
