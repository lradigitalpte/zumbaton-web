/**
 * HitPay Webhook Handler for Web App
 * POST /api/payments/webhook - Handle HitPay payment confirmations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const HITPAY_SALT = process.env.HITPAY_SALT
const UNLIMITED_TOKEN_BALANCE = 2147483647

/**
 * Verify HitPay webhook signature using HMAC-SHA256
 */
function verifyHitPayWebhook(
  payload: Record<string, string | null>,
  providedHmac: string
): boolean {
  if (!HITPAY_SALT) {
    console.error('[Webhook] HITPAY_SALT is not configured')
    return false
  }

  // Remove hmac from payload for verification
  const dataToSign = { ...payload }
  delete dataToSign.hmac

  // Sort keys alphabetically and concatenate values
  const sortedKeys = Object.keys(dataToSign).sort()
  const signatureSource = sortedKeys
    .map((key) => dataToSign[key] ?? '')
    .join('')

  // Generate HMAC-SHA256
  const calculatedHmac = crypto
    .createHmac('sha256', HITPAY_SALT)
    .update(signatureSource)
    .digest('hex')

  // Debug logging (only in development or when signature fails)
  if (calculatedHmac !== providedHmac) {
    console.error('[Webhook] HMAC mismatch:', {
      calculated: calculatedHmac,
      provided: providedHmac,
      signatureSource: signatureSource.substring(0, 100) + '...',
      sortedKeys: sortedKeys,
      saltLength: HITPAY_SALT.length,
    })
  }

  return calculatedHmac === providedHmac
}

/**
 * POST /api/payments/webhook - Handle HitPay webhook
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // HitPay sends data as form-urlencoded
    const formData = await request.formData()

    // Convert FormData to object
    const payload: Record<string, string | null> = {}
    formData.forEach((value, key) => {
      payload[key] = value?.toString() || null
    })

    console.log('[Webhook] Received payload:', {
      payment_id: payload.payment_id,
      payment_request_id: payload.payment_request_id,
      status: payload.status,
      amount: payload.amount,
      currency: payload.currency,
      reference_number: payload.reference_number,
    })

    // Verify HMAC signature
    const providedHmac = payload.hmac
    if (!providedHmac) {
      console.error('[Webhook] Missing HMAC signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const isValid = verifyHitPayWebhook(payload, providedHmac)
    if (!isValid) {
      console.error('[Webhook] Invalid HMAC signature')
      console.error('[Webhook] Payload keys:', Object.keys(payload))
      console.error('[Webhook] HITPAY_SALT configured:', !!HITPAY_SALT, 'Length:', HITPAY_SALT?.length)
      
      // In sandbox, we can be more lenient for testing
      // But still log the error
      const isSandbox = process.env.HITPAY_ENV === 'sandbox' || process.env.NEXT_PUBLIC_HITPAY_ENV === 'sandbox'
      
      if (!isSandbox) {
        // In production, reject invalid signatures
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      } else {
        // In sandbox, log but continue (for testing)
        console.warn('[Webhook] Sandbox mode: Continuing despite invalid HMAC (for testing)')
      }
    }

    // Extract payment details
    const {
      payment_id,
      payment_request_id,
      status,
      amount,
    } = payload

    if (!payment_request_id || !status) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Connect to Supabase with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const isPaymentCompleted = status === 'completed' || status === 'succeeded'
    if (isPaymentCompleted) {
      // Get the payment record
      const { data: payment, error: fetchError } = await supabase
        .from('payments')
        .select('*, packages(*), classes(*)')
        .eq('hitpay_payment_request_id', payment_request_id)
        .single()

      if (fetchError || !payment) {
        console.error('[Webhook] Payment not found:', {
          payment_request_id,
          fetchError: fetchError?.message,
          hint: 'Ensure payments.hitpay_payment_request_id matches HitPay payment_request_id from webhook',
        })
        return NextResponse.json({ received: true })
      }

      // Check if payment was already processed (avoid duplicates)
      if (payment.status === 'succeeded' || payment.status === 'completed') {
        console.log('[Webhook] Payment already processed:', payment.id)
        return NextResponse.json({ received: true, message: 'Already processed' })
      }

      const metadata = (payment.metadata as Record<string, any>) || {}
      const flowType = metadata.flow_type

      // Handle ZumFiesta guest checkout flow
      if (flowType === 'zt_fiesta') {
        console.log('[Webhook] Processing ZumFiesta payment:', payment.id)

        await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            hitpay_payment_id: payment_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        const enrollmentId = metadata.enrollment_id as string | undefined
        if (enrollmentId) {
          const now = new Date().toISOString()
          const existingNotes = typeof metadata.notes === 'string' ? metadata.notes : ''
          const paymentTrail = `Paid via HitPay at ${now}`
          const mergedNotes = existingNotes ? `${existingNotes} | ${paymentTrail}` : paymentTrail

          await supabase
            .from('manual_class_enrollments')
            .update({
              payment_status: 'paid',
              notes: mergedNotes,
            })
            .eq('id', enrollmentId)
        }

        console.log('[Webhook] ZumFiesta booking completed:', payment.id)
        return NextResponse.json({ received: true, message: 'ZumFiesta booking processed' })
      }

      // Handle ZumFamilia flow (class booking with guest details + payment, or custom schedule)
      if (flowType === 'zumfamilia') {
        console.log('[Webhook] Processing ZumFamilia payment:', payment.id)

        await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            hitpay_payment_id: payment_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        const draftBookingId = metadata.draft_booking_id as string | undefined
        if (draftBookingId) {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_id: payment.id,
              booked_at: new Date().toISOString(),
            })
            .eq('id', draftBookingId)
        } else {
          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_id: payment.id,
              booked_at: new Date().toISOString(),
            })
            .eq('payment_id', payment.id)
            .eq('status', 'draft')
        }

        const { data: zumBooking } = await supabase
          .from('bookings')
          .select('id, guest_name, guest_email')
          .eq('payment_id', payment.id)
          .maybeSingle()

        if (zumBooking) {
          void Promise.resolve(
            supabase.from('token_transactions').insert({
              user_id: null,
              booking_id: zumBooking.id,
              transaction_type: 'trial-booking-purchase',
              tokens_change: 1,
              tokens_before: 0,
              tokens_after: 1,
              description: `ZumFamilia booking: ${metadata.class_title || 'Custom Schedule'} (${zumBooking.guest_name || 'Guest'})`,
            })
          ).then(() => {
            console.log('[Webhook] Created ZumFamilia token transaction for booking:', zumBooking.id)
          }).catch((err: unknown) => {
            console.error('[Webhook] Non-critical: failed to create ZumFamilia token transaction:', err)
          })
        }

        console.log('[Webhook] ZumFamilia booking completed:', payment.id)
        return NextResponse.json({ received: true, message: 'ZumFamilia booking processed' })
      }

      // Handle Quick Join / Fast Trial (pay-first, no class) — staff schedule the guest later
      if (flowType === 'quick_join' || flowType === 'quick_trial') {
        console.log('[Webhook] Processing pay-first lead:', payment.id, flowType)

        await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            hitpay_payment_id: payment_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        const guestName = (metadata.guest_name as string) || 'Guest'
        const guestEmail = (metadata.guest_email as string) || ''
        const guestPhone = (metadata.guest_phone as string) || ''
        const venueLabel = (metadata.promo_label as string) || (flowType === 'quick_trial' ? 'Fast trial' : '1-for-1')
        const preferredNote = (metadata.preferred_note as string) || ''
        const balanceCents = typeof metadata.balance_cents === 'number' ? metadata.balance_cents : 0
        const balanceSuffix = balanceCents > 0 ? ` Balance $${(balanceCents / 100).toFixed(2)} due at studio.` : ''

        // In-app notification for admins: a paid lead that needs scheduling
        try {
          const { data: adminUsers } = await supabase
            .from('user_profiles')
            .select('id, email')
            .in('role', ['admin', 'super_admin'])
            .eq('is_active', true)

          if (adminUsers && adminUsers.length > 0) {
            const noteSuffix = preferredNote ? ` · Prefers: ${preferredNote}` : ''
            await supabase.from('notifications').insert(
              adminUsers.map((admin) => ({
                user_id: admin.id,
                type: 'trial_booking',
                channel: 'in_app',
                subject: 'PAID — schedule this guest',
                body: `${guestName} paid $${(payment.amount_cents / 100).toFixed(2)} for ${venueLabel}.${balanceSuffix} Contact ${guestPhone || guestEmail} to arrange their class.${noteSuffix}`,
                status: 'sent',
                sent_at: new Date().toISOString(),
                data: {
                  payment_id: payment.id,
                  flow_type: flowType,
                  needs_scheduling: true,
                  venue: metadata.venue,
                  guest_name: guestName,
                  guest_email: guestEmail,
                  guest_phone: guestPhone,
                  preferred_note: preferredNote,
                  amount: payment.amount_cents / 100,
                },
              }))
            )
          }

          // Email alert to staff so they act even without opening the dashboard
          const { sendSuccessfulPaymentAlertEmail } = await import('@/lib/email')
          await sendSuccessfulPaymentAlertEmail({
            paymentId: payment.id,
            paymentType: 'trial-booking',
            source: 'webhook',
            amount: payment.amount_cents / 100,
            currency: payment.currency,
            guestName,
            guestEmail,
            className: `${venueLabel} — NEEDS SCHEDULING${balanceSuffix}${preferredNote ? ` (prefers: ${preferredNote})` : ''}`,
          })
        } catch (notifyErr) {
          console.error('[Webhook] Non-critical: quick_join staff notification failed:', notifyErr)
        }

        console.log('[Webhook] Quick Join payment completed:', payment.id)
        return NextResponse.json({ received: true, message: 'Quick Join processed' })
      }

      // Handle trial booking vs package purchase
      if (payment.is_trial_booking && payment.class_id) {
        // TRIAL BOOKING FLOW
        console.log('[Webhook] Processing trial booking payment:', payment.id)
        
        // Get class details
        let classData = payment.classes
        if (!classData && payment.class_id) {
          const { data: classDataResult, error: classError } = await supabase
            .from('classes')
            .select('*')
            .eq('id', payment.class_id)
            .single()
          
          if (classError) {
            console.error('[Webhook] Failed to fetch class:', classError)
            return NextResponse.json({ received: true, error: 'Class not found' })
          }
          classData = classDataResult
        }

        if (!classData) {
          console.error('[Webhook] Class not found for trial booking:', payment.id)
          return NextResponse.json({ received: true, error: 'Class not found' })
        }

        // Extract guest info from metadata (duo trial stores payer on participant1)
        const metadata = payment.metadata as Record<string, unknown> || {}
        const duoP1 = metadata.participant1 as { name?: string; email?: string; phone?: string } | undefined
        const isDuoTrial = metadata.flow_type === 'duo_trial'
        const duoP2 = metadata.participant2 as { name?: string } | undefined

        let guestName = (metadata.guest_name as string) || duoP1?.name || 'Guest'
        let guestEmail = (metadata.guest_email as string) || duoP1?.email || ''
        const guestPhone = (metadata.guest_phone as string) || duoP1?.phone || ''
        const guestDateOfBirth = (metadata.guest_date_of_birth as string) || null

        if (isDuoTrial && duoP2?.name) {
          guestName = `${guestName} & ${duoP2.name} (Duo Trial)`
        }

        if (!guestEmail || guestEmail.includes('@guest.onestepfitness.sg')) {
          console.error('[Webhook] Real guest email missing for trial booking:', payment.id)
          return NextResponse.json({ received: true, error: 'Guest email missing' })
        }

        // Update payment status
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            hitpay_payment_id: payment_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payment.id)

        if (updateError) {
          console.error('[Webhook] Failed to update payment status:', updateError)
          return NextResponse.json({ received: true, error: 'Failed to update payment' })
        }

        // Check if draft bookings exist: metadata.draft_booking_id(s) or bookings linked by payment_id
        let draftBookingIds: string[] = []
        if (typeof metadata.draft_booking_id === 'string') {
          draftBookingIds = [metadata.draft_booking_id]
        }
        if (Array.isArray(metadata.draft_booking_ids)) {
          draftBookingIds = Array.from(
            new Set([
              ...draftBookingIds,
              ...metadata.draft_booking_ids.filter((id): id is string => typeof id === 'string'),
            ])
          )
        }
        
        // Also look for any other draft bookings linked to this payment
        const { data: byPayment } = await supabase
          .from('bookings')
          .select('id')
          .eq('payment_id', payment.id)
          .eq('status', 'draft')
          .eq('is_trial_booking', true)
        
        if (byPayment && byPayment.length > 0) {
          const foundIds = byPayment.map(b => b.id)
          // Merge and remove duplicates
          draftBookingIds = Array.from(new Set([...draftBookingIds, ...foundIds]))
        }

        let firstBooking
        let bookingError

        if (draftBookingIds.length > 0) {
          const { data: updatedBookings, error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_id: payment.id,
              booked_at: new Date().toISOString(),
            })
            .in('id', draftBookingIds)
            .select()

          if (updatedBookings && updatedBookings.length > 0) {
            firstBooking = updatedBookings[0]
            console.log(`[Webhook] Updated ${updatedBookings.length} draft booking(s) to confirmed for payment:`, payment.id)
          }
          bookingError = updateError

          if (bookingError) {
            console.error('[Webhook] Failed to update draft bookings:', bookingError)
          }
        }

        // If no draft bookings or update failed, check for existing confirmed bookings
        if (!firstBooking) {
          const { data: existingBookings } = await supabase
            .from('bookings')
            .select('id, status, guest_name, guest_email')
            .eq('class_id', payment.class_id)
            .in('status', ['confirmed', 'attended', 'draft'])
            // We can't easily filter by guest_email here if there are multiple, 
            // but we can check if any are already confirmed for this payment
            .eq('payment_id', payment.id)

          if (existingBookings && existingBookings.length > 0) {
            const confirmed = existingBookings.filter(b => b.status === 'confirmed' || b.status === 'attended')
            if (confirmed.length > 0) {
              firstBooking = confirmed[0]
              console.log('[Webhook] Bookings already confirmed for trial:', payment.id)
              return NextResponse.json({ received: true, message: 'Bookings already confirmed' })
            }
          }
        }

        if (!firstBooking) {
          const { data: newBooking, error: createError } = await supabase
            .from('bookings')
            .insert({
              class_id: payment.class_id,
              guest_name: guestName,
              guest_email: guestEmail,
              guest_phone: guestPhone,
              guest_date_of_birth: guestDateOfBirth,
              is_trial_booking: true,
              payment_id: payment.id,
              status: 'confirmed',
              booked_at: new Date().toISOString(),
              tokens_used: 0, // Trial bookings don't use tokens
            })
            .select()
            .single()

          firstBooking = newBooking
          bookingError = createError

          if (bookingError) {
            console.error('[Webhook] Failed to create trial booking:', bookingError)
            return NextResponse.json({ 
              received: true, 
              error: 'Failed to create booking',
              details: bookingError.message 
            })
          }

          console.log('[Webhook] Created new trial booking:', firstBooking.id)
        }

        if (!firstBooking) {
          console.error('[Webhook] No booking found or created')
          return NextResponse.json({ 
            received: true, 
            error: 'Failed to process booking' 
          })
        }

        // Send confirmation email to guest
        try {
          const { sendTrialBookingConfirmationEmail } = await import('@/lib/email')
          await sendTrialBookingConfirmationEmail({
            guestEmail,
            guestName,
            className: classData.title,
            classDate: new Date(classData.scheduled_at).toLocaleDateString('en-SG', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              timeZone: 'Asia/Singapore',
            }),
            classTime: new Date(classData.scheduled_at).toLocaleTimeString('en-SG', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true,
              timeZone: 'Asia/Singapore',
            }),
            classLocation: classData.location || 'TBA',
            instructorName: classData.instructor_name || undefined,
            amount: payment.amount_cents / 100,
            currency: payment.currency,
          })
          console.log('[Webhook] Trial booking confirmation email sent to:', guestEmail)
        } catch (emailError) {
          console.error('[Webhook] Failed to send trial booking email:', emailError)
        }

        // Send notification email to admins
        try {
          const { getStaffAlertRecipients } = await import('@/lib/alert-email-recipients')
          const adminEmails = await getStaffAlertRecipients(supabase)

          if (adminEmails.length > 0) {
            const { sendTrialBookingAdminNotificationEmail } = await import('@/lib/email')
            await sendTrialBookingAdminNotificationEmail({
              adminEmails,
              guestName,
              guestEmail,
              guestPhone,
              guestDateOfBirth: guestDateOfBirth || undefined,
              className: classData.title,
              classDate: new Date(classData.scheduled_at).toLocaleDateString('en-SG', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: 'Asia/Singapore',
              }),
              classTime: new Date(classData.scheduled_at).toLocaleTimeString('en-SG', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Singapore',
              }),
              classLocation: classData.location || 'TBA',
              instructorName: classData.instructor_name || undefined,
              amount: payment.amount_cents / 100,
              currency: payment.currency,
              bookingId: firstBooking.id,
            })
            console.log('[Webhook] Trial booking admin notification sent to:', adminEmails.length, 'admins')
          }
        } catch (adminEmailError) {
          console.error('[Webhook] Failed to send admin notification:', adminEmailError)
        }

        // Create in-app notifications for admins
        try {
          const { data: adminUsers } = await supabase
            .from('user_profiles')
            .select('id')
            .in('role', ['admin', 'super_admin'])
            .eq('is_active', true)

          if (adminUsers && adminUsers.length > 0) {
            const notifications = adminUsers.map(admin => ({
              user_id: admin.id,
              type: 'trial_booking',
              channel: 'in_app',
              subject: 'New Trial Class Booking',
              body: `${guestName} (${guestEmail}) booked trial class: ${classData.title}`,
              status: 'sent',
              sent_at: new Date().toISOString(),
              data: {
                booking_id: firstBooking.id,
                class_id: payment.class_id,
                guest_name: guestName,
                guest_email: guestEmail,
                guest_phone: guestPhone,
                class_title: classData.title,
                amount: payment.amount_cents / 100,
              },
            }))

            await supabase
              .from('notifications')
              .insert(notifications)

            console.log('[Webhook] Created admin notifications for trial booking')
          }
        } catch (notifError) {
          console.error('[Webhook] Failed to create admin notifications:', notifError)
        }

        console.log('[Webhook] Trial booking completed successfully:', payment.id)

        // Fire-and-forget: log a token transaction for reporting — never blocks or breaks booking
        if (firstBooking) {
          void Promise.resolve(
            supabase.from('token_transactions').insert({
              user_id: null,
              booking_id: firstBooking.id,
              transaction_type: 'trial-booking-purchase',
              tokens_change: 1,
              tokens_before: 0,
              tokens_after: 1,
              description: `Trial class: ${classData.title} (${guestName})`,
            })
          ).then(() => {
            console.log('[Webhook] Created trial token transaction for booking:', firstBooking.id)
          }).catch((err: unknown) => {
            console.error('[Webhook] Non-critical: failed to create trial token transaction:', err)
          })
        }

        void Promise.resolve().then(async () => {
          const { sendSuccessfulPaymentAlertEmail } = await import('@/lib/email')
          await sendSuccessfulPaymentAlertEmail({
            paymentId: payment.id,
            paymentType: 'trial-booking',
            source: 'webhook',
            amount: payment.amount_cents / 100,
            currency: payment.currency,
            guestName,
            guestEmail,
            className: classData.title,
          })
        }).catch((err: unknown) => {
          console.error('[Webhook] Non-critical: failed to send payment alert email:', err)
        })

        return NextResponse.json({ received: true, message: 'Trial booking processed' })
      }

      // PACKAGE PURCHASE FLOW (existing logic)
      // Get package details separately if not included in join
      let pkg = payment.packages
      if (!pkg && payment.package_id) {
        const { data: packageData, error: pkgError } = await supabase
          .from('packages')
          .select('*')
          .eq('id', payment.package_id)
          .single()
        
        if (pkgError) {
          console.error('[Webhook] Failed to fetch package:', pkgError)
          return NextResponse.json({ received: true, error: 'Package not found' })
        }
        pkg = packageData
      }

      if (!pkg) {
        console.error('[Webhook] Package not found for payment:', payment.id)
        return NextResponse.json({ received: true, error: 'Package not found' })
      }

      // Update payment status
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: 'succeeded',
          hitpay_payment_id: payment_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('[Webhook] Failed to update payment status:', updateError)
        return NextResponse.json({ received: true, error: 'Failed to update payment' })
      }

      // Mark admin-issued referral voucher as used (one-time use)
      const voucherId = (payment as { referral_voucher_id?: string | null }).referral_voucher_id
      if (voucherId) {
        const { error: voucherUpdateError } = await supabase
          .from('referral_vouchers')
          .update({
            used_at: new Date().toISOString(),
            payment_id: payment.id,
          })
          .eq('id', voucherId)
        if (voucherUpdateError) {
          console.error('[Webhook] Failed to mark voucher as used:', voucherUpdateError)
        } else {
          console.log('[Webhook] Marked referral voucher as used:', voucherId)
        }
      }

      // Check if user_package already exists for this payment (avoid duplicates)
      const { data: existingPackage } = await supabase
        .from('user_packages')
        .select('id')
        .eq('payment_id', payment.id)
        .single()

      if (existingPackage) {
        console.log('[Webhook] User package already exists for payment:', payment.id)
        return NextResponse.json({ received: true, message: 'Already processed' })
      }

      // Create user package with tokens
      if (pkg) {
        const issuedTokenCount = pkg.is_unlimited ? UNLIMITED_TOKEN_BALANCE : pkg.token_count
        const tokenLabel = pkg.is_unlimited ? 'unlimited' : `${pkg.token_count}`
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + pkg.validity_days)

        // Create user_package
        const { data: userPackage, error: upError } = await supabase
          .from('user_packages')
          .insert({
            user_id: payment.user_id,
            package_id: payment.package_id,
            payment_id: payment.id.toString(), // Convert UUID to string for VARCHAR(255) column
            tokens_remaining: issuedTokenCount,
            tokens_held: 0, // Initialize held tokens to 0
            expires_at: expiresAt.toISOString(),
            status: 'active',
          })
          .select()
          .single()

        if (upError) {
          console.error('[Webhook] Failed to create user package:', upError)
          // Return error but still acknowledge webhook
          return NextResponse.json({ 
            received: true, 
            error: 'Failed to create user package',
            details: upError.message 
          })
        }

        console.log('[Webhook] Created user package:', userPackage?.id)

        // Create token transaction — CRITICAL, do this before returning
        const { error: txError } = await supabase
          .from('token_transactions')
          .insert({
            user_id: payment.user_id,
            user_package_id: userPackage.id,
            transaction_type: 'purchase',
            tokens_change: issuedTokenCount,
            tokens_before: 0,
            tokens_after: issuedTokenCount,
            description: `Purchased ${pkg.name}`,
          })

        if (txError) {
          console.error('[Webhook] Failed to create token transaction:', txError)
        }

        console.log('[Webhook] Payment completed successfully (tokens issued):', payment.id)

        // ── NON-CRITICAL work below — fire and forget to avoid timeout ──
        // These run in the background; if any fail, tokens are already issued.
        const nonCriticalWork = async () => {
          try {
            // Record promo usage if discount was applied
            if (payment.promo_type && payment.discount_percent && payment.discount_percent > 0) {
              await supabase
                .from('promo_usage')
                .insert({
                  user_id: payment.user_id,
                  promo_type: payment.promo_type,
                  discount_percent: payment.discount_percent,
                  discount_amount_cents: payment.discount_amount_cents || 0,
                  package_id: payment.package_id,
                  payment_id: payment.id,
                })

              if (payment.promo_type === 'referral') {
                const { data: referral } = await supabase
                  .from('referrals')
                  .select('id')
                  .eq('referred_id', payment.user_id)
                  .in('status', ['pending', 'completed'])
                  .single()

                if (referral) {
                  await supabase
                    .from('referrals')
                    .update({
                      status: 'used',
                      discount_used_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', referral.id)
                }
              }
            }

            // Update user stats
            await Promise.allSettled([
              supabase.rpc('increment_user_stat', {
                p_user_id: payment.user_id,
                p_field: 'total_tokens_purchased',
                p_amount: issuedTokenCount,
              }),
              supabase.rpc('increment_user_stat', {
                p_user_id: payment.user_id,
                p_field: 'total_spent_cents',
                p_amount: payment.amount_cents,
              }),
            ])

            // Create invoice
            await supabase
              .from('invoices')
              .insert({
                user_id: payment.user_id,
                payment_id: payment.id,
                invoice_number: `INV-${Date.now()}`,
                amount_cents: payment.amount_cents,
                tax_cents: 0,
                total_cents: payment.amount_cents,
                currency: payment.currency,
                status: 'paid',
                issued_at: new Date().toISOString(),
                paid_at: new Date().toISOString(),
              })

            // Send in-app notification
            await supabase
              .from('notifications')
              .insert({
                user_id: payment.user_id,
                type: 'payment_successful',
                channel: 'in_app',
                subject: 'Payment Successful!',
                body: `Your purchase of ${pkg.name} was successful. ${tokenLabel} tokens have been added to your account.`,
                status: 'sent',
                sent_at: new Date().toISOString(),
                data: {
                  payment_id: payment.id,
                  package_name: pkg.name,
                  token_count: issuedTokenCount,
                  is_unlimited: pkg.is_unlimited === true,
                  amount: payment.amount_cents / 100,
                },
              })

            // Send email confirmation (slowest operation — SMTP)
            const { data: userProfile } = await supabase
              .from('user_profiles')
              .select('email, name')
              .eq('id', payment.user_id)
              .single()

            if (userProfile?.email && userPackage) {
              const { sendTokenPurchaseEmail } = await import('@/lib/email')
              await sendTokenPurchaseEmail({
                userEmail: userProfile.email,
                userName: userProfile.name || 'User',
                packageName: pkg.name,
                tokenCount: issuedTokenCount,
                amount: payment.amount_cents / 100,
                currency: payment.currency,
                expiresAt: userPackage.expires_at,
              })
              console.log('[Webhook] Token purchase email sent to:', userProfile.email)

              await import('@/lib/email').then(({ sendSuccessfulPaymentAlertEmail }) =>
                sendSuccessfulPaymentAlertEmail({
                  paymentId: payment.id,
                  paymentType: 'package-purchase',
                  source: 'webhook',
                  amount: payment.amount_cents / 100,
                  currency: payment.currency,
                  packageName: pkg.name,
                  tokenCount: issuedTokenCount,
                  userName: userProfile.name || 'User',
                  userEmail: userProfile.email,
                })
              )
            }
          } catch (bgError) {
            console.error('[Webhook] Non-critical background work error:', bgError)
          }
        }

        // Don't await — let it run in background while we return 200 immediately
        nonCriticalWork()

      } else {
        console.error('[Webhook] Package data is missing for payment:', payment.id)
        return NextResponse.json({ received: true, error: 'Package data missing' })
      }
    } else if (status === 'failed') {
      const { data: failedPayment } = await supabase
        .from('payments')
        .select('id, amount_cents, currency, package_id, is_trial_booking, metadata')
        .eq('hitpay_payment_request_id', payment_request_id)
        .maybeSingle()

      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: 'Payment failed',
          updated_at: new Date().toISOString(),
        })
        .eq('hitpay_payment_request_id', payment_request_id)

      if (failedPayment) {
        const metadata = (failedPayment.metadata as Record<string, unknown> | null) || {}
        void Promise.resolve().then(async () => {
          const { sendPaymentAlertEmail } = await import('@/lib/email')
          await sendPaymentAlertEmail({
            paymentId: failedPayment.id,
            event: 'failed',
            paymentType: failedPayment.is_trial_booking ? 'trial-booking' : 'package-purchase',
            source: 'webhook',
            amount: failedPayment.amount_cents / 100,
            currency: failedPayment.currency,
            packageName: typeof metadata.package_name === 'string' ? metadata.package_name : undefined,
            tokenCount: typeof metadata.token_count === 'number' ? metadata.token_count : undefined,
            guestName: typeof metadata.guest_name === 'string' ? metadata.guest_name : undefined,
            guestEmail: typeof metadata.guest_email === 'string' ? metadata.guest_email : undefined,
            className: typeof metadata.class_name === 'string' ? metadata.class_name : undefined,
            failureReason: 'HitPay reported payment failed',
          })
        }).catch((alertErr: unknown) => {
          console.error('[Webhook] Non-critical: failed to send failed payment alert:', alertErr)
        })
      }

      console.log('[Webhook] Payment failed:', payment_request_id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook] Error:', error)
    return NextResponse.json({ received: true })
  }
}

// Endpoint verification
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok', message: 'HitPay webhook active' })
}
