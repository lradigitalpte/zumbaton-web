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
  earlyBirdExpiresAt?: string | null
  earlyBirdDaysLeft?: number
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
  expiresAt?: string | null
}> {
  const supabase = getSupabaseAdmin()

  // Check if user is marked as early bird eligible
  const { data: user } = await supabase
    .from('user_profiles')
    .select('early_bird_eligible, early_bird_expires_at')
    .eq('id', userId)
    .single()

  if (!user || !user.early_bird_eligible) {
    return { eligible: false, discountPercent: 0 }
  }

  // If there's an expiry, ensure it's still valid
  if (user.early_bird_expires_at) {
    const expires = new Date(user.early_bird_expires_at)
    if (expires.getTime() <= Date.now()) {
      return { eligible: false, discountPercent: 0 }
    }
  }

  // Early Steppers promo: 10% for first N users, valid for 2 months after granted
  // Users can use this discount multiple times during the 2-month validity period
  return { eligible: true, discountPercent: 10, expiresAt: user.early_bird_expires_at || null }
}

/**
 * Claim Early Steppers promo for a new user (to be called on registration)
 * Grants early_bird_eligible and sets early_bird_expires_at for 2 months if limit not reached.
 */
export async function claimEarlySteppers(userId: string, limit = 40, months = 2): Promise<{ claimed: boolean; message?: string; expiresAt?: string | null }>{
  const supabase = getSupabaseAdmin()

  // Count current eligible users
  const { count } = await supabase
    .from('user_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('early_bird_eligible', true)

  const current = count || 0
  if (current >= limit) {
    return { claimed: false, message: 'Early Steppers limit reached' }
  }

  const now = new Date()
  const expires = new Date(now)
  expires.setMonth(expires.getMonth() + months)

  const { error } = await supabase
    .from('user_profiles')
    .update({ early_bird_eligible: true, early_bird_granted_at: now.toISOString(), early_bird_expires_at: expires.toISOString() })
    .eq('id', userId)

  if (error) {
    return { claimed: false, message: 'Failed to claim promo' }
  }

  return { claimed: true, expiresAt: expires.toISOString() }
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

  // Compute days left for early bird (if available)
  let earlyBirdDaysLeft: number | undefined = undefined
  if (earlyBird.expiresAt) {
    const expires = new Date(earlyBird.expiresAt)
    const msLeft = expires.getTime() - Date.now()
    earlyBirdDaysLeft = msLeft > 0 ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0
  }

  return {
    hasReferralDiscount: referral.eligible,
    hasEarlyBirdDiscount: earlyBird.eligible,
    referralDiscountPercent: referral.discountPercent,
    earlyBirdDiscountPercent: earlyBird.discountPercent,
    earlyBirdExpiresAt: earlyBird.expiresAt || null,
    earlyBirdDaysLeft,
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

