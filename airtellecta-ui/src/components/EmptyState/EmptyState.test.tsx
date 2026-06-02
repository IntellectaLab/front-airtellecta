import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('muestra el título y descripción', () => {
    render(<EmptyState title="Sin datos" description="No hay registros." />)
    expect(screen.getByRole('heading', { name: 'Sin datos' })).toBeInTheDocument()
    expect(screen.getByText('No hay registros.')).toBeInTheDocument()
  })

  it('renderiza con distintos textos', () => {
    render(<EmptyState title="Vacío" description="Intenta más tarde." />)
    expect(screen.getByRole('heading', { name: 'Vacío' })).toBeInTheDocument()
    expect(screen.getByText('Intenta más tarde.')).toBeInTheDocument()
  })
})
