/**
 * React Query hooks for token packages
 * Uses global defaults from providers.tsx for retry logic and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAvailablePackages, type Package } from '@/lib/packages-queries'
import { useToast } from '@/components/Toast'
import { handleApiResponse, handleMutationError } from '@/lib/toast-helper'

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
    staleTime: 10 * 60 * 1000, // 10 minutes (packages rarely change)
    gcTime: 30 * 60 * 1000, // 30 minutes - keep packages cached longer
    // Uses global retry logic from providers.tsx (max 2 retries, circuit breaker)
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
        handleApiResponse({ success: true, message: 'Please complete your payment' }, toast, {
          successTitle: 'Redirecting to checkout...'
        })
        // In production, redirect to payment provider
        // window.location.href = data.checkout_url
      }
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Purchase')
    },
  })
}

