/**
 * React Query hooks for classes and bookings
 * Provides caching, refetching, and optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUpcomingClasses, bookClass, cancelBooking, leaveWaitlist, type ClassWithAvailability } from '@/lib/classes-queries'
import { useToast } from '@/components/Toast'

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
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  })
}

/**
 * Hook to book a class
 */
export function useBookClass() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: ({ userId, classId }: { userId: string; classId: string }) =>
      bookClass(userId, classId),
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
        toast.success('Class Booked!', data.message)
      }
    },
    onError: (error: Error) => {
      toast.error('Booking Failed', error.message || 'Failed to book class. Please try again.')
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

