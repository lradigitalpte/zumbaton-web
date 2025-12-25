/**
 * Promotion Utilities for Web App
 * Handles checking promo eligibility and applying discounts
 */

import { createClient } from '@supabase/supabase-js'

const getSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export interface PromoEligibility {
  hasReferralDiscount: boolean
  hasEarlyBirdDiscount: boolean
  referralDiscountPercent: number
  earlyBirdDiscountPercent: number
  maxDiscountPercent: number
}

export interface AppliedDiscount {
  discountPercent: number
  discountAmountCents: number
  originalAmountCents: number
  finalAmountCents: number
  promoType: 'referral' | 'early_bird' | null
}

/**
 * Check if user is eligible for referral discount (8%)
 */
export async function checkReferralEligibility(userId: string): Promise<{
  eligible: boolean
  discountPercent: number
}> {
  const supabase = getSupabaseAdmin()

  // Check if user has a referral record and hasn't used the discount
  const { data: referral } = await supabase
    .from('referrals')
    .select('id, status')
    .eq('referred_id', userId)
    .in('status', ['pending', 'completed'])
    .single()

  if (!referral) {
    return { eligible: false, discountPercent: 0 }
  }

  // Check if user has already used referral discount
  const { data: promoUsage } = await supabase
    .from('promo_usage')
    .select('id')
    .eq('user_id', userId)
    .eq('promo_type', 'referral')
    .limit(1)
    .single()

  if (promoUsage) {
    return { eligible: false, discountPercent: 0 }
  }

  return { eligible: true, discountPercent: 8 }
}

/**
 * Check if user is eligible for early bird discount (15%)
 */
export async function checkEarlyBirdEligibility(userId: string): Promise<{
  eligible: boolean
  discountPercent: number
}> {
  const supabase = getSupabaseAdmin()

  // Check if user is marked as early bird eligible
  const { data: user } = await supabase
    .from('user_profiles')
    .select('early_bird_eligible')
    .eq('id', userId)
    .single()

  if (!user || !user.early_bird_eligible) {
    return { eligible: false, discountPercent: 0 }
  }

  // Check if user has already used early bird discount
  const { data: promoUsage } = await supabase
    .from('promo_usage')
    .select('id')
    .eq('user_id', userId)
    .eq('promo_type', 'early_bird')
    .limit(1)
    .single()

  if (promoUsage) {
    return { eligible: false, discountPercent: 0 }
  }

  return { eligible: true, discountPercent: 15 }
}

/**
 * Get all available promotions for a user
 */
export async function getPromoEligibility(userId: string): Promise<PromoEligibility> {
  const [referral, earlyBird] = await Promise.all([
    checkReferralEligibility(userId),
    checkEarlyBirdEligibility(userId),
  ])

  const maxDiscountPercent = earlyBird.eligible
    ? earlyBird.discountPercent
    : referral.eligible
    ? referral.discountPercent
    : 0

  return {
    hasReferralDiscount: referral.eligible,
    hasEarlyBirdDiscount: earlyBird.eligible,
    referralDiscountPercent: referral.discountPercent,
    earlyBirdDiscountPercent: earlyBird.discountPercent,
    maxDiscountPercent,
  }
}

/**
 * Apply discount to package price
 */
export async function applyDiscount(
  userId: string,
  packagePriceCents: number,
  promoType: 'referral' | 'early_bird'
): Promise<AppliedDiscount> {
  const eligibility = await getPromoEligibility(userId)

  let discountPercent = 0
  let selectedPromoType: 'referral' | 'early_bird' | null = null

  if (promoType === 'early_bird' && eligibility.hasEarlyBirdDiscount) {
    discountPercent = eligibility.earlyBirdDiscountPercent
    selectedPromoType = 'early_bird'
  } else if (promoType === 'referral' && eligibility.hasReferralDiscount) {
    discountPercent = eligibility.referralDiscountPercent
    selectedPromoType = 'referral'
  } else {
    // Auto-select best available discount
    if (eligibility.hasEarlyBirdDiscount) {
      discountPercent = eligibility.earlyBirdDiscountPercent
      selectedPromoType = 'early_bird'
    } else if (eligibility.hasReferralDiscount) {
      discountPercent = eligibility.referralDiscountPercent
      selectedPromoType = 'referral'
    }
  }

  const discountAmountCents = Math.round((packagePriceCents * discountPercent) / 100)
  const finalAmountCents = packagePriceCents - discountAmountCents

  return {
    discountPercent,
    discountAmountCents,
    originalAmountCents: packagePriceCents,
    finalAmountCents,
    promoType: selectedPromoType,
  }
}

