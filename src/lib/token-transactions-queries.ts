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

  const { data, error } = await query

  if (error) {
    console.error('Error fetching token transactions:', error)
    return []
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

  // Get active packages
  const { data: activePackages } = await supabase
    .from(TABLES.USER_PACKAGES)
    .select('tokens_remaining, tokens_held, expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', now)

  let available = 0
  let pending = 0

  for (const pkg of activePackages || []) {
    available += (pkg.tokens_remaining || 0) - (pkg.tokens_held || 0)
    pending += pkg.tokens_held || 0
  }

  // Get used tokens from transactions
  const { data: usedTransactions } = await supabase
    .from(TABLES.TOKEN_TRANSACTIONS)
    .select('tokens_change')
    .eq('user_id', userId)
    .in('transaction_type', ['attendance-consume', 'no-show-consume', 'late-cancel-consume'])
    .lt('tokens_change', 0) // Negative values

  const used = Math.abs(
    (usedTransactions || []).reduce((sum, tx) => sum + (tx.tokens_change || 0), 0)
  )

  // Get expired tokens
  const { data: expiredTransactions } = await supabase
    .from(TABLES.TOKEN_TRANSACTIONS)
    .select('tokens_change')
    .eq('user_id', userId)
    .eq('transaction_type', 'expire')
    .lt('tokens_change', 0)

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

