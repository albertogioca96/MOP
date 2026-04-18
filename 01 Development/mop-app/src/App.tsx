import { StoreContext, buildStore } from './store/useStore'
import { NavBar } from './components/Layout/NavBar'
import { SetupView } from './components/Setup/SetupView'
import { PlannerView } from './components/Planner/PlannerView'
import { LogView } from './components/Log/LogView'
import { DashboardView } from './components/Dashboard/DashboardView'

export default function App() {
  const store = buildStore()

  return (
    <StoreContext.Provider value={store}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
        background: '#0f172a',
      }}>
        <NavBar />

        <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {store.activeView === 'setup'     && <SetupView />}
          {store.activeView === 'planner'   && <PlannerView />}
          {store.activeView === 'log'       && <LogView />}
          {store.activeView === 'dashboard' && <DashboardView />}
        </main>
      </div>
    </StoreContext.Provider>
  )
}
