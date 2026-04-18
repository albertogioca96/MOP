import { useStore } from '../../store/useStore'

export function BrushTool() {
  const { clients, brushClientId, brushMode, setBrushClientId, setBrushMode } = useStore()

  const selectClient = (id: string) => {
    if (brushClientId === id) {
      setBrushClientId(null)   // deselect = no-op mode
    } else {
      setBrushClientId(id)
      setBrushMode('assign')
    }
  }

  const toggleDelete = () => {
    if (brushMode === 'delete') {
      setBrushMode('assign')
      setBrushClientId(null)
    } else {
      setBrushMode('delete')
      setBrushClientId(null)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Client buttons */}
      {clients.map(client => {
        const active = brushClientId === client.id && brushMode === 'assign'
        return (
          <button
            key={client.id}
            onClick={() => selectClient(client.id)}
            title={client.name}
            style={{
              background: active ? client.color : client.color + '22',
              color: active ? '#fff' : client.color,
              border: `1px solid ${client.color}${active ? 'ff' : '55'}`,
              borderRadius: 5,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: active ? 700 : 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              transition: 'all 0.12s',
              opacity: client.isActive ? 1 : 0.4,
            }}
          >
            <span style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: active ? '#fff' : client.color,
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {client.name.split(' ')[0]}
          </button>
        )
      })}

      {/* Separator */}
      <div style={{ width: 1, height: 20, background: '#334155', margin: '0 4px' }} />

      {/* Delete mode */}
      <button
        onClick={toggleDelete}
        title="Delete mode — click cells to remove allocation"
        style={{
          background: brushMode === 'delete' ? '#ef444422' : 'transparent',
          color: brushMode === 'delete' ? '#ef4444' : '#64748b',
          border: `1px solid ${brushMode === 'delete' ? '#ef444455' : '#334155'}`,
          borderRadius: 5,
          padding: '4px 10px',
          fontSize: 12,
          cursor: 'pointer',
          fontWeight: brushMode === 'delete' ? 700 : 400,
          transition: 'all 0.12s',
        }}
      >
        🗑 Erase
      </button>
    </div>
  )
}
