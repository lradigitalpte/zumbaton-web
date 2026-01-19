import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient()
    
    console.log('[Migration] Adding early bird date columns...')
    
    // Add the missing columns
    const addColumnsQuery = `
      ALTER TABLE user_profiles
      ADD COLUMN IF NOT EXISTS early_bird_granted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS early_bird_expires_at TIMESTAMPTZ;
    `
    
    const { error: addError } = await supabase.rpc('exec_sql', { 
      sql: addColumnsQuery 
    })
    
    // Try alternative method if rpc doesn't work
    if (addError) {
      console.error('[Migration] RPC error:', addError)
      console.log('[Migration] Trying direct SQL execution...')
      
      // Use a different approach - create a stored procedure
      const { error: procError } = await supabase.rpc('exec_migration_sql', {
        migration_sql: addColumnsQuery
      })
      
      if (procError) {
        console.error('[Migration] Proc error:', procError)
        return NextResponse.json({
          error: 'Failed to add columns via SQL RPC',
          details: { addError, procError },
          manual_sql: addColumnsQuery,
          message: 'Please run this SQL manually in your database'
        }, { status: 500 })
      }
    }
    
    console.log('[Migration] Columns added successfully')
    
    // Update existing early bird eligible users with expiry dates
    const now = new Date()
    const twoMonthsFromNow = new Date()
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
    
    const updateQuery = `
      UPDATE user_profiles 
      SET 
        early_bird_granted_at = NOW(),
        early_bird_expires_at = NOW() + INTERVAL '2 months'
      WHERE early_bird_eligible = true 
      AND early_bird_expires_at IS NULL;
    `
    
    const { error: updateError } = await supabase.rpc('exec_sql', { 
      sql: updateQuery 
    })
    
    if (updateError) {
      console.error('[Migration] Update error:', updateError)
      return NextResponse.json({
        success: true,
        message: 'Columns added but failed to update existing users',
        update_sql: updateQuery,
        error: updateError
      })
    }
    
    // Add indexes
    const indexQuery = `
      CREATE INDEX IF NOT EXISTS idx_user_profiles_early_bird_expires ON user_profiles(early_bird_expires_at) WHERE early_bird_expires_at IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_user_profiles_early_bird_granted ON user_profiles(early_bird_granted_at) WHERE early_bird_granted_at IS NOT NULL;
    `
    
    await supabase.rpc('exec_sql', { sql: indexQuery })
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      expires_at: twoMonthsFromNow.toISOString(),
      updated_users: 'All early bird eligible users now have expiry dates'
    })
    
  } catch (err) {
    console.error('[Migration] Unexpected error:', err)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: err,
      manual_sql: `
        -- Add missing early bird columns to user_profiles
        ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS early_bird_granted_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS early_bird_expires_at TIMESTAMPTZ;

        -- Update existing early bird eligible users
        UPDATE user_profiles 
        SET 
          early_bird_granted_at = NOW(),
          early_bird_expires_at = NOW() + INTERVAL '2 months'
        WHERE early_bird_eligible = true 
        AND early_bird_expires_at IS NULL;

        -- Add indexes
        CREATE INDEX IF NOT EXISTS idx_user_profiles_early_bird_expires ON user_profiles(early_bird_expires_at) WHERE early_bird_expires_at IS NOT NULL;
        CREATE INDEX IF NOT EXISTS idx_user_profiles_early_bird_granted ON user_profiles(early_bird_granted_at) WHERE early_bird_granted_at IS NOT NULL;
      `
    }, { status: 500 })
  }
}