/**
 * Direct Supabase queries for token transactions
 */

import { getSupabaseClient, TABLES } from './supabase'

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
 * Get user's token transactions
 */
export async function getTokenTransactions(
  userId: string,
  filter?: string
): Promise<TokenTransaction[]> {
  const supabase = getSupabaseClient()

  let query = supabase
    .from(TABLES.TOKEN_TRANSACTIONS)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100) // Limit to last 100 transactions

  // Apply filter if specified
  if (filter && filter !== 'all') {
    // Map filter to transaction types (can match multiple types)
    const typeMap: Record<string, string[]> = {
      purchase: ['purchase'],
      used: ['attendance-consume', 'no-show-consume', 'late-cancel-consume'],
      refund: ['booking-release'],
      bonus: ['admin-adjust'],
      expired: ['expire'],
    }
    const transactionTypes = typeMap[filter]
    if (transactionTypes && transactionTypes.length > 0) {
      query = query.in('transaction_type', transactionTypes)
    }
  }

  // Timeout protection - 15 seconds
  const QUERY_TIMEOUT = 15000
  let data: any, error: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 15s'))
      }, QUERY_TIMEOUT)
    })

    const result = await Promise.race([
      query,
      timeoutPromise,
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
 * Get token balance statistics
 */
export async function getTokenBalanceStats(userId: string): Promise<TokenBalanceStats> {
  const supabase = getSupabaseClient()
  const now = new Date().toISOString()
  const QUERY_TIMEOUT = 15000 // 15 seconds

  // Get active packages with timeout
  let activePackages: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 15s'))
      }, QUERY_TIMEOUT)
    })

    const packagesResult = await Promise.race([
      supabase
        .from(TABLES.USER_PACKAGES)
        .select('tokens_remaining, tokens_held, expires_at')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('expires_at', now),
      timeoutPromise,
    ]) as { data: any; error: any }
    
    if (packagesResult.error) {
      throw new Error(packagesResult.error.message)
    }
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

  // Get used tokens from transactions (with timeout)
  let usedTransactions: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 15s'))
      }, QUERY_TIMEOUT)
    })

    const usedResult = await Promise.race([
      supabase
        .from(TABLES.TOKEN_TRANSACTIONS)
        .select('tokens_change')
        .eq('user_id', userId)
        .in('transaction_type', ['attendance-consume', 'no-show-consume', 'late-cancel-consume'])
        .lt('tokens_change', 0),
      timeoutPromise,
    ]) as { data: any; error: any }
    
    if (usedResult.error) {
      throw new Error(usedResult.error.message)
    }
    usedTransactions = usedResult.data
  } catch (timeoutError: any) {
    console.warn('[Token Balance Stats] Query timeout for used transactions:', timeoutError?.message)
    usedTransactions = [] // Use empty array on timeout (non-critical)
  }

  const used = Math.abs(
    (usedTransactions || []).reduce((sum, tx) => sum + (tx.tokens_change || 0), 0)
  )

  // Get expired tokens (with timeout)
  let expiredTransactions: any
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error('Query timeout after 15s'))
      }, QUERY_TIMEOUT)
    })

    const expiredResult = await Promise.race([
      supabase
        .from(TABLES.TOKEN_TRANSACTIONS)
        .select('tokens_change')
        .eq('user_id', userId)
        .eq('transaction_type', 'expire')
        .lt('tokens_change', 0),
      timeoutPromise,
    ]) as { data: any; error: any }
    
    if (expiredResult.error) {
      throw new Error(expiredResult.error.message)
    }
    expiredTransactions = expiredResult.data
  } catch (timeoutError: any) {
    console.warn('[Token Balance Stats] Query timeout for expired transactions:', timeoutError?.message)
    expiredTransactions = [] // Use empty array on timeout (non-critical)
  }

  const expired = Math.abs(
    (expiredTransactions || []).reduce((sum, tx) => sum + (tx.tokens_change || 0), 0)
  )

  return {
    available,
    pending,
    used,
    expired,
  }
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

