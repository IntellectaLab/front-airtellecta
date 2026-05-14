import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'

export function useMapaEstatal(sexo?: 1 | 2) {
  return useQuery({
    queryKey: ['mapa-estatal', sexo],
    queryFn: () => apiService.mapaEstatal(sexo),
  })
}
