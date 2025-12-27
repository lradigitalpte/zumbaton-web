/**
 * React Query hooks for classes and bookings
 * Uses global defaults from providers.tsx for retry logic and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUpcomingClasses, bookClass, cancelBooking, leaveWaitlist, type ClassWithAvailability } from '@/lib/classes-queries'
import { useToast } from '@/components/Toast'
import { handleApiResponse, handleBatchResponse, handleMutationError } from '@/lib/toast-helper'

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
  recurrenceType?: 'single' | 'recurring' | 'course' | 'all'
  categoryId?: string
}) {
  return useQuery({
    queryKey: classKeys.list(filters),
    queryFn: () => getUpcomingClasses(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - class availability changes frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep classes cached longer
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
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      // Show success toast
      handleApiResponse(
        { success: true, data, message: data.message || 'Your booking has been confirmed.' },
        toast,
        {
          successTitle: data.waitlistPosition ? 'Added to Waitlist' : 'Class Booked!',
          successMessage: data.waitlistPosition
            ? `You are now #${data.waitlistPosition} on the waitlist. You'll be notified if a spot opens up.`
            : data.message || 'Your booking has been confirmed.',
        }
      )
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Booking')
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
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      
      // Show success toast
      const message = data.penalty
        ? `Booking cancelled. ${data.tokensRefunded} token(s) consumed as late cancellation penalty.`
        : `Booking cancelled. ${data.tokensRefunded} token(s) refunded.`
      handleApiResponse({ success: true, message }, toast, {
        successTitle: 'Booking Cancelled',
        successMessage: message,
      })
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Cancellation')
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
      handleApiResponse({ success: true, message: 'You have been removed from the waitlist.' }, toast, {
        successTitle: 'Left Waitlist',
      })
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Waitlist removal')
    },
  })
}

/**
 * Hook to batch book multiple classes (all-or-nothing)
 */
export function useBookBatchClasses() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ userId, classIds }: { userId: string; classIds: string[] }) => {
      const adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      // Use centralized API fetch with automatic token refresh
      const { apiFetchJson } = await import('@/lib/api-fetch')
      
      try {
        const result = await apiFetchJson<{
          success: boolean;
          data?: any;
          error?: { code: string; message: string };
        }>(`${adminApiUrl}/api/bookings`, {
          method: 'POST',
          body: JSON.stringify({
            userId,
            classIds,
          }),
          requireAuth: true,
        })

        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to batch book classes')
        }

        return result.data
      } catch (error) {
        throw error instanceof Error ? error : new Error('Failed to batch book classes')
      }
    },
    onSuccess: (data, variables) => {
      // Show success toast with count
      handleBatchResponse({ success: true, data }, toast, variables.classIds.length)
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Batch booking')
    },
  })
}
