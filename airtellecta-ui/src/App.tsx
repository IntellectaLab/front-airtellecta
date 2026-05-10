import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardLayout } from './pages/Dashboard/DashboardLayout'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<div />} />
        <Route path="mapa" element={<div />} />
        <Route path="tendencias" element={<div />} />
        <Route path="campanas" element={<div />} />
        <Route path="fuentes" element={<div />} />
      </Route>
    </Routes>
  )
}
