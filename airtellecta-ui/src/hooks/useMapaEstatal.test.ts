import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'

vi.mock('../services/api', () => ({
  apiService: {
    mapaEstatal: vi.fn(),
  },
}))

import { apiService } from '../services/api'
import { useMapaEstatal } from './useMapaEstatal'

const mockMapaEstatal = vi.mocked(apiService.mapaEstatal)

function makeWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useMapaEstatal', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna data exitosamente', async () => {
    const mockData = [{ cveEntidad: 9, nombre: 'Ciudad de México', abreviatura: 'CDMX', prevalencia: 22.1 }]
    mockMapaEstatal.mockResolvedValueOnce(mockData as any)

    const { result } = renderHook(() => useMapaEstatal(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('pasa el parámetro sexo a apiService.mapaEstatal', async () => {
    mockMapaEstatal.mockResolvedValueOnce([] as any)

    const { result } = renderHook(() => useMapaEstatal(1), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockMapaEstatal).toHaveBeenCalledWith(1)
  })

  it('retorna isError=true cuando la petición falla', async () => {
    mockMapaEstatal.mockRejectedValueOnce(new Error('Error'))

    const { result } = renderHook(() => useMapaEstatal(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
