import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import { apiFetchJson } from '@/lib/api-fetch'

export interface MyPackage {
  id: string
  userId: string
  packageId: string
  packageName: string
  packageDescription: string | null
  originalTokenCount: number
  tokensRemaining: number
  tokensHeld: number
  tokensAvailable: number
  tokensUsed: number
  usagePercentage: number
  purchasedAt: string
  expiresAt: string
  daysUntilExpiry: number
  isExpired: boolean
  isExpiringSoon: boolean
  frozenAt: string | null
  frozenUntil: string | null
  status: 'active' | 'expired' | 'depleted' | 'frozen' | 'refunded'
  paymentId: string | null
  createdAt: string
  updatedAt: string
  priceCents: number
  currency: string
  validityDays: number
}

export interface MyPackagesStats {
  total: number
  active: number
  expired: number
  frozen: number
  depleted: number
  expiringSoon: number
}

export interface MyPackagesResponse {
  packages: MyPackage[]
  stats: MyPackagesStats
}

const myPackagesKeys = {
  all: ['my-packages'] as const,
  lists: () => [...myPackagesKeys.all, 'list'] as const,
  list: (userId: string | undefined, status?: string) => [...myPackagesKeys.lists(), userId, status] as const,
}

export function useMyPackages(status?: 'active' | 'expired' | 'depleted' | 'frozen' | 'all') {
  const { user } = useAuth()

  return useQuery({
    queryKey: myPackagesKeys.list(user?.id, status),
    queryFn: async (): Promise<MyPackagesResponse> => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 12000)

      const params = new URLSearchParams()
      params.append('userId', user.id)
      if (status) {
        params.append('status', status)
      }

      let response: { success: boolean; data: MyPackagesResponse }
      try {
        response = await apiFetchJson<{ success: boolean; data: MyPackagesResponse }>(
          `/api/my-packages?${params.toString()}`,
          {
            method: 'GET',
            requireAuth: true,
            signal: controller.signal,
            cache: 'no-store',
          }
        )
      } catch (error: any) {
        if (error?.name === 'AbortError') {
          throw new Error('My Packages request timed out. Please retry.')
        }
        throw error
      } finally {
        clearTimeout(timeoutId)
      }

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch packages')
      }

      return response.data
    },
    enabled: !!user?.id,
    refetchOnMount: true,
    staleTime: 2 * 60 * 1000, // 2 minutes - package balance changes after booking
    gcTime: 5 * 60 * 1000, // 5 minutes cache retention
  })
}

export function useDeletePackage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (packageId: string) => {
      if (!user?.id) {
        throw new Error('User not authenticated')
      }

      const response = await apiFetchJson<{ success: boolean; data: { message: string } }>(
        `/api/my-packages?packageId=${packageId}`,
        {
          method: 'DELETE',
          requireAuth: true,
        }
      )

      if (!response.success) {
        const errorMessage = (response as any).error?.message || (response as any).error || 'Failed to delete package'
        throw new Error(errorMessage)
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate packages queries to refresh the list
      queryClient.invalidateQueries({ queryKey: myPackagesKeys.all })
    },
  })
}

