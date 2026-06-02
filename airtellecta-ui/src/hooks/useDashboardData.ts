import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import type { ResumenNacional, PanelEjecutivo } from '../types/api'

export interface DashboardData {
  resumen: ResumenNacional
  panel: PanelEjecutivo
}

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async (): Promise<DashboardData> => {
      const [resumen, panel] = await Promise.all([
        apiService.resumenNacional(),
        apiService.panelEjecutivo(),
      ])
      return { resumen, panel }
    },
    staleTime: 5 * 60 * 1000,
  })
}
