import { NextRequest } from 'next/server'
import { getSupabaseAdminClient, TABLES } from '@/lib/supabase'
import {
  requireQueryParam,
  getQueryParam,
  successJson,
  errorJson,
  withApiHandler,
} from '@/lib/api-route-utils'

/**
 * GET /api/token-transactions?userId=...&filter=...
 * Fetches token transactions for a user. Uses admin client (bypasses RLS).
 * Called from client to avoid slow direct Supabase queries and 15s timeouts.
 */
async function getTokenTransactionsHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userIdResult = requireQueryParam(searchParams, 'userId')
  if (userIdResult.ok === false) return userIdResult.response
  const userId = userIdResult.value
  const filter = getQueryParam(searchParams, 'filter', 'all')

  const supabase = getSupabaseAdminClient()

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
    const types = typeMap[filter]
    if (types?.length) query = query.in('transaction_type', types)
  }

  const { data, error } = await query

  if (error) {
    console.error('[API Token Transactions] Error:', error)
    return errorJson(error.message, 500)
  }

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

  const transactions = (data || []).map((tx: any) => ({
    id: tx.id,
    transaction_type: tx.transaction_type,
    description: tx.description || descriptions[tx.transaction_type] || 'Token transaction',
    tokens_change: tx.tokens_change,
    tokens_before: tx.tokens_before,
    tokens_after: tx.tokens_after,
    created_at: tx.created_at,
    booking_id: tx.booking_id,
  }))

  return successJson(transactions)
}

export const GET = withApiHandler(getTokenTransactionsHandler, 'API Token Transactions')
