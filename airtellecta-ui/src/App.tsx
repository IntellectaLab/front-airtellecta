import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage }       from './pages/Login/LoginPage'
import { DashboardLayout } from './pages/Dashboard/DashboardLayout'
import { ResumenNacional } from './pages/Dashboard/ResumenNacional'
import { MapaCalor }       from './pages/Dashboard/MapaCalor'
<<<<<<< Updated upstream
import { ProtectedRoute }  from './components/ProtectedRoute'
=======
import { Tendencias }      from './pages/Dashboard/Tendencias'
import { PanelEjecutivo }  from './pages/Dashboard/PanelEjecutivo'
import { Costos }          from './pages/Dashboard/Costos'
import { Simulador }       from './pages/Dashboard/Simulador'
import { Correlaciones }  from './pages/Dashboard/Correlaciones'
import { useAuth }         from './contexts/AuthContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, firebaseReady } = useAuth()
  if (loading) return null
  // Sin Firebase configurado se permite acceso para desarrollo local
  if (!firebaseReady) return <>{children}</>
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, firebaseReady } = useAuth()
  if (loading) return null
  if (!firebaseReady) return <>{children}</>
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>
}
>>>>>>> Stashed changes

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

<<<<<<< Updated upstream
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ResumenNacional />} />
        <Route path="mapa"        element={<MapaCalor />} />
        <Route path="tendencias"  element={<div />} />
        <Route path="campanas"    element={<div />} />
        <Route path="fuentes"     element={<div />} />
=======
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute><DashboardLayout /></ProtectedRoute>
      }>
        <Route index                   element={<ResumenNacional />} />
        <Route path="mapa"             element={<MapaCalor />} />
        <Route path="tendencias"       element={<Tendencias />} />
        <Route path="panel-ejecutivo"  element={<PanelEjecutivo />} />
        <Route path="costos"           element={<Costos />} />
        <Route path="simulador"        element={<Simulador />} />
        <Route path="correlaciones"    element={<Correlaciones />} />
>>>>>>> Stashed changes
      </Route>
    </Routes>
  )
}
