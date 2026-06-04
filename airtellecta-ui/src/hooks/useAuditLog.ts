import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import type { AuditLogParams } from '../types/api'

export function useAuditLog(params: AuditLogParams = {}) {
  return useQuery({
    queryKey: ['audit-log', params],
    queryFn:  () => apiService.auditLog(params),
    staleTime: 30 * 1000,
  })
}
