import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardLayout } from './pages/Dashboard/DashboardLayout'
import { ResumenNacional } from './pages/Dashboard/ResumenNacional'
import { MapaCalor }       from './pages/Dashboard/MapaCalor'
import { ProtectedRoute }  from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

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
      </Route>
    </Routes>
  )
}
