import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage }    from './pages/Login/LoginPage'
import { DashboardLayout } from './pages/Dashboard/DashboardLayout'
import { ResumenNacional } from './pages/Dashboard/ResumenNacional'
import { MapaCalor }       from './pages/Dashboard/MapaCalor'
import { BasesDatos }      from './pages/Dashboard/BasesDatos'
import { PanelEjecutivo }  from './pages/Dashboard/PanelEjecutivo'
import { Simulador }       from './pages/Dashboard/Simulador'
import { Correlaciones }   from './pages/Dashboard/Correlaciones'
import { AdminUsuarios }   from './pages/Dashboard/AdminUsuarios'
import { ProtectedRoute }  from './components/ProtectedRoute'
import { useAuth }         from './context/AuthContext'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index                    element={<ResumenNacional />} />
        <Route path="mapa"              element={<MapaCalor />} />
        <Route path="panel-ejecutivo"   element={<PanelEjecutivo />} />
        <Route path="simulador"         element={<Simulador />} />
        <Route path="correlaciones"     element={<Correlaciones />} />
        <Route path="bases-de-datos"    element={<BasesDatos />} />
        <Route path="usuarios"          element={<AdminUsuarios />} />
      </Route>
    </Routes>
  )
}
