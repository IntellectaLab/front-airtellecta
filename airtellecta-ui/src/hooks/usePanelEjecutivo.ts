import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'

export function usePanelEjecutivo() {
  return useQuery({
    queryKey: ['panel-ejecutivo'],
    queryFn: apiService.panelEjecutivo,
  })
}
