import { useMutation } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { aplicarEfectoPoliticas } from '../lib/simulacionModel'
import type { SimulacionRequest, SimulacionResultado } from '../types/api'

/**
 * Intenta el request completo al backend.
 * Si el backend devuelve 400 con políticas incluidas (bug conocido del endpoint),
 * reintenta sin políticas para obtener el baseline y aplica los efectos de
 * políticas localmente usando evidencia epidemiológica (MPOWER/OPS).
 */
async function ejecutarSimulacion(req: SimulacionRequest): Promise<SimulacionResultado> {
  try {
    return await apiService.simulacion(req)
  } catch (err: unknown) {
    const status = (err as { response?: { status?: number } }).response?.status

    if (status === 400 && req.politicas?.length) {
      const baseline = await apiService.simulacion({
        politicas:         undefined,
        impuestoPctPrecio: req.impuestoPctPrecio,
        horizonteAnios:    req.horizonteAnios,
      })
      return aplicarEfectoPoliticas(baseline, req.politicas)
    }

    throw err
  }
}

export function useSimulacion() {
  return useMutation({
    mutationFn: ejecutarSimulacion,
  })
}
