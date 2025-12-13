/**
 * React Query hooks for classes and bookings
 * Uses global defaults from providers.tsx for retry logic and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUpcomingClasses, bookClass, cancelBooking, leaveWaitlist, type ClassWithAvailability } from '@/lib/classes-queries'
import { useToast } from '@/components/Toast'

// Re-export type for convenience
export type { ClassWithAvailability }

// Query keys
export const classKeys = {
  all: ['classes'] as const,
  lists: () => [...classKeys.all, 'list'] as const,
  list: (filters?: { type?: string; difficulty?: string; date?: string }) => 
    [...classKeys.lists(), filters] as const,
  details: () => [...classKeys.all, 'detail'] as const,
  detail: (id: string) => [...classKeys.details(), id] as const,
}

/**
 * Hook to fetch upcoming classes with filters
 */
export function useUpcomingClasses(filters?: {
  type?: string
  difficulty?: string
  date?: string
}) {
  return useQuery({
    queryKey: classKeys.list(filters),
    queryFn: () => getUpcomingClasses(filters),
    staleTime: 60 * 1000, // 1 minute - class availability updates reasonably often
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Uses global retry logic from providers.tsx (max 2 retries, circuit breaker)
  })
}

/**
 * Hook to book a class
 */
export function useBookClass() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ userId, classId }: { userId: string; classId: string }) => {
      const result = await bookClass(userId, classId)
      if (!result.success) {
        throw new Error(result.message || 'Failed to book class')
      }
      return result
    },
    onSuccess: (data, variables) => {
      // Invalidate classes list to refresh availability
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      // Invalidate dashboard to refresh upcoming bookings and token balance
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      // Show success toast
      if (data.waitlistPosition) {
        toast.success(
          'Added to Waitlist',
          `You are now #${data.waitlistPosition} on the waitlist. You'll be notified if a spot opens up.`
        )
      } else {
        toast.success('Class Booked!', data.message || 'Your booking has been confirmed.')
      }
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Failed to book class. Please try again.'
      toast.error('Booking Failed', errorMessage)
    },
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
      // Invalidate classes list to refresh availability
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
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

/**
 * Hook to leave waitlist
 */
export function useLeaveWaitlist() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ userId, classId }: { userId: string; classId: string }) =>
      leaveWaitlist(userId, classId),
    onSuccess: () => {
      // Invalidate classes list
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      toast.success('Left Waitlist', 'You have been removed from the waitlist.')
    },
    onError: (error: Error) => {
      toast.error('Failed to Leave Waitlist', error.message || 'Please try again.')
    },
  })
}

