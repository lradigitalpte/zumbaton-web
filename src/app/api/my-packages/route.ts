import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient, TABLES } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client for auth
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

/**
 * Get authenticated user from Authorization header
 */
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) {
    return null
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token)
  
  if (error || !user) {
    return null
  }

  return user
}

/**
 * GET /api/my-packages
 * Endpoint to fetch user's purchased packages with expiry info
 * Uses admin client for faster queries (bypasses RLS)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status') // 'active' | 'expired' | 'depleted' | 'frozen' | 'all'

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
    const now = new Date().toISOString()

    // Build query to get user packages with package details
    let query = supabase
      .from(TABLES.USER_PACKAGES)
      .select(`
        id,
        user_id,
        package_id,
        tokens_remaining,
        tokens_held,
        purchased_at,
        expires_at,
        frozen_at,
        frozen_until,
        status,
        payment_id,
        created_at,
        updated_at,
        package:${TABLES.PACKAGES}(
          id,
          name,
          description,
          token_count,
          price_cents,
          currency,
          validity_days
        )
      `)
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })

    // Filter by status in DB for frozen and depleted (these are set manually)
    // For 'expired' and 'active', we'll filter in JS after computing isExpired
    if (status && status !== 'all' && status !== 'expired' && status !== 'active') {
      query = query.eq('status', status)
    }

    const { data: userPackages, error } = await query

    if (error) {
      console.error('[API My Packages] Error fetching user packages:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch packages',
          details: error.message 
        },
        { status: 500 }
      )
    }

    // Transform data to include computed fields
    let packages = (userPackages || []).map((pkg: any) => {
      const packageData = Array.isArray(pkg.package) ? pkg.package[0] : pkg.package
      const expiresAt = new Date(pkg.expires_at)
      const nowDate = new Date(now)
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24))
      const isExpired = expiresAt < nowDate
      const isExpiringSoon = !isExpired && daysUntilExpiry <= 7
      const tokensAvailable = pkg.tokens_remaining - pkg.tokens_held
      const tokensUsed = (packageData?.token_count || 0) - pkg.tokens_remaining
      const usagePercentage = packageData?.token_count > 0 
        ? Math.round((tokensUsed / packageData.token_count) * 100) 
        : 0

      return {
        id: pkg.id,
        userId: pkg.user_id,
        packageId: pkg.package_id,
        packageName: packageData?.name || 'Unknown Package',
        packageDescription: packageData?.description || null,
        originalTokenCount: packageData?.token_count || 0,
        tokensRemaining: pkg.tokens_remaining,
        tokensHeld: pkg.tokens_held,
        tokensAvailable,
        tokensUsed,
        usagePercentage,
        purchasedAt: pkg.purchased_at,
        expiresAt: pkg.expires_at,
        daysUntilExpiry: isExpired ? 0 : Math.max(0, daysUntilExpiry),
        isExpired,
        isExpiringSoon,
        frozenAt: pkg.frozen_at,
        frozenUntil: pkg.frozen_until,
        status: pkg.status,
        paymentId: pkg.payment_id,
        createdAt: pkg.created_at,
        updatedAt: pkg.updated_at,
        priceCents: packageData?.price_cents || 0,
        currency: packageData?.currency || 'SGD',
        validityDays: packageData?.validity_days || 0,
      }
    })

    // Apply client-side filtering for 'expired' and 'active' (based on computed isExpired)
    if (status === 'expired') {
      packages = packages.filter(p => p.isExpired || p.status === 'expired')
    } else if (status === 'active') {
      packages = packages.filter(p => p.status === 'active' && !p.isExpired)
    }

    // Calculate summary stats
    const stats = {
      total: packages.length,
      active: packages.filter(p => p.status === 'active' && !p.isExpired).length,
      expired: packages.filter(p => p.status === 'expired' || p.isExpired).length,
      frozen: packages.filter(p => p.status === 'frozen').length,
      depleted: packages.filter(p => p.status === 'depleted').length,
      expiringSoon: packages.filter(p => p.isExpiringSoon).length,
    }

    return NextResponse.json({
      success: true,
      data: {
        packages,
        stats,
      },
    })
  } catch (error) {
    console.error('[API My Packages] Unexpected error:', error)
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

/**
 * DELETE /api/my-packages
 * Delete a user package (only expired or depleted packages)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const packageId = searchParams.get('packageId')

    if (!packageId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'packageId is required' 
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    const now = new Date().toISOString()

    // First, verify the package exists and belongs to the user
    const { data: userPackage, error: fetchError } = await supabase
      .from(TABLES.USER_PACKAGES)
      .select('id, user_id, status, expires_at')
      .eq('id', packageId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !userPackage) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Package not found or access denied' 
        },
        { status: 404 }
      )
    }

    // Check if package is expired or depleted
    const isExpired = new Date(userPackage.expires_at) < new Date(now)
    const isDepleted = userPackage.status === 'depleted'
    const isExpiredStatus = userPackage.status === 'expired'

    if (!isExpired && !isDepleted && !isExpiredStatus) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Only expired or depleted packages can be deleted' 
        },
        { status: 400 }
      )
    }

    // Delete the package
    const { error: deleteError } = await supabase
      .from(TABLES.USER_PACKAGES)
      .delete()
      .eq('id', packageId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('[API My Packages] Error deleting package:', deleteError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to delete package',
          details: deleteError.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Package deleted successfully',
      },
    })
  } catch (error) {
    console.error('[API My Packages] Unexpected error:', error)
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

