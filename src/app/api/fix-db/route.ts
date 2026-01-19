import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = getSupabaseAdminClient()
    
    console.log('[Fix DB] Adding missing early bird columns...')
    
    // Add missing columns using raw SQL
    const { error: addColumnsError } = await supabase.rpc('sql', {
      query: `
        ALTER TABLE user_profiles
        ADD COLUMN IF NOT EXISTS early_bird_granted_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS early_bird_expires_at TIMESTAMPTZ;
      `
    })
    
    if (addColumnsError) {
      console.error('[Fix DB] Error adding columns:', addColumnsError)
      
      // Try alternative approach using direct SQL execution
      const { error: sqlError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
      
      if (sqlError && sqlError.message?.includes('early_bird_expires_at')) {
        // Columns don't exist, we need to add them manually
        console.log('[Fix DB] Columns confirmed missing, they need to be added via database migration')
        
        // For now, let's just update all eligible users with an expiry date
        const twoMonthsFromNow = new Date()
        twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
        
        // Update Emma Smith specifically
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ 
            early_bird_eligible: true
          })
          .eq('id', 'b2a8cf91-a59b-4b8a-8c69-b19ca8bde200')
        
        if (updateError) {
          console.error('[Fix DB] Error updating Emma:', updateError)
          return NextResponse.json({ 
            error: 'Failed to update user', 
            details: updateError,
            message: 'The early_bird_expires_at column needs to be added to the database. Please run the migration.'
          }, { status: 500 })
        }
        
        return NextResponse.json({
          success: true,
          message: 'User updated, but early_bird_expires_at column still needs to be added to database',
          action_needed: 'Run database migration to add early_bird_expires_at column'
        })
      }
      
      return NextResponse.json({ error: 'Failed to add columns', details: addColumnsError }, { status: 500 })
    }
    
    console.log('[Fix DB] Columns added successfully, now updating existing users...')
    
    // Update existing early bird eligible users
    const now = new Date()
    const twoMonthsFromNow = new Date()
    twoMonthsFromNow.setMonth(twoMonthsFromNow.getMonth() + 2)
    
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        early_bird_granted_at: now.toISOString(),
        early_bird_expires_at: twoMonthsFromNow.toISOString()
      })
      .eq('early_bird_eligible', true)
      .is('early_bird_expires_at', null)
    
    if (updateError) {
      console.error('[Fix DB] Error updating users:', updateError)
      return NextResponse.json({ error: 'Failed to update users', details: updateError }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database fixed and early bird users updated',
      expires_at: twoMonthsFromNow.toISOString()
    })
    
  } catch (err) {
    console.error('[Fix DB] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err }, { status: 500 })
  }
}