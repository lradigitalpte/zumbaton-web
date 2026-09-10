/**
 * Invoicing
 * Creates + emails an invoice for any successful payment — registered-user
 * package purchase, or a guest trial booking. Idempotent per payment_id.
 */

import { getSupabaseAdminClient } from './supabase'
import { generateInvoicePDF } from './invoice-pdf'
import { sendInvoiceEmail } from './email'

export interface CreateAndSendInvoiceInput {
  paymentId: string
  hitpayPaymentId?: string | null
  amountCents: number
  currency: string
  description: string
  userId?: string | null
  guestName?: string | null
  guestEmail?: string | null
  guestPhone?: string | null
}

export interface InvoiceRecord {
  id: string
  invoiceNumber: string
  pdfUrl: string
  amountCents: number
  currency: string
  description: string
  billToName: string
  billToEmail: string
  issuedAt: string
}

/**
 * Creates the invoice row + PDF + storage upload if one doesn't already
 * exist for this payment, and returns it either way — but never sends an
 * email. Never throws; callers get `null` on failure and should treat that
 * as non-fatal to whatever flow they're attached to.
 */
export async function getOrCreateInvoice(input: CreateAndSendInvoiceInput): Promise<InvoiceRecord | null> {
  try {
    const supabase = getSupabaseAdminClient()

    const billToName = input.userId ? undefined : input.guestName
    const billToEmail = input.userId ? undefined : input.guestEmail

    if (!input.userId && !billToEmail) {
      console.error('[Invoicing] No user or guest email for payment, skipping invoice:', input.paymentId)
      return null
    }

    // Idempotency: one invoice per payment.
    const { data: existing } = await supabase
      .from('invoices')
      .select('id, invoice_number, pdf_url, amount_cents, currency, description, issued_at, created_at, user_id, guest_name, guest_email')
      .eq('payment_id', input.paymentId)
      .maybeSingle()

    let resolvedName = billToName || 'Customer'
    let resolvedEmail = billToEmail || ''

    if (input.userId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('name, email')
        .eq('id', input.userId)
        .single()
      resolvedName = profile?.name || resolvedName
      resolvedEmail = profile?.email || resolvedEmail
    }

    if (existing) {
      if (!existing.pdf_url) {
        // Shouldn't normally happen, but don't hand back a broken record.
        console.error('[Invoicing] Existing invoice has no PDF yet:', existing.id)
        return null
      }
      return {
        id: existing.id,
        invoiceNumber: existing.invoice_number,
        pdfUrl: existing.pdf_url,
        amountCents: existing.amount_cents,
        currency: existing.currency,
        description: existing.description || input.description,
        billToName: existing.guest_name || resolvedName,
        billToEmail: existing.guest_email || resolvedEmail,
        issuedAt: existing.issued_at || existing.created_at,
      }
    }

    if (!resolvedEmail) {
      console.error('[Invoicing] Could not resolve an email for payment, skipping invoice:', input.paymentId)
      return null
    }

    const { data: invoiceNumberResult } = await supabase.rpc('generate_invoice_number')
    const invoiceNumber = (invoiceNumberResult as string | null) || `INV-${Date.now()}`
    const issuedAt = new Date().toISOString()

    const { data: invoiceRow, error: insertError } = await supabase
      .from('invoices')
      .insert({
        user_id: input.userId || null,
        guest_name: input.userId ? null : input.guestName,
        guest_email: input.userId ? null : input.guestEmail,
        guest_phone: input.userId ? null : input.guestPhone,
        payment_id: input.paymentId,
        invoice_number: invoiceNumber,
        description: input.description,
        amount_cents: input.amountCents,
        tax_cents: 0,
        total_cents: input.amountCents,
        currency: input.currency,
        status: 'paid',
        issued_at: issuedAt,
        paid_at: issuedAt,
      })
      .select('id, invoice_number')
      .single()

    if (insertError || !invoiceRow) {
      // Unique-violation on payment_id means another caller (webhook vs.
      // status-sync, or a concurrent "generate" click) won the race —
      // fetch and return what they created instead of failing.
      if (insertError?.code === '23505') {
        return getOrCreateInvoice(input)
      }
      console.error('[Invoicing] Failed to insert invoice:', insertError)
      return null
    }

    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber,
      issuedAt,
      billToName: resolvedName,
      billToEmail: resolvedEmail,
      billToPhone: input.userId ? null : input.guestPhone,
      description: input.description,
      amountCents: input.amountCents,
      currency: input.currency,
      paymentReference: input.hitpayPaymentId,
    })

    const filePath = `invoices/${invoiceNumber}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      console.error('[Invoicing] Failed to upload invoice PDF:', uploadError)
      return null
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
    const pdfUrl = urlData.publicUrl

    await supabase.from('invoices').update({ pdf_url: pdfUrl }).eq('id', invoiceRow.id)

    return {
      id: invoiceRow.id,
      invoiceNumber,
      pdfUrl,
      amountCents: input.amountCents,
      currency: input.currency,
      description: input.description,
      billToName: resolvedName,
      billToEmail: resolvedEmail,
      issuedAt,
    }
  } catch (error) {
    console.error('[Invoicing] Unexpected error creating invoice:', error)
    return null
  }
}

/**
 * Creates the invoice (if needed) and emails it immediately. This is the
 * automatic path — called the moment a payment succeeds. Never throws.
 */
export async function createAndSendInvoice(input: CreateAndSendInvoiceInput): Promise<void> {
  const invoice = await getOrCreateInvoice(input)
  if (!invoice) return

  try {
    await sendInvoiceEmail({
      toEmail: invoice.billToEmail,
      toName: invoice.billToName,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amountCents / 100,
      currency: invoice.currency,
      description: invoice.description,
      pdfUrl: invoice.pdfUrl,
      issuedAt: invoice.issuedAt,
    })
    console.log('[Invoicing] Invoice sent:', invoice.invoiceNumber, 'for payment', input.paymentId)
  } catch (error) {
    console.error('[Invoicing] Failed to send invoice email:', error)
  }
}

/**
 * Backfill support: given just a paymentId (no flow-specific context),
 * reconstructs the same description/identity the webhook branches build
 * inline, by reading the payment row and its related class/package. Used
 * for payments that predate this feature and never got invoiced.
 */
export async function deriveInvoiceInputFromPayment(
  paymentId: string
): Promise<CreateAndSendInvoiceInput | { error: string }> {
  const supabase = getSupabaseAdminClient()

  const { data: payment, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (error || !payment) {
    return { error: 'Payment not found' }
  }
  if (payment.status !== 'succeeded') {
    return { error: `Payment has not succeeded (status: ${payment.status})` }
  }

  const base = {
    paymentId: payment.id,
    hitpayPaymentId: payment.hitpay_payment_id as string | null,
    amountCents: payment.amount_cents as number,
    currency: payment.currency as string,
  }

  // Registered-user package purchase
  if (payment.user_id && payment.package_id) {
    const { data: pkg } = await supabase
      .from('packages')
      .select('name, is_unlimited, token_count')
      .eq('id', payment.package_id)
      .single()

    const tokenLabel = pkg?.is_unlimited ? 'unlimited' : `${pkg?.token_count ?? '?'}`
    return {
      ...base,
      description: `${pkg?.name || 'Package'} — ${tokenLabel} tokens`,
      userId: payment.user_id,
    }
  }

  if (!payment.is_trial_booking) {
    return { error: 'Payment is not a trial booking or package purchase' }
  }

  const metadata = (payment.metadata as Record<string, unknown>) || {}
  const flowType = metadata.flow_type as string | undefined

  if (flowType === 'zt_fiesta') {
    return {
      ...base,
      description: `${(metadata.package_label as string) || 'Outdoor Tabata'} — Outdoor Session`,
      guestName: (metadata.customer_name as string) || 'Guest',
      guestEmail: (metadata.customer_email as string) || '',
      guestPhone: (metadata.customer_phone as string) || '',
    }
  }

  if (flowType === 'zumfamilia') {
    const { data: booking } = await supabase
      .from('bookings')
      .select('guest_name, guest_email')
      .eq('payment_id', payment.id)
      .maybeSingle()

    return {
      ...base,
      description: `${(metadata.class_title as string) || 'One Familia'} — Family Trial`,
      guestName: (metadata.parent_name as string) || booking?.guest_name || 'Guest',
      guestEmail: (metadata.parent_email as string) || booking?.guest_email || '',
      guestPhone: (metadata.parent_phone as string) || '',
    }
  }

  if (flowType === 'quick_join' || flowType === 'quick_trial') {
    const venueLabel = (metadata.promo_label as string) || (flowType === 'quick_trial' ? 'Fast trial' : '1-for-1')
    return {
      ...base,
      description: `${venueLabel} — Trial Booking`,
      guestName: (metadata.guest_name as string) || 'Guest',
      guestEmail: (metadata.guest_email as string) || '',
      guestPhone: (metadata.guest_phone as string) || '',
    }
  }

  // Main trial booking (incl. duo_trial, which pays via participant1)
  const duoP1 = metadata.participant1 as { name?: string; email?: string; phone?: string } | undefined
  const duoP2 = metadata.participant2 as { name?: string } | undefined
  let guestName = (metadata.guest_name as string) || duoP1?.name || 'Guest'
  if (metadata.flow_type === 'duo_trial' && duoP2?.name) {
    guestName = `${guestName} & ${duoP2.name} (Duo Trial)`
  }
  const guestEmail = (metadata.guest_email as string) || duoP1?.email || ''
  const guestPhone = (metadata.guest_phone as string) || duoP1?.phone || ''

  let classTitle = 'Trial Class'
  if (payment.class_id) {
    const { data: classData } = await supabase
      .from('classes')
      .select('title')
      .eq('id', payment.class_id)
      .single()
    classTitle = classData?.title || classTitle
  }

  return {
    ...base,
    description: `${classTitle} — Trial Class`,
    guestName,
    guestEmail,
    guestPhone,
  }
}
