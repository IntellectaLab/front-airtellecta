import { useMutation } from '@tanstack/react-query'
import { apiService } from '../services/api'
import type { SimulacionRequest, SimulacionResultado } from '../types/api'

export function useSimulacion() {
  return useMutation({
    mutationFn: (req: SimulacionRequest): Promise<SimulacionResultado> =>
      apiService.simulacion(req),
  })
}
