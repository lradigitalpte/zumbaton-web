/**
 * Direct Supabase queries for token transactions
 */

import { getSupabaseClient, TABLES } from './supabase'
import { fetchApiData } from './client-api-utils'

export interface TokenTransaction {
  id: string
  transaction_type: string
  description: string | null
  tokens_change: number
  tokens_before: number
  tokens_after: number
  created_at: string
  booking_id?: string | null
}

export interface TokenBalanceStats {
  available: number
  pending: number
  used: number
  expired: number
}

/**
 * Get user's token transactions.
 * Uses API when in browser (faster, bypasses RLS); falls back to direct Supabase otherwise.
 */
export async function getTokenTransactions(
  userId: string,
  filter?: string
): Promise<TokenTransaction[]> {
  const params: Record<string, string> = { userId }
  if (filter && filter !== 'all') params.filter = filter
  const apiData = await fetchApiData<TokenTransaction[]>(
    '/api/token-transactions',
    params,
    'Token Transactions'
  )
  if (apiData != null && Array.isArray(apiData)) return apiData

  const supabase = getSupabaseClient()
  let query = supabase
    .from(TABLES.TOKEN_TRANSACTIONS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (filter && filter !== 'all') {
    const typeMap: Record<string, string[]> = {
      purchase: ['purchase'],
      used: ['attendance-consume', 'no-show-consume', 'late-cancel-consume'],
      refund: ['booking-release'],
      bonus: ['admin-adjust'],
      expired: ['expire'],
    }
    const transactionTypes = typeMap[filter]
    if (transactionTypes?.length) query = query.in('transaction_type', transactionTypes)
  }

  const QUERY_TIMEOUT = 15000
  let data: any, error: any
  try {
    const result = await Promise.race([
      query,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 15s')), QUERY_TIMEOUT)
      ),
    ]) as { data: any; error: any }
    data = result.data
    error = result.error
  } catch (timeoutError: any) {
    console.error('[Token Transactions] Query timeout:', timeoutError?.message)
    throw new Error(`Token transactions query timeout: ${timeoutError?.message || 'Request took too long'}`)
  }

  if (error) {
    console.error('Error fetching token transactions:', error)
    throw new Error(`Failed to fetch token transactions: ${error.message || 'Unknown error'}`)
  }

  return (data || []).map((tx: any) => ({
    id: tx.id,
    transaction_type: tx.transaction_type,
    description: tx.description || getDefaultDescription(tx.transaction_type),
    tokens_change: tx.tokens_change,
    tokens_before: tx.tokens_before,
    tokens_after: tx.tokens_after,
    created_at: tx.created_at,
    booking_id: tx.booking_id,
  }))
}

/**
 * Get token balance statistics (available, pending, used, expired).
 * Uses API when in browser (faster, bypasses RLS); falls back to direct Supabase otherwise.
 */
export async function getTokenBalanceStats(userId: string): Promise<TokenBalanceStats> {
  const apiData = await fetchApiData<TokenBalanceStats>(
    '/api/token-balance-stats',
    { userId },
    'Token Balance Stats'
  )
  if (apiData != null) return apiData

  const supabase = getSupabaseClient()
  const now = new Date().toISOString()
  const QUERY_TIMEOUT = 15000

  let activePackages: any
  try {
    const packagesResult = await Promise.race([
      supabase
        .from(TABLES.USER_PACKAGES)
        .select('tokens_remaining, tokens_held, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', now),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 15s')), QUERY_TIMEOUT)
      ),
    ]) as { data: any; error: any }
    if (packagesResult.error) throw new Error(packagesResult.error.message)
    activePackages = packagesResult.data
  } catch (timeoutError: any) {
    console.error('[Token Balance Stats] Query timeout for packages:', timeoutError?.message)
    throw new Error(`Token balance stats query timeout: ${timeoutError?.message || 'Request took too long'}`)
  }

  let available = 0
  let pending = 0
  for (const pkg of activePackages || []) {
    available += (pkg.tokens_remaining || 0) - (pkg.tokens_held || 0)
    pending += pkg.tokens_held || 0
  }

  let usedTransactions: any
  try {
    const usedResult = await Promise.race([
      supabase
        .from(TABLES.TOKEN_TRANSACTIONS)
        .select('tokens_change')
        .eq('user_id', userId)
        .in('transaction_type', ['attendance-consume', 'no-show-consume', 'late-cancel-consume'])
        .lt('tokens_change', 0),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 15s')), QUERY_TIMEOUT)
      ),
    ]) as { data: any; error: any }
    if (usedResult.error) throw new Error(usedResult.error.message)
    usedTransactions = usedResult.data
  } catch (timeoutError: any) {
    console.warn('[Token Balance Stats] Query timeout for used transactions:', timeoutError?.message)
    usedTransactions = []
  }

  const used = Math.abs(
    (usedTransactions || []).reduce((sum, tx) => sum + (tx.tokens_change || 0), 0)
  )

  let expiredTransactions: any
  try {
    const expiredResult = await Promise.race([
      supabase
        .from(TABLES.TOKEN_TRANSACTIONS)
        .select('tokens_change')
        .eq('user_id', userId)
        .eq('transaction_type', 'expire')
        .lt('tokens_change', 0),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout after 15s')), QUERY_TIMEOUT)
      ),
    ]) as { data: any; error: any }
    if (expiredResult.error) throw new Error(expiredResult.error.message)
    expiredTransactions = expiredResult.data
  } catch (timeoutError: any) {
    console.warn('[Token Balance Stats] Query timeout for expired transactions:', timeoutError?.message)
    expiredTransactions = []
  }

  const expired = Math.abs(
    (expiredTransactions || []).reduce((sum, tx) => sum + (tx.tokens_change || 0), 0)
  )

  return { available, pending, used, expired }
}

function getDefaultDescription(transactionType: string): string {
  const descriptions: Record<string, string> = {
    purchase: 'Token package purchased',
    'booking-hold': 'Tokens reserved for booking',
    'booking-release': 'Tokens released from cancelled booking',
    'attendance-consume': 'Tokens used for class attendance',
    'no-show-consume': 'Tokens consumed for no-show',
    'late-cancel-consume': 'Tokens consumed for late cancellation',
    expire: 'Tokens expired',
    refund: 'Token refund',
    'admin-adjust': 'Admin adjustment',
  }
  return descriptions[transactionType] || 'Token transaction'
}

