import { NextRequest, NextResponse } from 'next/server'
import { TABLES } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// Initialize Supabase client for auth verification
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
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

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authenticate user
    const user = await getAuthenticatedUser(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      }, { status: 401 })
    }

    // Count unread notifications before updating
    const { count: unreadCountBefore } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)

    if (!unreadCountBefore || unreadCountBefore === 0) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'No unread notifications to mark',
          updatedCount: 0,
        },
      })
    }

    // Mark all unread notifications as read
    const { error: updateError, count: updatedCount } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .update({
        read_at: new Date().toISOString(),
        status: 'read',
      })
      .eq('user_id', user.id)
      .is('read_at', null)

    if (updateError) {
      console.error('[API] Error marking all notifications as read:', updateError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to mark all notifications as read',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `${updatedCount || unreadCountBefore} notification${(updatedCount || unreadCountBefore) !== 1 ? 's' : ''} marked as read`,
        updatedCount: updatedCount || unreadCountBefore,
      },
    })

  } catch (error) {
    console.error('[API] Unexpected error in mark all notifications read:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
    }, { status: 500 })
  }
}