import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'

export function useResumenNacional() {
  return useQuery({
    queryKey: ['resumen-nacional'],
    queryFn: apiService.resumenNacional,
  })
}
