import { NextRequest } from 'next/server'
import { getSupabaseAdminClient, TABLES } from '@/lib/supabase'
import {
  requireQueryParam,
  successJson,
  errorJson,
  withApiHandler,
} from '@/lib/api-route-utils'

/**
 * GET /api/token-balance-stats?userId=...
 * Fetches token balance stats (available, pending, used, expired) for a user.
 * Uses admin client (bypasses RLS). Called from client to avoid slow direct
 * Supabase queries and 15s timeouts.
 */
async function getTokenBalanceStatsHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userIdResult = requireQueryParam(searchParams, 'userId')
  if (userIdResult.ok === false) return userIdResult.response
  const userId = userIdResult.value

  const supabase = getSupabaseAdminClient()
  const now = new Date().toISOString()

  const { data: userPackages, error: pkgError } = await supabase
    .from(TABLES.USER_PACKAGES)
    .select('tokens_remaining, tokens_held')
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('expires_at', now)

  if (pkgError) {
    console.error('[API Token Balance Stats] Packages error:', pkgError)
    return errorJson(pkgError.message, 500)
  }

  let available = 0
  let pending = 0
  for (const pkg of userPackages || []) {
    available += (pkg.tokens_remaining || 0) - (pkg.tokens_held || 0)
    pending += pkg.tokens_held || 0
  }

  const { data: usedRows } = await supabase
    .from(TABLES.TOKEN_TRANSACTIONS)
    .select('tokens_change')
    .eq('user_id', userId)
    .in('transaction_type', ['attendance-consume', 'no-show-consume', 'late-cancel-consume'])
    .lt('tokens_change', 0)

  const used = Math.abs(
    (usedRows || []).reduce((sum, tx) => sum + (tx.tokens_change || 0), 0)
  )

  const { data: expiredRows } = await supabase
    .from(TABLES.TOKEN_TRANSACTIONS)
    .select('tokens_change')
    .eq('user_id', userId)
    .eq('transaction_type', 'expire')
    .lt('tokens_change', 0)

  const expired = Math.abs(
    (expiredRows || []).reduce((sum, tx) => sum + (tx.tokens_change || 0), 0)
  )

  return successJson({ available, pending, used, expired })
}

export const GET = withApiHandler(getTokenBalanceStatsHandler, 'API Token Balance Stats')
