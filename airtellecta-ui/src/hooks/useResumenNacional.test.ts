import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('../services/api', () => ({
  apiService: {
    resumenNacional: vi.fn(),
    panelEjecutivo: vi.fn(),
  },
}))

import { apiService } from '../services/api'
import { useResumenNacional } from './useResumenNacional'

const mockResumenNacional = vi.mocked(apiService.resumenNacional)

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useResumenNacional', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna data cuando la petición es exitosa', async () => {
    const mockData = {
      prevalenciaFumadores: 16.4,
      defuncionesF17: 50000,
      usuariosVapeo: 1200000,
      urgenciasF17: 30000,
    }
    mockResumenNacional.mockResolvedValueOnce(mockData as any)

    const { result } = renderHook(() => useResumenNacional(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('retorna isError=true cuando la petición falla', async () => {
    mockResumenNacional.mockRejectedValueOnce(new Error('Error de red'))

    const { result } = renderHook(() => useResumenNacional(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('isLoading=true mientras carga', () => {
    mockResumenNacional.mockReturnValueOnce(new Promise(() => {}))

    const { result } = renderHook(() => useResumenNacional(), { wrapper: makeWrapper() })
    expect(result.current.isLoading).toBe(true)
  })
})
