/**
 * Whether upcoming outdoor classes exist in the schedule.
 * Used to show/hide the outdoor option on the /start quick-join flow.
 */

import { createClient } from '@supabase/supabase-js'

export async function hasUpcomingOutdoorClasses(): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    const { count, error } = await supabase
      .from('classes')
      .select('id', { count: 'exact', head: true })
      .eq('is_outdoor', true)
      .in('status', ['scheduled', 'in-progress'])
      .gte('scheduled_at', new Date().toISOString())

    if (error) {
      console.error('[outdoor-availability] query failed:', error)
      return false
    }

    return (count ?? 0) > 0
  } catch (err) {
    console.error('[outdoor-availability] falling back to false:', err)
    return false
  }
}
