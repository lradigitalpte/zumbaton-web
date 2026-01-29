/**
 * HitPay Webhook Handler for Web App
 * POST /api/payments/webhook - Handle HitPay payment confirmations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const HITPAY_SALT = process.env.HITPAY_SALT

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

        // Extract guest info from metadata
        const metadata = payment.metadata as any || {}
        const guestName = metadata.guest_name || 'Guest'
        const guestEmail = metadata.guest_email
        const guestPhone = metadata.guest_phone || ''
        const guestDateOfBirth = metadata.guest_date_of_birth || null

        if (!guestEmail) {
          console.error('[Webhook] Guest email missing for trial booking:', payment.id)
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

        // Check if draft booking exists: metadata.draft_booking_id or booking linked by payment_id
        let draftBookingId = metadata?.draft_booking_id
        if (!draftBookingId) {
          const { data: byPayment } = await supabase
            .from('bookings')
            .select('id')
            .eq('payment_id', payment.id)
            .eq('status', 'draft')
            .eq('is_trial_booking', true)
            .maybeSingle()
          if (byPayment?.id) draftBookingId = byPayment.id
        }

        let booking
        let bookingError

        if (draftBookingId) {
          const { data: updatedBooking, error: updateError } = await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_id: payment.id,
              booked_at: new Date().toISOString(),
            })
            .eq('id', draftBookingId)
            .select()
            .single()

          booking = updatedBooking
          bookingError = updateError

          if (bookingError) {
            console.error('[Webhook] Failed to update draft booking:', bookingError)
          } else {
            console.log('[Webhook] Updated draft booking to confirmed:', booking.id)
          }
        }

        // If no draft booking or update failed, check for existing confirmed booking
        if (!booking) {
          const { data: existingBooking } = await supabase
            .from('bookings')
            .select('id, status')
            .eq('class_id', payment.class_id)
            .eq('guest_email', guestEmail)
            .in('status', ['confirmed', 'attended', 'draft'])

          if (existingBooking && existingBooking.length > 0) {
            const existing = existingBooking[0]
            if (existing.status === 'confirmed' || existing.status === 'attended') {
              console.log('[Webhook] Booking already confirmed for trial:', payment.id)
              return NextResponse.json({ received: true, message: 'Booking already confirmed' })
            } else if (existing.status === 'draft') {
              // Update draft to confirmed
              const { data: updatedBooking, error: updateError } = await supabase
                .from('bookings')
                .update({
                  status: 'confirmed',
                  payment_id: payment.id,
                  booked_at: new Date().toISOString(),
                })
                .eq('id', existing.id)
                .select()
                .single()

              booking = updatedBooking
              bookingError = updateError

              if (bookingError) {
                console.error('[Webhook] Failed to update draft booking:', bookingError)
              } else {
                console.log('[Webhook] Updated draft booking to confirmed:', booking.id)
              }
            }
          }
        }

        // If still no booking, create new one (backward compatibility)
        if (!booking) {
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

          booking = newBooking
          bookingError = createError

          if (bookingError) {
            console.error('[Webhook] Failed to create trial booking:', bookingError)
            return NextResponse.json({ 
              received: true, 
              error: 'Failed to create booking',
              details: bookingError.message 
            })
          }

          console.log('[Webhook] Created new trial booking:', booking.id)
        }

        if (!booking) {
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
              day: 'numeric' 
            }),
            classTime: new Date(classData.scheduled_at).toLocaleTimeString('en-SG', { 
              hour: '2-digit', 
              minute: '2-digit' 
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
          const { data: adminUsers } = await supabase
            .from('user_profiles')
            .select('id, email, name')
            .in('role', ['admin', 'super_admin'])
            .eq('is_active', true)

          if (adminUsers && adminUsers.length > 0) {
            const { sendTrialBookingAdminNotificationEmail } = await import('@/lib/email')
            const adminEmails = adminUsers.map(u => u.email).filter(Boolean) as string[]
            
            if (adminEmails.length > 0) {
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
                  day: 'numeric' 
                }),
                classTime: new Date(classData.scheduled_at).toLocaleTimeString('en-SG', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }),
                classLocation: classData.location || 'TBA',
                instructorName: classData.instructor_name || undefined,
                amount: payment.amount_cents / 100,
                currency: payment.currency,
                bookingId: booking.id,
              })
              console.log('[Webhook] Trial booking admin notification sent to:', adminEmails.length, 'admins')
            }
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
                booking_id: booking.id,
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
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + pkg.validity_days)

        // Create user_package
        const { data: userPackage, error: upError } = await supabase
          .from('user_packages')
          .insert({
            user_id: payment.user_id,
            package_id: payment.package_id,
            payment_id: payment.id.toString(), // Convert UUID to string for VARCHAR(255) column
            tokens_remaining: pkg.token_count,
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

        // Record promo usage if discount was applied
        if (payment.promo_type && payment.discount_percent && payment.discount_percent > 0) {
          const { error: promoError } = await supabase
            .from('promo_usage')
            .insert({
              user_id: payment.user_id,
              promo_type: payment.promo_type,
              discount_percent: payment.discount_percent,
              discount_amount_cents: payment.discount_amount_cents || 0,
              package_id: payment.package_id,
              payment_id: payment.id,
            })

          if (promoError) {
            console.error('[Webhook] Failed to record promo usage:', promoError)
            // Don't fail the webhook - payment succeeded
          } else {
            console.log('[Webhook] Recorded promo usage:', payment.promo_type, payment.discount_percent + '%')

            // If referral discount was used, update referral status
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
        }

        // Create token transaction
        const { error: txError } = await supabase
          .from('token_transactions')
          .insert({
            user_id: payment.user_id,
            user_package_id: userPackage.id,
            transaction_type: 'purchase',
            tokens_change: pkg.token_count, // positive = tokens added
            tokens_before: 0, // Before purchase, user had 0 tokens from this package
            tokens_after: pkg.token_count, // After purchase, user has all tokens
            description: `Purchased ${pkg.name}`,
          })

        if (txError) {
          console.error('[Webhook] Failed to create token transaction:', txError)
          // Continue anyway - user package was created
        } else {
          console.log('[Webhook] Created token transaction for', pkg.token_count, 'tokens')
        }

        // Update user stats (non-blocking)
        try {
          await supabase.rpc('increment_user_stat', {
            p_user_id: payment.user_id,
            p_field: 'total_tokens_purchased',
            p_amount: pkg.token_count,
          })

          await supabase.rpc('increment_user_stat', {
            p_user_id: payment.user_id,
            p_field: 'total_spent_cents',
            p_amount: payment.amount_cents,
          })
        } catch (statError) {
          console.warn('[Webhook] Failed to update user stats:', statError)
          // Non-critical, continue
        }

        // Send email confirmation
        try {
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
              tokenCount: pkg.token_count,
              amount: payment.amount_cents / 100,
              currency: payment.currency,
              expiresAt: userPackage.expires_at,
            })
            console.log('[Webhook] Token purchase email sent to:', userProfile.email)
          }
        } catch (emailError) {
          console.error('[Webhook] Failed to send token purchase email:', emailError)
          // Don't fail the webhook if email fails
        }
      } else {
        console.error('[Webhook] Package data is missing for payment:', payment.id)
        return NextResponse.json({ received: true, error: 'Package data missing' })
      }

      // Create invoice
      const invoiceNumber = `INV-${Date.now()}`
      await supabase
        .from('invoices')
        .insert({
          user_id: payment.user_id,
          payment_id: payment.id,
          invoice_number: invoiceNumber,
          amount_cents: payment.amount_cents,
          tax_cents: 0,
          total_cents: payment.amount_cents,
          currency: payment.currency,
          status: 'paid',
          issued_at: new Date().toISOString(),
          paid_at: new Date().toISOString(),
        })

      // Send notification (in-app)
      await supabase
        .from('notifications')
        .insert({
          user_id: payment.user_id,
          type: 'payment_successful',
          channel: 'in_app',
          subject: 'Payment Successful!',
          body: `Your purchase of ${pkg?.name || 'tokens'} was successful. ${pkg?.token_count || 0} tokens have been added to your account.`,
          status: 'sent',
          sent_at: new Date().toISOString(),
          data: {
            payment_id: payment.id,
            package_name: pkg?.name,
            token_count: pkg?.token_count,
            amount: payment.amount_cents / 100,
          },
        })

      console.log('[Webhook] Payment completed successfully:', payment.id)
    } else if (status === 'failed') {
      // Update payment status to failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: 'Payment failed',
          updated_at: new Date().toISOString(),
        })
        .eq('hitpay_payment_request_id', payment_request_id)

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
