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

/**
 * Never throws — invoicing must not block or break the booking/token flow
 * it's attached to. Callers should fire-and-forget this.
 */
export async function createAndSendInvoice(input: CreateAndSendInvoiceInput): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient()

    const billToName = input.userId ? undefined : input.guestName
    const billToEmail = input.userId ? undefined : input.guestEmail

    if (!input.userId && !billToEmail) {
      console.error('[Invoicing] No user or guest email for payment, skipping invoice:', input.paymentId)
      return
    }

    // Idempotency: one invoice per payment. Also resolve the "bill to" name/
    // email for registered users, who only carry a userId here.
    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('payment_id', input.paymentId)
      .maybeSingle()

    if (existing) {
      console.log('[Invoicing] Invoice already exists for payment:', input.paymentId)
      return
    }

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

    if (!resolvedEmail) {
      console.error('[Invoicing] Could not resolve an email for payment, skipping invoice:', input.paymentId)
      return
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
      // status-sync) won the race — that's fine, they'll have sent the email.
      if (insertError?.code !== '23505') {
        console.error('[Invoicing] Failed to insert invoice:', insertError)
      }
      return
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
      return
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(filePath)
    const pdfUrl = urlData.publicUrl

    await supabase.from('invoices').update({ pdf_url: pdfUrl }).eq('id', invoiceRow.id)

    await sendInvoiceEmail({
      toEmail: resolvedEmail,
      toName: resolvedName,
      invoiceNumber,
      amount: input.amountCents / 100,
      currency: input.currency,
      description: input.description,
      pdfUrl,
      issuedAt,
    })

    console.log('[Invoicing] Invoice sent:', invoiceNumber, 'for payment', input.paymentId)
  } catch (error) {
    console.error('[Invoicing] Unexpected error creating/sending invoice:', error)
  }
}
