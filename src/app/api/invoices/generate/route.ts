/**
 * Generate Invoice API Route
 * POST /api/invoices/generate - Backfill an invoice for an already-successful
 * payment that never got one (predates the invoicing feature). Does NOT
 * email it — that's a separate, explicit "resend" step from the admin app.
 *
 * Internal, server-to-server only (called by zumbaton-admin).
 */

import { NextRequest, NextResponse } from 'next/server'
import { deriveInvoiceInputFromPayment, getOrCreateInvoice } from '@/lib/invoicing'

const EMAIL_API_SECRET = process.env.EMAIL_API_SECRET || process.env.NEXT_PUBLIC_EMAIL_API_SECRET || 'change-me-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentId, secret } = body

    if (secret !== EMAIL_API_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    if (!paymentId || typeof paymentId !== 'string') {
      return NextResponse.json({ success: false, error: 'paymentId is required' }, { status: 400 })
    }

    const derived = await deriveInvoiceInputFromPayment(paymentId)
    if ('error' in derived) {
      return NextResponse.json({ success: false, error: derived.error }, { status: 400 })
    }

    const invoice = await getOrCreateInvoice(derived)
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate invoice — check server logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    console.error('[API /invoices/generate] Error:', error)
    return NextResponse.json({ success: false, error: 'Unexpected error' }, { status: 500 })
  }
}
