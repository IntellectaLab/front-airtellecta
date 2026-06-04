import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('../services/api', () => ({
  apiService: {
    simulacion: vi.fn(),
  },
}))

vi.mock('../lib/simulacionModel', () => ({
  aplicarEfectoPoliticas: vi.fn((baseline: unknown) => baseline),
}))

import { apiService } from '../services/api'
import { useSimulacion } from './useSimulacion'

const mockSimulacion = vi.mocked(apiService.simulacion)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockResultado = {
  proyeccion: [{ anio: 2025, prevalenciaPct: 16.0, fumadoresAbsolutos: 14400000, defuncionesEvitadas: 0, ahorroMdp: 0 }],
  parametrosBase: { prevalenciaBasePct: 16.0, poblacion18Plus: 90000000, fumadoresBase: 14400000, defuncionesAtribuiblesBase: 64800, impuestoActualPctPrecio: 68 },
  politicasAplicadas: [],
  resumenFinal: { prevalenciaFinalPct: 16.0, reduccionPuntosPct: 0, fumadoresEvitadosTotal: 0, defuncionesEvitadasTotal: 0, ahorroAcumuladoMdp: 0 },
  elasticidadesAplicadas: { impuestoNuevoPctPrecio: 68, incrementoPrecioPct: 0, efectoPromedioPct: 0 },
}

describe('useSimulacion', () => {
  beforeEach(() => vi.clearAllMocks())

  it('ejecuta la mutación correctamente', async () => {
    mockSimulacion.mockResolvedValueOnce(mockResultado as any)

    const { result } = renderHook(() => useSimulacion(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({ impuestoPctPrecio: 75, horizonteAnios: 10 } as any)
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockResultado)
  })

  it('isError=true cuando el backend falla sin políticas', async () => {
    mockSimulacion.mockRejectedValueOnce(new Error('Error genérico'))

    const { result } = renderHook(() => useSimulacion(), { wrapper: makeWrapper() })

    await act(async () => {
      result.current.mutate({ impuestoPctPrecio: 75, horizonteAnios: 10 } as any)
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
