/**
 * Forgot Password API Route
 * POST /api/auth/forgot-password - Generate and send 6-digit OTP code via email
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient, TABLES } from '@/lib/supabase'
import { sendForgotPasswordOTPEmail } from '@/lib/email'
import { z } from 'zod'

const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

/**
 * Generate a 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * POST /api/auth/forgot-password - Generate and send OTP code
 * New OTP-based flow instead of recovery links
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = ForgotPasswordRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid email address',
          details: parseResult.error.issues 
        },
        { status: 400 }
      )
    }

    const { email } = parseResult.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user exists
    const adminClient = getSupabaseAdminClient()
    const { data: userProfile, error: userError } = await adminClient
      .from(TABLES.USER_PROFILES)
      .select('id, email, name')
      .eq('email', normalizedEmail)
      .single()

    // Return error if email is not found
    if (userError || !userProfile) {
      console.log(`[ForgotPassword] Email not found: ${email}`)
      return NextResponse.json({
        success: false,
        error: 'No account found with this email address. Please check your email and try again.',
      }, { status: 404 })
    }

    // Generate 6-digit OTP code
    const otpCode = generateOTP()
    
    // OTP expires in 15 minutes
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Delete any existing unverified OTPs for this email
    await adminClient
      .from(TABLES.PASSWORD_RESET_OTPS)
      .delete()
      .eq('email', normalizedEmail)
      .eq('verified', false)

    // Store OTP in database
    const { error: otpError } = await adminClient
      .from(TABLES.PASSWORD_RESET_OTPS)
      .insert({
        user_id: userProfile.id,
        email: normalizedEmail,
        otp_code: otpCode,
        expires_at: expiresAt.toISOString(),
        verified: false,
      })

    if (otpError) {
      console.error('[ForgotPassword] Error storing OTP:', otpError)
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a verification code has been sent.',
      })
    }

    // Get base URL for verify-otp page
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.NEXT_PUBLIC_APP_URL?.includes('localhost') ||
                         process.env.NEXT_PUBLIC_APP_URL?.includes('vercel.app')
    
    const baseUrl = isDevelopment
      ? (process.env.NEXT_PUBLIC_WEB_APP_URL || 
         process.env.NEXT_PUBLIC_APP_URL ||
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'))
      : 'https://zumbaton.sg'

    // Send OTP email using our custom email service
    try {
      await sendForgotPasswordOTPEmail({
        userEmail: userProfile.email,
        userName: userProfile.name || 'User',
        otpCode: otpCode,
        verifyUrl: `${baseUrl}/verify-otp?email=${encodeURIComponent(normalizedEmail)}`,
        expiresIn: '15 minutes',
      })
      console.log(`[ForgotPassword] OTP code sent to ${userProfile.email}`)
    } catch (emailError) {
      console.error('[ForgotPassword] Error sending OTP email:', emailError)
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a verification code has been sent.',
    })
  } catch (error) {
    console.error('[ForgotPassword] Error in forgot password endpoint:', error)
    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, a verification code has been sent.',
    })
  }
}

