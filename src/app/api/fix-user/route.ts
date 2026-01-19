import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('[Fix] Starting fix for user:', userId)

    // Step 1: Ensure user profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (!existingProfile) {
      console.log('[Fix] Creating user profile...')
      const { error: insertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          email: 'phoenixkinh@gmail.com',
          name: 'Emma Smith',
          role: 'user',
          early_bird_eligible: false,
          early_bird_expires_at: null,
          early_bird_granted_at: null,
        })

      if (insertError) {
        console.error('[Fix] Profile insert error:', insertError)
        return NextResponse.json({ error: 'Failed to create profile', details: insertError })
      }
    }

    // Step 2: Grant Early Steppers promo
    console.log('[Fix] Granting Early Steppers promo...')
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + 2)

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        early_bird_eligible: true,
        early_bird_expires_at: expiryDate.toISOString(),
        early_bird_granted_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (updateError) {
      console.error('[Fix] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to grant promo', details: updateError })
    }

    // Step 3: Verify the fix
    const { data: updatedProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    console.log('[Fix] Success! Updated profile:', updatedProfile)

    return NextResponse.json({
      success: true,
      message: 'Early Steppers promo granted successfully!',
      profile: updatedProfile,
      expiresAt: expiryDate.toISOString(),
    })
  } catch (err) {
    console.error('[API] /api/fix-user error:', err)
    return NextResponse.json({ error: 'Internal error', details: err }, { status: 500 })
  }
}