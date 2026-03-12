/**
 * Notification API Routes
 * GET /api/notifications - Get user's notifications
 */

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

/**
 * GET /api/notifications - Get current user's notifications
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Get query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'
    const channel = url.searchParams.get('channel') as 'email' | 'push' | 'sms' | 'in_app' | null

    const offset = (page - 1) * limit

    // Build query using admin client for reliable access
    let query = supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .select(`
        id,
        user_id,
        template_id,
        type,
        channel,
        subject,
        body,
        data,
        status,
        sent_at,
        read_at,
        error_message,
        created_at
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    if (channel) {
      query = query.eq('channel', channel)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: notifications, error, count } = await query

    if (error) {
      console.error('[API] Error fetching notifications:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch notifications',
        },
      }, { status: 500 })
    }

    // Count unread notifications separately for badge
    const { count: unreadCount, error: unreadError } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)

    if (unreadError) {
      console.warn('[API] Error counting unread notifications:', unreadError)
    }

    // Transform notifications to match interface
    const transformedNotifications = (notifications || []).map(notification => ({
      id: notification.id,
      userId: notification.user_id,
      templateId: notification.template_id,
      type: notification.type,
      channel: notification.channel,
      subject: notification.subject,
      body: notification.body,
      data: notification.data || {},
      status: notification.status,
      sentAt: notification.sent_at,
      readAt: notification.read_at,
      errorMessage: notification.error_message,
      createdAt: notification.created_at,
    }))

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: {
        data: transformedNotifications,
        unreadCount: unreadCount || 0,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    })

  } catch (error) {
    console.error('[API] Unexpected error in notifications:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
    }, { status: 500 })
  }
}
