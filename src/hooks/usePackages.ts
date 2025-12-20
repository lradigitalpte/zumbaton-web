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
 * Hook to initiate package purchase via HitPay
 * Creates a payment request and redirects to HitPay checkout
 */
export function usePurchasePackage() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ packageId }: { packageId: string }) => {
      // Get auth token from Supabase
      const supabase = getSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Please log in to purchase')
      }

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ packageId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment')
      }

      return data as { 
        success: boolean
        paymentUrl: string
        paymentRequestId: string
        amount: number
        currency: string
      }
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

