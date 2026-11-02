/**
 * Email Preview API Route
 * POST /api/email/preview - Render an email template without sending it
 *
 * Used by the admin app to show staff exactly what members receive.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getStreakReminderEmailTemplate, getStreakReminderSubject } from '@/lib/email-templates'

const EMAIL_API_SECRET = process.env.EMAIL_API_SECRET || process.env.NEXT_PUBLIC_EMAIL_API_SECRET || 'change-me-in-production'

const PreviewRequestSchema = z.object({
  type: z.literal('streak-reminder'),
  secret: z.string(),
  data: z.object({
    userName: z.string().min(1),
    streakWeeks: z.number().int().positive(),
    bookUrl: z.string().url(),
  }),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parseResult = PreviewRequestSchema.safeParse(body)

  if (!parseResult.success) {
    return NextResponse.json(
      { success: false, error: 'Invalid request', details: parseResult.error.issues },
      { status: 400 }
    )
  }

  const { secret, data } = parseResult.data

  if (secret !== EMAIL_API_SECRET) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const streakWeeks = data.streakWeeks as number
  const template = getStreakReminderEmailTemplate({
    userName: data.userName as string,
    streakWeeks,
    bookUrl: data.bookUrl as string,
  })

  return NextResponse.json({
    success: true,
    subject: getStreakReminderSubject(streakWeeks),
    html: template.html,
    text: template.text,
  })
}
