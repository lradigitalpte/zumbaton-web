/**
 * Duo Trial (1-for-1) promo configuration.
 *
 * Reads the admin-editable values from the existing `system_settings`
 * record keyed `promotions` (same record the early-bird/referral settings
 * live in). Everything falls back to the original hardcoded values so the
 * live booking flow keeps working even if the settings are absent.
 */

import { createClient } from '@supabase/supabase-js'

export type DuoBookingMode = 'pay_online' | 'reserve_only' | 'both'

/** How much a visitor pays online up front. */
export type DuoPaymentTerms = 'full' | 'deposit' | 'none'

export interface DuoPromoConfig {
  /** Whether the 1-for-1 promo is currently offered at all. */
  active: boolean
  /** Studio (indoor) duo price, in cents. */
  indoorPriceCents: number
  /** Outdoor duo price, in cents. */
  outdoorPriceCents: number
  /** How a visitor can convert: pay online, reserve & pay at studio, or both. */
  bookingMode: DuoBookingMode
  /** Online payment terms: full price, a deposit, or nothing (pay at studio). */
  paymentTerms: DuoPaymentTerms
  /** Deposit percentage charged online when paymentTerms = 'deposit' (1–100). */
  depositPercent: number
  /** Optional promo end date (YYYY-MM-DD). null = no expiry. */
  endDate: string | null
}

/** Original hardcoded behaviour — used whenever settings are missing. */
export const DEFAULT_DUO_PROMO_CONFIG: DuoPromoConfig = {
  active: true,
  indoorPriceCents: 2300, // $23
  outdoorPriceCents: 3500, // $35
  bookingMode: 'pay_online',
  paymentTerms: 'full',
  depositPercent: 50,
  endDate: null,
}

function isBookingMode(value: unknown): value is DuoBookingMode {
  return value === 'pay_online' || value === 'reserve_only' || value === 'both'
}

function isPaymentTerms(value: unknown): value is DuoPaymentTerms {
  return value === 'full' || value === 'deposit' || value === 'none'
}

function coercePriceCents(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  // Guard against NaN / negative / absurd values; prices are stored in cents.
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000) return fallback
  return Math.round(n)
}

function coercePercent(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n) || n < 1 || n > 100) return fallback
  return Math.round(n)
}

/**
 * Map a raw `promotions` settings JSON blob to a DuoPromoConfig.
 * Exported so the public config endpoint and the payment route share one parser.
 */
export function parseDuoPromoConfig(value: Record<string, unknown> | null | undefined): DuoPromoConfig {
  if (!value || typeof value !== 'object') return { ...DEFAULT_DUO_PROMO_CONFIG }

  const endDateRaw = value.duo_end_date
  const endDate =
    typeof endDateRaw === 'string' && endDateRaw.trim().length > 0 ? endDateRaw.trim() : null

  return {
    active: typeof value.duo_promo_active === 'boolean' ? value.duo_promo_active : DEFAULT_DUO_PROMO_CONFIG.active,
    indoorPriceCents: coercePriceCents(value.duo_indoor_price_cents, DEFAULT_DUO_PROMO_CONFIG.indoorPriceCents),
    outdoorPriceCents: coercePriceCents(value.duo_outdoor_price_cents, DEFAULT_DUO_PROMO_CONFIG.outdoorPriceCents),
    bookingMode: isBookingMode(value.duo_booking_mode) ? value.duo_booking_mode : DEFAULT_DUO_PROMO_CONFIG.bookingMode,
    paymentTerms: isPaymentTerms(value.duo_payment_terms) ? value.duo_payment_terms : DEFAULT_DUO_PROMO_CONFIG.paymentTerms,
    depositPercent: coercePercent(value.duo_deposit_percent, DEFAULT_DUO_PROMO_CONFIG.depositPercent),
    endDate,
  }
}

/** True when the promo has an end date that is already in the past (SGT). */
export function isDuoPromoExpired(config: DuoPromoConfig, now: Date = new Date()): boolean {
  if (!config.endDate) return false
  // Treat end date as inclusive through end of that day in Singapore time.
  const todaySGT = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Singapore' })
  return config.endDate < todaySGT
}

/**
 * Compute what a visitor pays online now vs. owes at the studio, given the
 * total price and the configured payment terms.
 */
export function computeCharge(
  config: DuoPromoConfig,
  totalCents: number
): { chargeCents: number; balanceCents: number } {
  if (config.paymentTerms === 'none') {
    return { chargeCents: 0, balanceCents: totalCents }
  }
  if (config.paymentTerms === 'deposit') {
    const chargeCents = Math.max(1, Math.round((totalCents * config.depositPercent) / 100))
    return { chargeCents, balanceCents: Math.max(0, totalCents - chargeCents) }
  }
  // full
  return { chargeCents: totalCents, balanceCents: 0 }
}

/**
 * Server-side read of the duo promo config. Never throws — returns defaults
 * on any error so checkout is never blocked by a settings hiccup.
 */
export async function getDuoPromoConfig(): Promise<DuoPromoConfig> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'promotions')
      .single()

    if (error || !data?.value) {
      return { ...DEFAULT_DUO_PROMO_CONFIG }
    }

    return parseDuoPromoConfig(data.value as Record<string, unknown>)
  } catch (err) {
    console.error('[duo-promo-config] Falling back to defaults:', err)
    return { ...DEFAULT_DUO_PROMO_CONFIG }
  }
}
