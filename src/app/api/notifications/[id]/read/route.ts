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

// PATCH /api/notifications/[id]/read - Mark single notification as read
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    // Await params
    const { id } = await params
    
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

    const notificationId = id

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(notificationId)) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid notification ID format',
        },
      }, { status: 400 })
    }

    // First, verify the notification exists and belongs to the user
    const { data: notification, error: fetchError } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .select('id, user_id, read_at')
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !notification) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found',
        },
      }, { status: 404 })
    }

    // If already read, no need to update
    if (notification.read_at) {
      return NextResponse.json({
        success: true,
        data: {
          message: 'Notification already marked as read',
          readAt: notification.read_at,
        },
      })
    }

    // Mark as read
    const { data: updatedNotification, error: updateError } = await supabaseAdmin
      .from(TABLES.NOTIFICATIONS)
      .update({
        read_at: new Date().toISOString(),
        status: 'read',
      })
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .select('read_at')
      .single()

    if (updateError) {
      console.error('[API] Error marking notification as read:', updateError)
      return NextResponse.json({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to mark notification as read',
        },
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Notification marked as read',
        readAt: updatedNotification.read_at,
      },
    })

  } catch (error) {
    console.error('[API] Unexpected error in mark notification read:', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      },
    }, { status: 500 })
  }
}