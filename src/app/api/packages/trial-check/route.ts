import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

/**
 * GET /api/packages/trial-check
 * Check if a user has already purchased the trial package
 * 
 * Query params:
 * - userId: User ID to check
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'userId is required' 
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()

    // First, find the trial package by name (case-insensitive)
    const { data: trialPackage, error: trialError } = await supabase
      .from('packages')
      .select('id, name')
      .ilike('name', '%trial%')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (trialError || !trialPackage) {
      // If no trial package found, return false (user can purchase)
      return NextResponse.json({
        success: true,
        data: {
          hasPurchasedTrial: false,
          trialPackageId: null,
        },
      })
    }

    // Check if user has purchased this trial package
    const { data: userTrialPurchase, error: purchaseError } = await supabase
      .from('user_packages')
      .select('id, package_id, purchased_at')
      .eq('user_id', userId)
      .eq('package_id', trialPackage.id)
      .limit(1)

    if (purchaseError) {
      console.error('[API Trial Check] Error checking user purchases:', purchaseError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check trial purchase',
          details: purchaseError.message 
        },
        { status: 500 }
      )
    }

    const hasPurchasedTrial = (userTrialPurchase && userTrialPurchase.length > 0)

    return NextResponse.json({
      success: true,
      data: {
        hasPurchasedTrial,
        trialPackageId: trialPackage.id,
        trialPackageName: trialPackage.name,
      },
    })
  } catch (error) {
    console.error('[API Trial Check] Unexpected error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
