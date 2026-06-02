import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../context/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'

const mockUseAuth = vi.mocked(useAuth)

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('ProtectedRoute', () => {
  it('muestra "Cargando..." cuando loading=true', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
      role: 'USER',
      mfaEnrolled: false,
      profile: null,
      logout: vi.fn(),
      getToken: vi.fn(),
      refreshMfaStatus: vi.fn(),
    })
    renderWithRouter(<ProtectedRoute><div>Contenido</div></ProtectedRoute>)
    expect(screen.getByText('Cargando...')).toBeInTheDocument()
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })

  it('renderiza children cuando hay usuario autenticado', () => {
    mockUseAuth.mockReturnValue({
      user: { uid: 'test-uid' } as any,
      loading: false,
      role: 'USER',
      mfaEnrolled: false,
      profile: null,
      logout: vi.fn(),
      getToken: vi.fn(),
      refreshMfaStatus: vi.fn(),
    })
    renderWithRouter(<ProtectedRoute><div>Contenido protegido</div></ProtectedRoute>)
    expect(screen.getByText('Contenido protegido')).toBeInTheDocument()
  })

  it('redirige a /login cuando no hay usuario', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      role: 'USER',
      mfaEnrolled: false,
      profile: null,
      logout: vi.fn(),
      getToken: vi.fn(),
      refreshMfaStatus: vi.fn(),
    })
    renderWithRouter(<ProtectedRoute><div>Contenido</div></ProtectedRoute>)
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument()
  })
})
