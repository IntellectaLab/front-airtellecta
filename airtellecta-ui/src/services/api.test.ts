import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('fake-token'),
    },
    signOut: vi.fn(),
  },
}))

// Hoist mock functions so they're available inside vi.mock factory
const { mockGet, mockPost, mockPut } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request:  { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get:  mockGet,
      post: mockPost,
      put:  mockPut,
    })),
  },
}))

import { apiService } from './api'

function mockGetResponse(data: unknown) {
  mockGet.mockResolvedValueOnce({ data })
}

function mockPostResponse(data: unknown) {
  mockPost.mockResolvedValueOnce({ data })
}

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('resumenNacional', () => {
    it('hace GET /api/resumen-nacional y retorna data', async () => {
      const payload = {
        prevalenciaFumadores: 16.4,
        defuncionesF17: 50000,
        usuariosVapeo: 1200000,
        urgenciasF17: 30000,
      }
      mockGetResponse({ success: true, data: payload })

      const result = await apiService.resumenNacional()
      expect(result).toEqual(payload)
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining('/api/resumen-nacional'))
    })

    it('lanza error cuando success=false', async () => {
      mockGetResponse({ success: false, error: 'Error del servidor' })
      await expect(apiService.resumenNacional()).rejects.toThrow('Error del servidor')
    })
  })

  describe('panelEjecutivo', () => {
    it('hace GET /api/panel-ejecutivo y retorna data', async () => {
      const payload = { totalFumadores: 15000000 }
      mockGetResponse({ success: true, data: payload })
      const result = await apiService.panelEjecutivo()
      expect(result).toEqual(payload)
    })
  })

  describe('recaudacion', () => {
    it('hace GET /api/recaudacion y retorna array', async () => {
      const payload = [{ anio: 2023, totalMdp: 45000 }]
      mockGetResponse({ success: true, data: payload })
      const result = await apiService.recaudacion()
      expect(result).toEqual(payload)
    })
  })

  describe('simulacion', () => {
    it('hace POST /api/simulacion con el body correcto', async () => {
      const payload = { proyeccionAnual: [] }
      mockPostResponse({ success: true, data: payload })
      const req = { impuestoPctPrecio: 75, horizonteAnios: 10 }
      await apiService.simulacion(req as any)
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/api/simulacion'),
        req
      )
    })
  })
})
