import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { PrimaryButton } from './PrimaryButton'

describe('PrimaryButton', () => {
  it('renderiza el label', () => {
    render(<PrimaryButton label="Guardar" />)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('llama onClick al hacer click', () => {
    const onClick = vi.fn()
    render(<PrimaryButton label="Guardar" onClick={onClick} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('cuando disabled=true, el botón está deshabilitado y NO llama onClick', () => {
    const onClick = vi.fn()
    render(<PrimaryButton label="Guardar" disabled onClick={onClick} />)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    fireEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('sin onClick no lanza error al hacer click', () => {
    render(<PrimaryButton label="Click" />)
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
  })
})
