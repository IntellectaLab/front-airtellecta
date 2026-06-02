import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ErrorBanner } from './ErrorBanner'

describe('ErrorBanner', () => {
  it('muestra el mensaje de error', () => {
    render(<ErrorBanner message="Error al cargar datos" />)
    expect(screen.getByText('Error al cargar datos')).toBeInTheDocument()
  })

  it('tiene role=alert', () => {
    render(<ErrorBanner message="Fallo" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('NO muestra botón cuando no hay actionLabel', () => {
    render(<ErrorBanner message="Error" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('muestra el botón de acción cuando se provee actionLabel', () => {
    render(<ErrorBanner message="Error" actionLabel="Reintentar" onAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('llama onAction al hacer click en el botón', () => {
    const onAction = vi.fn()
    render(<ErrorBanner message="Error" actionLabel="Reintentar" onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('tiene data-testid="error-banner"', () => {
    render(<ErrorBanner message="Error" />)
    expect(screen.getByTestId('error-banner')).toBeInTheDocument()
  })
})
