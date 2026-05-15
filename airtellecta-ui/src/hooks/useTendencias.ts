import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'

export function useTendencias() {
  return useQuery({
    queryKey: ['tendencias'],
    queryFn: apiService.tendencias,
  })
}
