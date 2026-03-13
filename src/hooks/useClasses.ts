/**
 * React Query hooks for classes and bookings
 * Uses global defaults from providers.tsx for retry logic and caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUpcomingClasses, bookClass, cancelBooking, leaveWaitlist, type ClassWithAvailability } from '@/lib/classes-queries'
import { useToast } from '@/components/Toast'
import { handleApiResponse, handleBatchResponse, handleMutationError } from '@/lib/toast-helper'
import { getAdminApiUrl } from '@/lib/admin-api-url'

function isTransientBookingError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  return (
    message.includes('timeout') ||
    message.includes('failed to fetch') ||
    message.includes('network') ||
    message.includes('session') ||
    message.includes('unauthorized')
  )
}

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
    queryFn: async () => {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Classes request timed out while processing'))
        }, 20000)
      })

      return Promise.race([
        getUpcomingClasses(filters),
        timeoutPromise,
      ])
    },
    staleTime: 30 * 1000, // 30 seconds (matches global default)
    gcTime: 5 * 60 * 1000, // 5 minutes cache retention
    refetchOnMount: 'always', // Prevent stale route-cache snapshots after navigation
    // Uses global retry logic from providers.tsx (max 2 retries, circuit breaker)
  })
}

/**
 * Hook to book a class
 * Calls API directly (like usePurchasePackage) to avoid lag from wrapper functions
 */
export function useBookClass() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async ({ userId, classId, className }: { userId: string; classId: string; className?: string }) => {
      const { apiFetchJson } = await import('@/lib/api-fetch')

      const attemptBooking = async (retryOn401 = true) => {
        return apiFetchJson<{
          success: boolean
          data?: {
            booking?: { id: string }
            message?: string
            waitlistPosition?: number
          }
          error?: { code?: string; message?: string }
          message?: string
        }>('/api/bookings', {
          method: 'POST',
          body: JSON.stringify({ userId, classId }),
          requireAuth: true,
          retryOn401,
          cache: 'no-store',
        })
      }

      let result = await attemptBooking(true)

      if (!result.success) {
        const firstError = new Error(result.error?.message || result.message || 'Failed to book class')

        // Fallback retry path for idle-session/network transient failures.
        if (isTransientBookingError(firstError)) {
          try {
            result = await attemptBooking(false)
          } catch {
            throw firstError
          }

          if (!result.success) {
            throw new Error(result.error?.message || result.message || 'Failed to book class')
          }
        } else {
          throw firstError
        }
      }

      return {
        ...result.data,
        bookingId: result.data?.booking?.id,
        message: result.data?.message || 'Class booked successfully!',
        className,
        waitlistPosition: result.data?.waitlistPosition,
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate all relevant queries for immediate UI updates
      queryClient.invalidateQueries({ queryKey: classKeys.lists() }) // Refresh class availability
      queryClient.invalidateQueries({ queryKey: ['dashboard'] }) // Refresh token balance & bookings
      queryClient.invalidateQueries({ queryKey: ['bookings'] }) // Refresh user bookings  
      queryClient.invalidateQueries({ queryKey: ['my-packages'] }) // Refresh package balance
      queryClient.invalidateQueries({ queryKey: ['token-transactions'] }) // Refresh transaction history
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
      // Use local API endpoint first to avoid lag
      // Use centralized API fetch with automatic token refresh
      const { apiFetchJson } = await import('@/lib/api-fetch')
      
      try {
        // Try local API first
        const result = await apiFetchJson<{
          success: boolean;
          data?: any;
          error?: { code: string; message: string };
        }>('/api/bookings', {
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
        // Fallback to admin API if local API fails
        const adminApiUrl = getAdminApiUrl()
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
        } catch (adminError) {
          throw error instanceof Error ? error : new Error('Failed to batch book classes')
        }
      }
    },
    onSuccess: (data, variables) => {
      // Show success toast with count
      const sessionCount = variables.classIds.length
      const itemWord = sessionCount === 1 ? 'session' : 'sessions'
      toast.success(
        'Bookings Confirmed!',
        `Successfully booked ${sessionCount} ${itemWord}. See you in class!`
      )
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: classKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error: Error) => {
      handleMutationError(error, toast, 'Batch booking')
    },
  })
}
