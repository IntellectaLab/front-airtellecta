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
import { usePanelEjecutivo } from './usePanelEjecutivo'

const mockPanelEjecutivo = vi.mocked(apiService.panelEjecutivo)

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePanelEjecutivo', () => {
  beforeEach(() => vi.clearAllMocks())

  it('retorna data cuando la petición es exitosa', async () => {
    const mockData = { totalFumadores: 15_000_000 }
    mockPanelEjecutivo.mockResolvedValueOnce(mockData as any)

    const { result } = renderHook(() => usePanelEjecutivo(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(mockData)
  })

  it('retorna isError=true cuando la petición falla', async () => {
    mockPanelEjecutivo.mockRejectedValueOnce(new Error('Timeout'))

    const { result } = renderHook(() => usePanelEjecutivo(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
