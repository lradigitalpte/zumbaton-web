/**
 * Email API Route
 * POST /api/email/send - Send transactional emails
 * 
 * This endpoint is used by the admin app to send emails via the web app's SMTP configuration
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  sendWelcomeEmail,
  sendTokenPurchaseEmail,
  sendTokenExpiryWarningEmail,
  sendClassReminderEmail,
  sendBookingConfirmationEmail,
  sendTokenAdjustmentEmail,
  sendAdminCreatedUserEmail,
  sendBookingCancellationEmail,
  sendWaitlistPromotionEmail,
  sendClassCancellationEmail,
  sendNoShowWarningEmail,
  sendPasswordResetEmail,
  sendForgotPasswordEmail,
  sendForgotPasswordOTPEmail,
  sendBirthdayEmail,
  sendRegistrationFormEmail,
} from '@/lib/email'

// Secret key to protect this endpoint (should match in admin app)
// Also allow NEXT_PUBLIC_EMAIL_API_SECRET for client-side calls (less secure, but needed for welcome email)
const EMAIL_API_SECRET = process.env.EMAIL_API_SECRET || process.env.NEXT_PUBLIC_EMAIL_API_SECRET || 'change-me-in-production'

const EmailRequestSchema = z.object({
  type: z.enum([
    'welcome',
    'token-purchase',
    'token-expiry',
    'class-reminder',
    'booking-confirmation',
    'token-adjustment',
    'admin-created-user',
    'booking-cancellation',
    'waitlist-promotion',
    'class-cancellation',
    'no-show-warning',
    'password-reset',
    'forgot-password',
    'forgot-password-otp',
    'birthday',
    'registration-form',
  ]),
  secret: z.string(),
  data: z.record(z.unknown()),
})

/**
 * POST /api/email/send - Send transactional email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = EmailRequestSchema.safeParse(body)

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request',
          details: parseResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { type, secret, data } = parseResult.data

    // Verify secret
    if (secret !== EMAIL_API_SECRET) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    let result

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(
          data.userEmail as string,
          data.userName as string
        )
        break

      case 'token-purchase':
        result = await sendTokenPurchaseEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          packageName: data.packageName as string,
          tokenCount: data.tokenCount as number,
          amount: data.amount as number,
          currency: data.currency as string | undefined,
          expiresAt: data.expiresAt as string,
        })
        break

      case 'token-expiry':
        result = await sendTokenExpiryWarningEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          tokensRemaining: data.tokensRemaining as number,
          expiresAt: data.expiresAt as string,
        })
        break

      case 'class-reminder':
        result = await sendClassReminderEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          className: data.className as string,
          classDate: data.classDate as string,
          classTime: data.classTime as string,
          classLocation: data.classLocation as string,
          instructorName: data.instructorName as string | undefined,
        })
        break

      case 'booking-confirmation':
        result = await sendBookingConfirmationEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          className: data.className as string,
          classDate: data.classDate as string,
          classTime: data.classTime as string,
          classLocation: data.classLocation as string,
          tokensUsed: data.tokensUsed as number,
          instructorName: data.instructorName as string | undefined,
        })
        break

      case 'token-adjustment':
        result = await sendTokenAdjustmentEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          tokensChange: data.tokensChange as number,
          newBalance: data.newBalance as number,
          reason: data.reason as string,
          adjustedBy: data.adjustedBy as string | undefined,
        })
        break

      case 'admin-created-user':
        result = await sendAdminCreatedUserEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          temporaryPassword: data.temporaryPassword as string | undefined,
          createdBy: data.createdBy as string | undefined,
        })
        break

      case 'booking-cancellation':
        result = await sendBookingCancellationEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          className: data.className as string,
          classDate: data.classDate as string,
          classTime: data.classTime as string,
          tokensRefunded: data.tokensRefunded as number,
          penalty: data.penalty as boolean | undefined,
          reason: data.reason as string | undefined,
        })
        break

      case 'waitlist-promotion':
        result = await sendWaitlistPromotionEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          className: data.className as string,
          classDate: data.classDate as string,
          confirmUrl: data.confirmUrl as string,
          expiresIn: data.expiresIn as string | undefined,
        })
        break

      case 'class-cancellation':
        result = await sendClassCancellationEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          className: data.className as string,
          classDate: data.classDate as string,
          classTime: data.classTime as string,
          tokensRefunded: data.tokensRefunded as number,
        })
        break

      case 'no-show-warning':
        result = await sendNoShowWarningEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          className: data.className as string,
          classDate: data.classDate as string,
          classTime: data.classTime as string,
          tokensConsumed: data.tokensConsumed as number,
          noShowCount: data.noShowCount as number,
          isFlagged: data.isFlagged as boolean | undefined,
        })
        break

      case 'password-reset':
        result = await sendPasswordResetEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          newPassword: data.newPassword as string,
          resetBy: data.resetBy as string | undefined,
        })
        break

      case 'forgot-password':
        result = await sendForgotPasswordEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          resetLink: data.resetLink as string,
          expiresIn: data.expiresIn as string | undefined,
        })
        break

      case 'forgot-password-otp':
        result = await sendForgotPasswordOTPEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          otpCode: data.otpCode as string,
          verifyUrl: data.verifyUrl as string | undefined,
          expiresIn: data.expiresIn as string | undefined,
        })
        break

      case 'birthday':
        result = await sendBirthdayEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          age: data.age as number | undefined,
        })
        break

      case 'registration-form':
        result = await sendRegistrationFormEmail({
          userEmail: data.userEmail as string,
          userName: data.userName as string,
          formUrl: data.formUrl as string,
        })
        break

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Unknown email type',
          },
          { status: 400 }
        )
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send email',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    })
  } catch (error) {
    console.error('Error in email API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

