/**
 * React Query hooks for user bookings
 * Uses global defaults from providers.tsx for retry logic and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserBookings, type UserBooking } from '@/lib/bookings-queries'
import { cancelBooking } from '@/lib/classes-queries'
import { useToast } from '@/components/Toast'
import { handleApiResponse, handleMutationError } from '@/lib/toast-helper'

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  list: (userId: string, filter?: 'upcoming' | 'past' | 'all') =>
    [...bookingKeys.lists(), userId, filter] as const,
}

/**
 * Hook to fetch user bookings
 */
export function useUserBookings(
  userId: string | undefined,
  filter: 'upcoming' | 'past' | 'all' = 'upcoming'
) {
  return useQuery({
    queryKey: bookingKeys.list(userId || '', filter),
    queryFn: () => getUserBookings(userId!, filter),
    enabled: !!userId,
    refetchOnMount: 'always',
    staleTime: 30 * 1000, // 30 seconds - bookings change when user books/cancels
    gcTime: 2 * 60 * 1000, // 2 minutes cache retention
    // Uses global retry logic from providers.tsx (max 2 retries, circuit breaker)
  })
}

/**
 * Hook to cancel a booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ userId, bookingId, reason }: { userId: string; bookingId: string; reason?: string }) =>
      cancelBooking(userId, bookingId, reason),
    onSuccess: (data) => {
      // Invalidate all relevant queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: bookingKeys.all }) // Refresh user bookings
      queryClient.invalidateQueries({ queryKey: ['classes'] }) // Refresh class availability
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }) // Refresh token balance & bookings
      queryClient.invalidateQueries({ queryKey: ['my-packages'] }) // Refresh package balance
      queryClient.invalidateQueries({ queryKey: ['token-transactions'] }) // Refresh transaction history
      
      // Show success toast with penalty or refund message
      const message = data.penalty
        ? `Booking cancelled. ${data.tokensRefunded} token(s) consumed as late cancellation penalty.`
        : `Booking cancelled. ${data.tokensRefunded} token(s) refunded.`
      handleApiResponse({ success: true, message }, toast, {
        successTitle: 'Booking Cancelled'
      })
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Cancellation')
    },
  })
}

