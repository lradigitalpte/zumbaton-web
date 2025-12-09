/**
 * React Query hooks for token transactions
 */

import { useQuery } from '@tanstack/react-query'
import { getTokenTransactions, getTokenBalanceStats, type TokenTransaction, type TokenBalanceStats } from '@/lib/token-transactions-queries'

// Query keys
export const tokenTransactionKeys = {
  all: ['token-transactions'] as const,
  lists: () => [...tokenTransactionKeys.all, 'list'] as const,
  list: (userId: string, filter?: string) =>
    [...tokenTransactionKeys.lists(), userId, filter] as const,
  stats: (userId: string) => [...tokenTransactionKeys.all, 'stats', userId] as const,
}

/**
 * Hook to fetch token transactions
 */
export function useTokenTransactions(
  userId: string | undefined,
  filter?: string
) {
  return useQuery({
    queryKey: tokenTransactionKeys.list(userId || '', filter),
    queryFn: () => getTokenTransactions(userId!, filter),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to fetch token balance statistics
 */
export function useTokenBalanceStats(userId: string | undefined) {
  return useQuery({
    queryKey: tokenTransactionKeys.stats(userId || ''),
    queryFn: () => getTokenBalanceStats(userId!),
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

