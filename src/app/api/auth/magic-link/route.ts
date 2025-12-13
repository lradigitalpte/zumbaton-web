import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const MagicLinkRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  redirectTo: z.string().url().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = MagicLinkRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request body',
            details: parseResult.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const { email, redirectTo } = parseResult.data
    const supabase = getSupabaseClient()

    // Determine redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001')
    const finalRedirectTo = redirectTo || `${baseUrl}/magic-link-callback`

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: finalRedirectTo,
        shouldCreateUser: true, // Allow new users to sign up via magic link
      },
    })

    if (error) {
      console.error('[Magic Link] Error sending magic link:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MAGIC_LINK_ERROR',
            message: error.message || 'Failed to send magic link',
            details: error,
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Magic link sent successfully. Please check your email.',
    })
  } catch (error) {
    console.error('[Magic Link] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
          details: error,
        },
      },
      { status: 500 }
    )
  }
}

