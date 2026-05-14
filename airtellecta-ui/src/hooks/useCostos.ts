import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'

export function useCostos() {
  return useQuery({
    queryKey: ['costos'],
    queryFn: apiService.costos,
  })
}
