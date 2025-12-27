/**
 * Notification Preferences API Route
 * GET and PUT operations for user notification preferences
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

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

  return {
    id: user.id,
    email: user.email || '',
  }
}

// Default granular preferences structure
const DEFAULT_GRANULAR_PREFERENCES = {
  booking_confirmation: { email: true, push: true, sms: false },
  booking_cancelled: { email: true, push: true, sms: false },
  booking_reminder: { email: true, push: true, sms: false },
  waitlist_promotion: { email: true, push: true, sms: false },
  no_show_warning: { email: true, push: false, sms: false },
  class_cancelled: { email: true, push: true, sms: false },
  token_purchase: { email: true, push: false, sms: false },
  token_balance_low: { email: true, push: false, sms: false },
  package_expiring: { email: true, push: true, sms: false },
  welcome: { email: true, push: false, sms: false },
  payment_successful: { email: true, push: false, sms: false },
  general: { email: true, push: false, sms: false },
}

/**
 * GET /api/settings/notifications - Get current user's notification preferences
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    // Get notification preferences
    const { data: prefs, error } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('[API /settings/notifications] Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch preferences',
        },
      }, { status: 500 })
    }

    // Map database fields to UI-friendly fields
    // Map booking_reminders to classReminders, marketing_emails to promotions
    const granularPrefs = prefs?.granular_preferences 
      ? { ...DEFAULT_GRANULAR_PREFERENCES, ...prefs.granular_preferences }
      : DEFAULT_GRANULAR_PREFERENCES

    return NextResponse.json({
      success: true,
      data: {
        classReminders: prefs?.booking_reminders ?? true,
        bookingConfirmations: granularPrefs.booking_confirmation?.email ?? true,
        promotions: prefs?.marketing_emails ?? false,
        newClasses: granularPrefs.general?.email ?? true,
        // Keep full granular structure for compatibility
        granular: granularPrefs,
      },
    })
  } catch (error) {
    console.error('[API /settings/notifications GET]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}

/**
 * PUT /api/settings/notifications - Update notification preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      classReminders,
      bookingConfirmations,
      promotions,
      newClasses,
    } = body

    // Get existing preferences to preserve granular settings
    const { data: existingPrefs } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('granular_preferences')
      .eq('user_id', user.id)
      .maybeSingle()

    const existingGranular = existingPrefs?.granular_preferences || DEFAULT_GRANULAR_PREFERENCES

    // Build update data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Map UI fields to database fields
    if (classReminders !== undefined) updateData.booking_reminders = classReminders
    if (promotions !== undefined) updateData.marketing_emails = promotions

    // Update granular preferences based on UI fields
    if (bookingConfirmations !== undefined) {
      existingGranular.booking_confirmation = {
        ...existingGranular.booking_confirmation,
        email: bookingConfirmations,
      }
    }
    if (newClasses !== undefined) {
      existingGranular.general = {
        ...existingGranular.general,
        email: newClasses,
      }
    }
    updateData.granular_preferences = { ...DEFAULT_GRANULAR_PREFERENCES, ...existingGranular }

    // Upsert preferences
    const { data, error } = await supabaseAdmin
      .from('user_notification_preferences')
      .upsert({
        user_id: user.id,
        ...updateData,
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single()

    if (error) {
      console.error('[API /settings/notifications PUT] Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update preferences',
        },
      }, { status: 500 })
    }

    const updatedGranular = data.granular_preferences || DEFAULT_GRANULAR_PREFERENCES

    return NextResponse.json({
      success: true,
      data: {
        classReminders: data.booking_reminders,
        bookingConfirmations: updatedGranular.booking_confirmation?.email ?? true,
        promotions: data.marketing_emails,
        newClasses: updatedGranular.general?.email ?? true,
        granular: updatedGranular,
      },
    })
  } catch (error) {
    console.error('[API /settings/notifications PUT]', error)
    return NextResponse.json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    }, { status: 500 })
  }
}

