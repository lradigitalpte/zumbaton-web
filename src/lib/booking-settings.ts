/**
 * Fetch booking settings from system settings
 * Uses Supabase to get settings configured by admin
 */

import { getSupabaseClient } from './supabase'

export interface BookingSettings {
  maxBookingsPerUser: number
  cancellationWindow: number // hours before class for free cancellation
  noShowPenalty: boolean
  noShowPenaltyTokens: number
  waitlistEnabled: boolean
  autoConfirmBookings: boolean
  reminderHoursBefore: number
}

const DEFAULT_SETTINGS: BookingSettings = {
  maxBookingsPerUser: 5,
  cancellationWindow: 4, // 4 hours default
  noShowPenalty: true,
  noShowPenaltyTokens: 1,
  waitlistEnabled: true,
  autoConfirmBookings: true,
  reminderHoursBefore: 24,
}

/**
 * Get booking settings from system_settings table
 */
export async function getBookingSettings(): Promise<BookingSettings> {
  const supabase = getSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('settings_data')
      .eq('setting_type', 'booking')
      .maybeSingle()

    if (error) {
      console.error('Error fetching booking settings:', error)
      return DEFAULT_SETTINGS
    }

    if (!data) {
      // No settings found, return defaults
      return DEFAULT_SETTINGS
    }

    const bookingSettings = (data.settings_data as any)?.booking || {}
    
    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_SETTINGS,
      ...bookingSettings,
    }
  } catch (error) {
    console.error('Error fetching booking settings:', error)
    return DEFAULT_SETTINGS
  }
}

