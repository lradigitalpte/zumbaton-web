/**
 * Public member signup (passwordless)
 * POST /api/auth/signup
 *
 * Sends a magic link that creates the auth user on first click. Name + phone are
 * attached as user metadata (options.data) so the handle_new_user trigger can
 * persist them on the new user_profiles row, along with signup_source = 'public'.
 *
 * No password is collected. The guest trial-booking flow is unrelated to this.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { z } from 'zod'

const SignupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(50),
  /** Optional post-login destination (defaults to onboarding for new users). */
  next: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SignupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid request body',
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      )
    }

    const { name, email, phone, next } = parsed.data
    const supabase = getSupabaseClient()

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')

    // New users land on onboarding; the callback also enforces this based on
    // onboarding_completed, so `next` is just an optional override.
    const callbackUrl = `${baseUrl}/magic-link-callback${
      next ? `?redirectTo=${encodeURIComponent(next)}` : ''
    }`

    const { error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase().trim(),
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
        data: {
          name: name.trim(),
          phone: phone.trim(),
          signup_source: 'public',
          role: 'user',
        },
      },
    })

    if (error) {
      console.error('[Signup] Error sending signup link:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SIGNUP_ERROR',
            message: error.message || 'Failed to send signup link',
          },
        },
        { status: 500 }
      )
    }

    // Generic success regardless of whether the email already existed
    // (avoids email enumeration; an existing user simply gets a login link).
    return NextResponse.json({
      success: true,
      message: 'Check your email for a link to finish signing up.',
    })
  } catch (error) {
    console.error('[Signup] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' },
      },
      { status: 500 }
    )
  }
}
