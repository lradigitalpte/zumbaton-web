/**
 * Staff email notifications for member class bookings (admins + instructors).
 * Email failures are logged only — they never block the booking.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import {
  sendMemberBookingAdminNotificationEmail,
  sendMemberBookingTutorNotificationEmail,
} from './email'
import {
  isUserBookingConfirmationEmailEnabled,
} from './notification-preference-utils'
import { getStaffAlertRecipients } from './alert-email-recipients'

export interface MemberBookingClassData {
  title?: string | null
  name?: string | null
  scheduled_at: string
  location?: string | null
  instructor_id?: string | null
  instructor_name?: string | null
}

export interface MemberBookingStaffNotificationParams {
  memberUserId: string
  classData: MemberBookingClassData
  tokensUsed: number
  bookingId?: string
  bookingNote?: string
}

function formatClassDateTime(scheduledAt: string) {
  const classDate = new Date(scheduledAt)
  return {
    formattedDate: classDate.toLocaleDateString('en-SG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Singapore',
    }),
    formattedTime: classDate.toLocaleTimeString('en-SG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Singapore',
    }),
  }
}

export async function sendMemberBookingStaffNotifications(
  supabaseAdmin: SupabaseClient,
  params: MemberBookingStaffNotificationParams
): Promise<void> {
  try {
    const { memberUserId, classData, tokensUsed, bookingId, bookingNote } = params
    const className = classData.title || classData.name || 'Class'
    const { formattedDate, formattedTime } = formatClassDateTime(classData.scheduled_at)
    const classLocation = classData.location || 'TBA'

    const { data: memberProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('name, email, phone')
      .eq('id', memberUserId)
      .single()

    const memberName = memberProfile?.name || 'Member'
    const memberEmail = memberProfile?.email || ''
    const memberPhone = memberProfile?.phone || undefined

    const adminEmails = await getStaffAlertRecipients(supabaseAdmin)

    let instructorName = classData.instructor_name || undefined
    let tutorEmail: string | undefined

    if (classData.instructor_id) {
      const { data: instructor } = await supabaseAdmin
        .from('user_profiles')
        .select('name, email')
        .eq('id', classData.instructor_id)
        .single()

      instructorName = instructor?.name || instructorName
      tutorEmail = instructor?.email || undefined
    }

    if (tutorEmail) {
      const tutorWantsEmail = await isUserBookingConfirmationEmailEnabled(supabaseAdmin, tutorEmail)
      if (!tutorWantsEmail) {
        tutorEmail = undefined
      }
    }

    if (adminEmails.length > 0) {
      const adminResult = await sendMemberBookingAdminNotificationEmail({
        adminEmails,
        memberName,
        memberEmail,
        memberPhone,
        className,
        classDate: formattedDate,
        classTime: formattedTime,
        classLocation,
        instructorName,
        tokensUsed,
        bookingId,
        bookingNote,
      })

      if (!adminResult.success) {
        console.error('[MemberBookingNotifications] Admin email failed:', adminResult.error)
      } else {
        console.log('[MemberBookingNotifications] Admin booking email sent to', adminEmails.length, 'recipients')
      }
    }

    if (tutorEmail) {
      const tutorResult = await sendMemberBookingTutorNotificationEmail({
        tutorEmail,
        memberName,
        className,
        classDate: formattedDate,
        classTime: formattedTime,
        classLocation,
        tokensUsed,
        bookingNote,
      })

      if (!tutorResult.success) {
        console.error('[MemberBookingNotifications] Tutor email failed:', tutorResult.error)
      } else {
        console.log('[MemberBookingNotifications] Tutor booking email sent to', tutorEmail)
      }
    }
  } catch (error) {
    console.error('[MemberBookingNotifications] Failed to send staff emails:', error)
  }
}
