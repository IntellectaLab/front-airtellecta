import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormInput } from './FormInput'

describe('FormInput', () => {
  it('muestra el label', () => {
    render(<FormInput label="Correo electrónico" />)
    expect(screen.getByText('Correo electrónico')).toBeInTheDocument()
  })

  it('renderiza el input con placeholder', () => {
    render(<FormInput label="Email" placeholder="usuario@tec.mx" />)
    expect(screen.getByPlaceholderText('usuario@tec.mx')).toBeInTheDocument()
  })

  it('usa type="text" por defecto', () => {
    render(<FormInput label="Nombre" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })

  it('usa el type proporcionado', () => {
    render(<FormInput label="Email" type="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email')
  })

  it('muestra mensaje de error cuando se provee error', () => {
    render(<FormInput label="Nombre" error="El campo es requerido" />)
    expect(screen.getByText('El campo es requerido')).toBeInTheDocument()
  })

  it('NO muestra mensaje de error cuando no hay error', () => {
    render(<FormInput label="Nombre" />)
    expect(screen.queryByText(/requerido/i)).not.toBeInTheDocument()
  })

  it('aplica defaultValue correctamente', () => {
    render(<FormInput label="Nombre" value="Eduardo" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.defaultValue).toBe('Eduardo')
  })
})
