/**
 * React Query hooks for dashboard data
 * Uses global defaults from providers.tsx for retry logic and caching
 */

import { useQuery } from '@tanstack/react-query'
import { getTokenBalance, getUpcomingBookings, getUserStats, type TokenBalance, type UpcomingBooking, type UserStats } from '@/lib/dashboard-queries'

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  tokenBalance: (userId: string) => [...dashboardKeys.all, 'tokenBalance', userId] as const,
  upcomingBookings: (userId: string) => [...dashboardKeys.all, 'upcomingBookings', userId] as const,
  userStats: (userId: string) => [...dashboardKeys.all, 'userStats', userId] as const,
}

/**
 * Hook to fetch user's token balance
 */
export function useDashboardTokenBalance(userId: string | undefined) {
  return useQuery<TokenBalance, Error>({
    queryKey: dashboardKeys.tokenBalance(userId || ''),
    queryFn: () => getTokenBalance(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute - balance updates are important but not instant
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Uses global retry logic from providers.tsx (max 2 retries, circuit breaker)
  })
}

/**
 * Hook to fetch user's upcoming bookings
 */
export function useDashboardUpcomingBookings(userId: string | undefined) {
  return useQuery<UpcomingBooking[], Error>({
    queryKey: dashboardKeys.upcomingBookings(userId || ''),
    queryFn: () => getUpcomingBookings(userId!),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Uses global retry logic from providers.tsx
  })
}

/**
 * Hook to fetch user's stats
 */
export function useDashboardUserStats(userId: string | undefined) {
  return useQuery<UserStats, Error>({
    queryKey: dashboardKeys.userStats(userId || ''),
    queryFn: () => getUserStats(userId!),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes - stats don't change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Uses global retry logic from providers.tsx
  })
}

