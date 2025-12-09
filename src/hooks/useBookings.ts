/**
 * React Query hooks for user bookings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserBookings, type UserBooking } from '@/lib/bookings-queries'
import { cancelBooking } from '@/lib/classes-queries'
import { useToast } from '@/components/Toast'

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
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
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
      
      // Show success toast
      const message = data.penalty
        ? `Booking cancelled. ${data.tokensRefunded} token(s) consumed as late cancellation penalty.`
        : `Booking cancelled. ${data.tokensRefunded} token(s) refunded.`
      toast.success('Booking Cancelled', message)
    },
    onError: (error: Error) => {
      toast.error('Cancellation Failed', error.message || 'Failed to cancel booking. Please try again.')
    },
  })
}

