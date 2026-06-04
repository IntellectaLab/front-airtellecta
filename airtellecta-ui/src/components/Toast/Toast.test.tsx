import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Toast } from './Toast'

describe('Toast', () => {
  it('muestra el mensaje de éxito', () => {
    render(<Toast message="Guardado correctamente" type="success" />)
    expect(screen.getByText('Guardado correctamente')).toBeInTheDocument()
  })

  it('muestra el mensaje de error', () => {
    render(<Toast message="Ocurrió un error" type="error" />)
    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument()
  })

  it('aplica color verde en success', () => {
    const { container } = render(<Toast message="OK" type="success" />)
    const div = container.firstChild as HTMLElement
    expect(div.style.backgroundColor).toBe('rgb(220, 252, 231)')
  })

  it('aplica color rojo en error', () => {
    const { container } = render(<Toast message="Error" type="error" />)
    const div = container.firstChild as HTMLElement
    expect(div.style.backgroundColor).toBe('rgb(254, 226, 226)')
  })
})
