/**
 * Test endpoint for booking API
 * GET /api/bookings/test - Quick health check
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Test 1: Database connection
    const dbStart = Date.now()
    const { data: testClass, error: dbError } = await supabaseAdmin
      .from('classes')
      .select('id, title, status')
      .eq('status', 'scheduled')
      .limit(1)
      .single()
    
    const dbTime = Date.now() - dbStart

    // Test 2: Auth check
    const authHeader = request.headers.get('authorization')
    let authStatus = 'no_token'
    let authTime = 0
    
    if (authHeader) {
      const authStart = Date.now()
      const supabaseAuth = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        { auth: { persistSession: false } }
      )
      
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)
      authTime = Date.now() - authStart
      authStatus = user ? 'valid' : 'invalid'
    }

    const totalTime = Date.now() - startTime

    return NextResponse.json({
      success: true,
      status: 'healthy',
      timings: {
        total: `${totalTime}ms`,
        database: `${dbTime}ms`,
        auth: authTime > 0 ? `${authTime}ms` : 'skipped',
      },
      checks: {
        database: dbError ? 'error' : 'ok',
        auth: authStatus,
        testClass: testClass ? testClass.title : 'none_found',
      },
      message: totalTime < 5000 
        ? 'API is responding quickly ✅' 
        : totalTime < 10000 
        ? 'API is responding but could be faster ⚠️' 
        : 'API is slow - may need optimization ❌',
    })
  } catch (error) {
    const totalTime = Date.now() - startTime
    return NextResponse.json(
      {
        success: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timing: `${totalTime}ms`,
      },
      { status: 500 }
    )
  }
}

