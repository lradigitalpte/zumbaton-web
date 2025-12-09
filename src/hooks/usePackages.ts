/**
 * React Query hooks for token packages
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAvailablePackages, type Package } from '@/lib/packages-queries'
import { useToast } from '@/components/Toast'

// Query keys
export const packageKeys = {
  all: ['packages'] as const,
  lists: () => [...packageKeys.all, 'list'] as const,
  list: () => [...packageKeys.lists()] as const,
}

/**
 * Hook to fetch available packages
 */
export function useAvailablePackages() {
  return useQuery({
    queryKey: packageKeys.list(),
    queryFn: getAvailablePackages,
    staleTime: 5 * 60 * 1000, // 5 minutes (packages don't change often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to initiate package purchase
 * Note: This would typically redirect to payment provider
 */
export function usePurchasePackage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ packageId }: { packageId: string }) => {
      // In a real implementation, this would call a payment API
      // For now, we'll just simulate it
      return new Promise<{ checkout_url?: string }>((resolve) => {
        setTimeout(() => {
          resolve({ checkout_url: `/checkout?package=${packageId}` })
        }, 500)
      })
    },
    onSuccess: (data) => {
      // Invalidate packages (in case prices change)
      queryClient.invalidateQueries({ queryKey: packageKeys.all })
      // Invalidate token balance
      queryClient.invalidateQueries({ queryKey: ['token-balance'] })
      // Invalidate dashboard to refresh token balance
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      if (data.checkout_url) {
        toast.success('Redirecting to checkout...', 'Please complete your payment')
        // In production, redirect to payment provider
        // window.location.href = data.checkout_url
      }
    },
    onError: (error: Error) => {
      toast.error('Purchase Failed', error.message || 'Failed to initiate purchase. Please try again.')
    },
  })
}

