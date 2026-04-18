import { useMemo } from 'react'
import { useStore } from '../../store/useStore'
import { getUsedDays } from '../../engine/capacity'

export function UtilizationBar() {
  const { consultants, entries, clients } = useStore()

  const rows = useMemo(
    () =>
      consultants.map(c => {
        const used = getUsedDays(c.id, entries)
        const pct = Math.min((used / c.monthlyCapacityDays) * 100, 100)
        const overflow = used > c.monthlyCapacityDays

        // Break down by client
        const clientBreakdown = clients.map(cl => {
          const days = Object.values(entries).filter(
            e => e.consultantId === c.id && e.clientId === cl.id
          ).length * 0.5
          return { client: cl, days }
        }).filter(x => x.days > 0)

        return { consultant: c, used, pct, overflow, clientBreakdown }
      }),
    [consultants, entries, clients]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <h3 style={sectionTitle}>Consultant Utilization</h3>

      {rows.map(({ consultant, used, pct, overflow, clientBreakdown }) => (
        <div key={consultant.id} style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 8,
          padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>
                {consultant.name}
              </span>
              <span style={{
                fontSize: 11,
                color: '#475569',
                textTransform: 'capitalize',
                marginLeft: 8,
              }}>
                {consultant.level}
              </span>
            </div>
            <span style={{
              fontSize: 13,
              fontWeight: 700,
              color: overflow ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e',
            }}>
              {used} / {consultant.monthlyCapacityDays}d
              {overflow && ' ⚠'}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{
            height: 8,
            background: '#0f172a',
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
          }}>
            <div style={{
              height: '100%',
              width: `${pct}%`,
              background: overflow ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#22c55e',
              borderRadius: 4,
              transition: 'width 0.3s',
            }} />
          </div>

          {/* Client breakdown */}
          {clientBreakdown.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {clientBreakdown.map(({ client, days }) => (
                <span key={client.id} style={{
                  fontSize: 11,
                  background: client.color + '22',
                  color: client.color,
                  border: `1px solid ${client.color}44`,
                  borderRadius: 4,
                  padding: '2px 7px',
                }}>
                  {client.name.split(' ')[0]}: {days}d
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
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
