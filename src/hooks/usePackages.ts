/**
 * React Query hooks for token packages
 * Uses global defaults from providers.tsx for retry logic and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAvailablePackages, type Package } from '@/lib/packages-queries'
import { useToast } from '@/components/Toast'
import { handleApiResponse, handleMutationError } from '@/lib/toast-helper'
import { getSupabaseClient } from '@/lib/supabase'

// Query keys
export const packageKeys = {
  all: ['packages'] as const,
  lists: () => [...packageKeys.all, 'list'] as const,
  list: () => [...packageKeys.lists()] as const,
}

/**
 * Hook to fetch available packages
 * @param packageType - Optional filter by 'adults' or 'kids'
 */
export function useAvailablePackages(packageType?: 'adults' | 'kids') {
  return useQuery({
    queryKey: [...packageKeys.list(), packageType || 'all'],
    queryFn: () => getAvailablePackages(packageType),
    refetchOnMount: 'always',
    staleTime: 30 * 1000, // 30 seconds - keep package pricing fresh
    gcTime: 30 * 60 * 1000, // 30 minutes cache retention
    // Uses global retry logic from providers.tsx (max 2 retries, circuit breaker)
  })
}

/**
 * Hook to initiate package purchase via HitPay
 * Creates a payment request and redirects to HitPay checkout
 */
export function usePurchasePackage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ packageId }: { packageId: string }) => {
      // Use centralized API fetch with automatic token refresh
      const { apiFetchJson } = await import('@/lib/api-fetch')
      
      const data = await apiFetchJson<{ 
        success: boolean
        paymentUrl: string
        paymentRequestId: string
        amount: number
        currency: string
      }>('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ packageId }),
        requireAuth: true,
      })

      return data
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: packageKeys.all })
      queryClient.invalidateQueries({ queryKey: ['token-balance'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      if (data.paymentUrl) {
        handleApiResponse({ success: true, message: 'Redirecting to payment...' }, toast, {
          successTitle: 'Opening checkout...'
        })
        // Redirect to HitPay checkout page
        window.location.href = data.paymentUrl
      }
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Purchase')
    },
  })
}

