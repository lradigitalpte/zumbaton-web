/**
 * POST /api/bookings/[bookingId]/cancel - Member cancels their own booking
 *
 * Tokens are spent at booking time. Cancelling by 23:59 (Singapore) the day before
 * the class refunds them; same-day cancellation is not allowed.
 * Cancelling a course session cancels every remaining session dated tomorrow or later;
 * sessions happening today stay booked.
 *
 * Runs server-side so members can never change their own token balance directly.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { canCancelWithRefund, SAME_DAY_CANCEL_MESSAGE } from '@/lib/cancellation-policy'
import { refundBookingTokens } from '@/lib/token-ledger'

export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ bookingId: string }>
}

function fail(message: string, status: number) {
  return NextResponse.json({ success: false, error: { message } }, { status })
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthenticatedUser(request)
    if (!user) return fail('Unauthorized', 401)

    const { bookingId } = await params
    const body = await request.json().catch(() => ({}))
    const reason: string | null = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : null

    const supabase = getSupabaseAdminClient()

    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status, class:classes(id, title, scheduled_at, parent_class_id, recurrence_type)')
      .eq('id', bookingId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (!booking) return fail('Booking not found', 404)
    if (booking.status !== 'confirmed') return fail(`Cannot cancel booking with status: ${booking.status}`, 400)

    const classData = (Array.isArray(booking.class) ? booking.class[0] : booking.class) as {
      id: string
      title: string
      scheduled_at: string
      parent_class_id: string | null
      recurrence_type: string | null
    } | null
    if (!classData) return fail('Class information not found', 404)

    // Work out which bookings to cancel
    let bookingIds: string[]
    let keptToday = 0
    const isCourseSession = !!classData.parent_class_id && classData.recurrence_type === 'course'

    if (isCourseSession) {
      const { data: sessions, error: sessionsError } = await supabase
        .from('classes')
        .select('id, scheduled_at')
        .eq('parent_class_id', classData.parent_class_id)
        .gt('scheduled_at', new Date().toISOString())
      if (sessionsError) throw sessionsError

      const cancellableIds = (sessions || []).filter((s) => canCancelWithRefund(s.scheduled_at)).map((s) => s.id)
      keptToday = (sessions || []).length - cancellableIds.length
      if (cancellableIds.length === 0) return fail(SAME_DAY_CANCEL_MESSAGE, 400)

      const { data: courseBookings, error: courseError } = await supabase
        .from('bookings')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'confirmed')
        .in('class_id', cancellableIds)
      if (courseError) throw courseError

      bookingIds = (courseBookings || []).map((b) => b.id)
      if (bookingIds.length === 0) return fail(SAME_DAY_CANCEL_MESSAGE, 400)
    } else {
      if (!canCancelWithRefund(classData.scheduled_at)) return fail(SAME_DAY_CANCEL_MESSAGE, 400)
      bookingIds = [booking.id]
    }

    // Claim the bookings: only still-confirmed rows match, so a booking can never be refunded twice
    const now = new Date().toISOString()
    const { data: claimed, error: claimError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: now,
        cancellation_reason: reason || (isCourseSession ? 'Course cancellation' : null),
        updated_at: now,
      })
      .in('id', bookingIds)
      .eq('user_id', user.id)
      .eq('status', 'confirmed')
      .select('id, user_package_id, tokens_used')
    if (claimError) throw claimError

    const rows = claimed || []
    if (rows.length === 0) return fail('This booking was already cancelled', 409)

    let tokensRefunded = 0
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const tokens = row.tokens_used || 0
      if (!row.user_package_id || tokens <= 0) continue

      try {
        await refundBookingTokens(supabase, {
          userId: user.id,
          userPackageId: row.user_package_id,
          bookingId: row.id,
          tokens,
          description: isCourseSession
            ? 'Course session cancelled by 23:59 the day before'
            : 'Cancelled by 23:59 the day before the class',
        })
        tokensRefunded += tokens
      } catch (refundError) {
        // Put this and every not-yet-refunded booking back so the member keeps their places
        const unrefundedIds = rows.slice(i).map((r) => r.id)
        console.error('[Cancel Booking] Refund failed, restoring bookings:', unrefundedIds, refundError)
        await supabase
          .from('bookings')
          .update({ status: 'confirmed', cancelled_at: null, cancellation_reason: null, updated_at: new Date().toISOString() })
          .in('id', unrefundedIds)
        return fail('Could not refund your token. Your booking has not been cancelled — please try again.', 500)
      }
    }

    const message = isCourseSession
      ? `Course cancelled. ${tokensRefunded} token(s) refunded for ${rows.length} session(s).` +
        (keptToday > 0 ? ` ${keptToday} session(s) today stay booked.` : '')
      : `Booking cancelled. ${tokensRefunded} token(s) refunded.`

    return NextResponse.json({
      success: true,
      data: { tokensRefunded, cancelledBookings: rows.length, message },
    })
  } catch (error) {
    console.error('[Cancel Booking] Error:', error)
    return fail('Failed to cancel booking', 500)
  }
}
