import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { ClientCard } from './ClientCard'
import { ConsultantCard } from './ConsultantCard'
import type { Client, Consultant } from '../../types'

const DEFAULT_RATES = { trainee: 300, junior: 450, middle: 600, senior: 800, partner: 1200 }

function newClient(): Client {
  return {
    id: `cl_${Date.now()}`,
    name: 'New Client',
    isActive: true,
    priority: 99,
    preferredWeekday: 1,
    monthlyBudget: 10000,
    rates: { ...DEFAULT_RATES },
    team: { memberIds: [] },
    color: '#6366f1',
  }
}

function newConsultant(): Consultant {
  return {
    id: `c_${Date.now()}`,
    name: 'New Consultant',
    level: 'junior',
    monthlyCapacityDays: 20,
  }
}

export function SetupView() {
  const { clients, consultants, handleAddClient, handleAddConsultant, handleDeleteConsultant, handleDeleteClient } = useStore()
  const [pendingClientId,     setPendingClientId]     = useState<string | null>(null)
  const [pendingConsultantId, setPendingConsultantId] = useState<string | null>(null)
  const [inactiveOpen, setInactiveOpen] = useState(false)

  const activeClients   = clients.filter(c => c.isActive)
  const inactiveClients = clients.filter(c => !c.isActive)

  const addClient = () => {
    const c = newClient()
    handleAddClient(c)
    setPendingClientId(c.id)
  }

  const addConsultant = () => {
    const c = newConsultant()
    handleAddConsultant(c)
    setPendingConsultantId(c.id)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
      padding: 24,
      height: '100%',
      overflowY: 'auto',
    }}>

      {/* ── Clients ─────────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Clients" onAdd={addClient} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeClients.map(c => (
            <ClientCard
              key={c.id}
              client={c}
              autoEdit={c.id === pendingClientId}
              onCancelNew={c.id === pendingClientId ? () => {
                handleDeleteClient(c.id)
                setPendingClientId(null)
              } : undefined}
            />
          ))}
        </div>

        {/* Inactive section */}
        {inactiveClients.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={() => setInactiveOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'transparent', border: 'none',
                color: '#475569', fontSize: 12, fontWeight: 600,
                cursor: 'pointer', padding: '6px 0',
                textTransform: 'uppercase', letterSpacing: '0.06em',
              }}
            >
              <span style={{ fontSize: 10 }}>{inactiveOpen ? '▾' : '▸'}</span>
              Inactive ({inactiveClients.length})
            </button>

            {inactiveOpen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8, opacity: 0.65 }}>
                {inactiveClients.map(c => (
                  <ClientCard key={c.id} client={c} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── Consultants ─────────────────────────────────────────────────── */}
      <section>
        <SectionHeader title="Consultants" onAdd={addConsultant} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {consultants.map(c => (
            <ConsultantCard
              key={c.id}
              consultant={c}
              autoEdit={c.id === pendingConsultantId}
              onCancelNew={c.id === pendingConsultantId ? () => {
                handleDeleteConsultant(c.id)
                setPendingConsultantId(null)
              } : undefined}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHeader({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h2 style={{
        fontSize: 13, fontWeight: 600, color: '#64748b',
        textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0,
      }}>
        {title}
      </h2>
      <button
        onClick={onAdd}
        title={`Add ${title.slice(0, -1)}`}
        style={{
          background: '#3b82f622',
          color: '#3b82f6',
          border: '1px solid #3b82f644',
          borderRadius: 6,
          width: 28, height: 28,
          fontSize: 18,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  )
}
