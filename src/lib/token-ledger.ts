// Server-only token helpers for bookings. Tokens are spent at booking time and
// refunded when a booking is cancelled by 23:59 (Singapore) the day before the class.
// Mirrors zumbaton-admin/src/services/token.service.ts (chargeTokensForBooking /
// recordBookingCharges / refundBookingTokens) — keep the two in sync.

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Deduct tokens from a package, only if its balance is still `tokensBefore`
 * (optimistic lock against concurrent bookings). Returns false if the balance changed.
 */
export async function chargePackage(
  supabase: SupabaseClient,
  userPackageId: string,
  tokensBefore: number,
  tokens: number
): Promise<boolean> {
  const tokensAfter = tokensBefore - tokens
  const { data, error } = await supabase
    .from('user_packages')
    .update({
      tokens_remaining: tokensAfter,
      status: tokensAfter <= 0 ? 'depleted' : 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userPackageId)
    .eq('tokens_remaining', tokensBefore)
    .select('id')

  if (error) throw error
  return !!data && data.length > 0
}

/** Write one 'booking-consume' ledger row per booking charged by chargePackage. */
export async function recordBookingCharges(
  supabase: SupabaseClient,
  params: {
    userId: string
    userPackageId: string
    tokensBefore: number
    charges: { bookingId: string; tokens: number; description: string }[]
  }
): Promise<void> {
  let balance = params.tokensBefore
  const rows = params.charges.map((charge) => {
    const row = {
      user_id: params.userId,
      user_package_id: params.userPackageId,
      booking_id: charge.bookingId,
      transaction_type: 'booking-consume',
      tokens_change: -charge.tokens,
      tokens_before: balance,
      tokens_after: balance - charge.tokens,
      description: charge.description,
    }
    balance -= charge.tokens
    return row
  })

  const { error } = await supabase.from('token_transactions').insert(rows)
  if (error) {
    // The balance is already correct; only the audit trail is missing
    console.error('[TokenLedger] Failed to record booking charges:', error)
  }
}

/**
 * Give tokens back to the package a booking was paid from.
 * Pass recordLedger: false only to undo a charge whose ledger row was never written.
 */
export async function refundBookingTokens(
  supabase: SupabaseClient,
  params: {
    userId: string
    userPackageId: string
    bookingId: string | null
    tokens: number
    description: string
    recordLedger?: boolean
  }
): Promise<void> {
  const { recordLedger = true } = params

  for (let attempt = 0; attempt < 3; attempt++) {
    const { data: pkg, error: fetchError } = await supabase
      .from('user_packages')
      .select('tokens_remaining, status, expires_at')
      .eq('id', params.userPackageId)
      .single()

    if (fetchError || !pkg) throw fetchError || new Error('User package not found')

    const tokensBefore = pkg.tokens_remaining as number
    const tokensAfter = tokensBefore + params.tokens
    // A depleted package becomes usable again; an expired one stays expired
    const isExpired = pkg.status === 'expired' || new Date(pkg.expires_at as string) < new Date()

    const { data: updated, error: updateError } = await supabase
      .from('user_packages')
      .update({
        tokens_remaining: tokensAfter,
        status: isExpired ? pkg.status : 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.userPackageId)
      .eq('tokens_remaining', tokensBefore)
      .select('id')

    if (updateError) throw updateError
    if (!updated || updated.length === 0) continue // balance changed underneath us, retry

    if (recordLedger) {
      const { error: txError } = await supabase.from('token_transactions').insert({
        user_id: params.userId,
        user_package_id: params.userPackageId,
        booking_id: params.bookingId,
        transaction_type: 'refund',
        tokens_change: params.tokens,
        tokens_before: tokensBefore,
        tokens_after: tokensAfter,
        description: params.description,
      })
      if (txError) console.error('[TokenLedger] Failed to record refund:', txError)
    }
    return
  }

  throw new Error('Token balance changed during refund. Please try again.')
}
