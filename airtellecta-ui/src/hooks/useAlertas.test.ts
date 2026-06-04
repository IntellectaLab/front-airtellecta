import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { evaluarAlertas, useAlertas } from './useAlertas'
import type { AlertaDefinicion } from '../types/alertas'
import type { EntidadPrevalencia } from '../types/api'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

const mockEstados: EntidadPrevalencia[] = [
  { cveEntidad: 9,  nombre: 'Ciudad de México', abreviatura: 'CDMX', prevalencia: 22, fumadoresEstimados: 1000, pobTotal: 10000, tasa100k: 200 },
  { cveEntidad: 14, nombre: 'Jalisco',           abreviatura: 'JAL',  prevalencia: 14, fumadoresEstimados: 800,  pobTotal: 8000,  tasa100k: 100 },
]

const alertaGlobal: AlertaDefinicion = {
  id:        'a1',
  nombre:    'Alta prevalencia',
  operador:  '>',
  umbral:    20,
  scope:     'cualquier_estado',
  severidad: 'rojo',
  creadaEn:  new Date().toISOString(),
}

describe('evaluarAlertas (pure function)', () => {
  it('retorna array vacío sin estados', () => {
    expect(evaluarAlertas([alertaGlobal], [])).toHaveLength(0)
    expect(evaluarAlertas([alertaGlobal], undefined)).toHaveLength(0)
  })

  it('dispara alerta cuando la prevalencia supera el umbral', () => {
    const result = evaluarAlertas([alertaGlobal], mockEstados)
    expect(result).toHaveLength(1)
    expect(result[0].estadoNombre).toBe('Ciudad de México')
    expect(result[0].valorActual).toBe(22)
  })

  it('no dispara alerta cuando la prevalencia NO supera el umbral', () => {
    const alerta: AlertaDefinicion = { ...alertaGlobal, umbral: 25 }
    const result = evaluarAlertas([alerta], mockEstados)
    expect(result).toHaveLength(0)
  })

  it('operador < dispara cuando la prevalencia es menor al umbral', () => {
    const alerta: AlertaDefinicion = { ...alertaGlobal, operador: '<', umbral: 15 }
    const result = evaluarAlertas([alerta], mockEstados)
    expect(result).toHaveLength(1)
    expect(result[0].estadoNombre).toBe('Jalisco')
  })

  it('scope estado_especifico filtra solo ese estado', () => {
    const alerta: AlertaDefinicion = {
      ...alertaGlobal,
      scope:     'estado_especifico',
      estadoCve: 9,
      umbral:    20,
    }
    const result = evaluarAlertas([alerta], mockEstados)
    expect(result).toHaveLength(1)
    expect(result[0].estadoNombre).toBe('Ciudad de México')
  })
})

describe('useAlertas (hook)', () => {
  beforeEach(() => localStorageMock.clear())

  it('inicia con alertas vacías', () => {
    const { result } = renderHook(() => useAlertas())
    expect(result.current.alertas).toHaveLength(0)
  })

  it('crearAlerta agrega una nueva alerta', () => {
    const { result } = renderHook(() => useAlertas())
    act(() => {
      result.current.crearAlerta({
        nombre:    'Test',
        operador:  '>',
        umbral:    20,
        scope:     'cualquier_estado',
        severidad: 'naranja',
      })
    })
    expect(result.current.alertas).toHaveLength(1)
    expect(result.current.alertas[0].nombre).toBe('Test')
  })

  it('eliminarAlerta quita la alerta por id', () => {
    const { result } = renderHook(() => useAlertas())
    act(() => {
      result.current.crearAlerta({ nombre: 'Test', operador: '>', umbral: 20, scope: 'cualquier_estado', severidad: 'amarillo' })
    })
    const id = result.current.alertas[0].id
    act(() => {
      result.current.eliminarAlerta(id)
    })
    expect(result.current.alertas).toHaveLength(0)
  })
})
