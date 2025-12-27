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
    staleTime: 3 * 60 * 1000, // 3 minutes - bookings can change when user books/cancels
    gcTime: 15 * 60 * 1000, // 15 minutes - keep bookings cached longer
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
      // Invalidate all booking queries
      queryClient.invalidateQueries({ queryKey: bookingKeys.all })
      // Also invalidate classes to update availability
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      // Invalidate dashboard to refresh upcoming bookings and token balance
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
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

