/**
 * React Query hooks for class details
 */

import { useQuery } from '@tanstack/react-query'
import { getClassDetail, type ClassDetail } from '@/lib/class-detail-queries'

// Query keys
export const classDetailKeys = {
  all: ['class-detail'] as const,
  details: () => [...classDetailKeys.all, 'detail'] as const,
  detail: (id: string) => [...classDetailKeys.details(), id] as const,
}

/**
 * Hook to fetch a single class detail
 */
export function useClassDetail(classId: string | undefined) {
  return useQuery({
    queryKey: classDetailKeys.detail(classId || ''),
    queryFn: () => getClassDetail(classId!),
    enabled: !!classId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

