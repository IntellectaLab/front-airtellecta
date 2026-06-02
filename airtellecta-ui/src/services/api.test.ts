import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocks must be declared before imports that use them
vi.mock('../firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: vi.fn().mockResolvedValue('fake-token'),
    },
    signOut: vi.fn(),
  },
}))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Import AFTER mocks are set up
import { apiService } from './api'

function mockJsonResponse(data: unknown, status = 200) {
  mockFetch.mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    blob: () => Promise.resolve(new Blob()),
  })
}

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Re-stub fetch after clearAllMocks
    vi.stubGlobal('fetch', mockFetch)
  })

  describe('resumenNacional', () => {
    it('hace GET /api/resumen-nacional y retorna data', async () => {
      const payload = {
        prevalenciaFumadores: 16.4,
        defuncionesF17: 50000,
        usuariosVapeo: 1200000,
        urgenciasF17: 30000,
      }
      mockJsonResponse({ success: true, data: payload })

      const result = await apiService.resumenNacional()
      expect(result).toEqual(payload)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/resumen-nacional'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
        })
      )
    })

    it('lanza error cuando success=false', async () => {
      mockJsonResponse({ success: false, error: 'Error del servidor' })
      await expect(apiService.resumenNacional()).rejects.toThrow('Error del servidor')
    })
  })

  describe('panelEjecutivo', () => {
    it('hace GET /api/panel-ejecutivo y retorna data', async () => {
      const payload = { totalFumadores: 15000000 }
      mockJsonResponse({ success: true, data: payload })
      const result = await apiService.panelEjecutivo()
      expect(result).toEqual(payload)
    })
  })

  describe('recaudacion', () => {
    it('hace GET /api/recaudacion y retorna array', async () => {
      const payload = [{ anio: 2023, totalMdp: 45000 }]
      mockJsonResponse({ success: true, data: payload })
      const result = await apiService.recaudacion()
      expect(result).toEqual(payload)
    })
  })

  describe('simulacion', () => {
    it('hace POST /api/simulacion con el body correcto', async () => {
      const payload = { proyeccionAnual: [] }
      mockJsonResponse({ success: true, data: payload })
      const req = { impuestoPctPrecio: 75, horizonteAnios: 10 }
      await apiService.simulacion(req as any)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/simulacion'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(req),
        })
      )
    })
  })
})
