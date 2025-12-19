/**
 * Notification API Routes
 * GET /api/notifications - Get user's notifications
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      persistSession: false,
    },
  }
)

interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  data?: Record<string, unknown>
  read_at?: string
  created_at: string
  updated_at: string
}

/**
 * GET /api/notifications - Get current user's notifications
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Missing authorization header' },
        { status: 401 }
      )
    }

    // Get the token from the header
    const token = authHeader.replace('Bearer ', '')

    // Verify the token by getting user data
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Get query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 100)
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

    const offset = (page - 1) * limit

    // Build the query
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Filter for unread only if requested
    if (unreadOnly) {
      query = query.is('read_at', null)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute the query
    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return NextResponse.json(
        { error: 'Server Error', message: 'Failed to fetch notifications' },
        { status: 500 }
      )
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .is('read_at', null)

    const total = count || 0

    return NextResponse.json({
      notifications: data || [],
      unreadCount: unreadCount || 0,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + (data?.length || 0) < total,
      },
    })
  } catch (error) {
    console.error('Error in notifications API:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to process request' },
      { status: 500 }
    )
  }
}
