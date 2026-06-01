import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PasswordInput } from './PasswordInput'

describe('PasswordInput', () => {
  it('muestra el label', () => {
    render(<PasswordInput label="Contraseña" />)
    expect(screen.getByText('Contraseña')).toBeInTheDocument()
  })

  it('el input inicia como type="password"', () => {
    render(<PasswordInput label="Contraseña" />)
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toHaveAttribute('type', 'password')
  })

  it('el botón muestra "Mostrar" inicialmente', () => {
    render(<PasswordInput label="Contraseña" />)
    expect(screen.getByRole('button', { name: 'Mostrar' })).toBeInTheDocument()
  })

  it('al hacer click en "Mostrar" cambia a type="text"', () => {
    render(<PasswordInput label="Contraseña" />)
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar' }))
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toHaveAttribute('type', 'text')
    expect(screen.getByRole('button', { name: 'Ocultar' })).toBeInTheDocument()
  })

  it('al hacer click en "Ocultar" regresa a type="password"', () => {
    render(<PasswordInput label="Contraseña" />)
    fireEvent.click(screen.getByRole('button', { name: 'Mostrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ocultar' }))
    expect(screen.getByPlaceholderText('Ingresa tu contraseña')).toHaveAttribute('type', 'password')
  })

  it('muestra el mensaje de error', () => {
    render(<PasswordInput label="Contraseña" error="Contraseña incorrecta" />)
    expect(screen.getByText('Contraseña incorrecta')).toBeInTheDocument()
  })

  it('usa el placeholder personalizado', () => {
    render(<PasswordInput label="Contraseña" placeholder="Mínimo 8 caracteres" />)
    expect(screen.getByPlaceholderText('Mínimo 8 caracteres')).toBeInTheDocument()
  })
})
