/**
 * Invoice PDF Generator
 * Creates a single-page A4 invoice for any successful payment (registered
 * user package purchase, or a guest trial booking).
 */

import { jsPDF } from 'jspdf'
import fs from 'fs'
import path from 'path'

export interface InvoicePDFData {
  invoiceNumber: string
  issuedAt: string
  billToName: string
  billToEmail: string
  billToPhone?: string | null
  description: string
  amountCents: number
  currency: string
  paymentReference?: string | null
  originalAmountCents?: number | null
  discountPercent?: number | null
  discountAmountCents?: number | null
}

const BRAND_GREEN: [number, number, number] = [22, 163, 74]
const MUTED_GRAY: [number, number, number] = [102, 102, 102]

export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      let y = 15

      // Logo
      try {
        const logoPath = path.join(process.cwd(), 'public', 'logo', 'One step fitness logo.png')
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath)
          const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
          doc.addImage(logoBase64, 'PNG', 92.5, y, 25, 25)
          y += 30
        } else {
          doc.setFontSize(22)
          doc.setTextColor(...BRAND_GREEN)
          doc.setFont('helvetica', 'bold')
          doc.text('ONE STEP FITNESS', 105, y + 5, { align: 'center' })
          y += 15
        }
      } catch (error) {
        console.error('[Invoice PDF] Error loading logo:', error)
        doc.setFontSize(22)
        doc.setTextColor(...BRAND_GREEN)
        doc.setFont('helvetica', 'bold')
        doc.text('ONE STEP FITNESS', 105, y + 5, { align: 'center' })
        y += 15
      }

      doc.setFontSize(18)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text('INVOICE', 105, y, { align: 'center' })
      y += 12

      // Invoice meta (left) + issued date (right)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED_GRAY)
      doc.text('Invoice Number', 20, y)
      doc.text('Issued', 150, y)
      y += 5
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(data.invoiceNumber, 20, y)
      doc.text(
        new Date(data.issuedAt).toLocaleDateString('en-SG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        150,
        y
      )
      y += 14

      // Bill To
      doc.setFontSize(9)
      doc.setTextColor(...MUTED_GRAY)
      doc.setFont('helvetica', 'normal')
      doc.text('BILL TO', 20, y)
      y += 6
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(data.billToName, 20, y)
      y += 6
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...MUTED_GRAY)
      doc.text(data.billToEmail, 20, y)
      if (data.billToPhone) {
        y += 5
        doc.text(data.billToPhone, 20, y)
      }
      y += 16

      // Discount breakdown (only when the payment actually had one)
      const originalAmountCents =
        data.originalAmountCents && data.originalAmountCents > data.amountCents
          ? data.originalAmountCents
          : null
      const discountAmountCents =
        data.discountAmountCents && data.discountAmountCents > 0
          ? data.discountAmountCents
          : originalAmountCents
            ? originalAmountCents - data.amountCents
            : 0
      const hasDiscount = discountAmountCents > 0 && originalAmountCents !== null
      const discountPercent =
        data.discountPercent && data.discountPercent > 0
          ? data.discountPercent
          : hasDiscount && originalAmountCents
            ? Math.round((discountAmountCents / originalAmountCents) * 100)
            : 0

      // Line item table header
      const amount = (data.amountCents / 100).toFixed(2)
      const lineItemAmount = hasDiscount && originalAmountCents ? (originalAmountCents / 100).toFixed(2) : amount
      doc.setDrawColor(230, 230, 230)
      doc.setFillColor(245, 245, 245)
      doc.rect(20, y, 170, 8, 'F')
      doc.setFontSize(9)
      doc.setTextColor(...MUTED_GRAY)
      doc.setFont('helvetica', 'bold')
      doc.text('DESCRIPTION', 24, y + 5.5)
      doc.text('AMOUNT', 178, y + 5.5, { align: 'right' })
      y += 8

      // Line item row (list price when a discount applies)
      doc.setDrawColor(230, 230, 230)
      doc.line(20, y + 10, 190, y + 10)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      const descLines = doc.splitTextToSize(data.description, 130)
      doc.text(descLines, 24, y + 7)
      doc.text(`${data.currency} ${lineItemAmount}`, 178, y + 7, { align: 'right' })
      y += 10 + Math.max(0, descLines.length - 1) * 5 + 8

      // Discount row
      if (hasDiscount) {
        doc.setFontSize(10)
        doc.setTextColor(...BRAND_GREEN)
        doc.setFont('helvetica', 'normal')
        doc.text(`Discount${discountPercent ? ` (${discountPercent}%)` : ''}`, 24, y)
        doc.text(`- ${data.currency} ${(discountAmountCents / 100).toFixed(2)}`, 178, y, { align: 'right' })
        y += 10
      }

      // Total
      doc.setDrawColor(0, 0, 0)
      doc.setLineWidth(0.3)
      doc.line(120, y, 190, y)
      y += 8
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text('TOTAL PAID', 120, y)
      doc.text(`${data.currency} ${amount}`, 178, y, { align: 'right' })
      y += 16

      // Payment method
      doc.setFontSize(9)
      doc.setTextColor(...MUTED_GRAY)
      doc.setFont('helvetica', 'normal')
      doc.text(
        `Paid via HitPay${data.paymentReference ? ` — Ref: ${data.paymentReference}` : ''}`,
        20,
        y
      )

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(153, 153, 153)
      doc.text(
        'This is a computer-generated invoice. For questions, contact One Step Fitness administration.',
        105,
        280,
        { align: 'center' }
      )

      const pdfData = doc.output('arraybuffer')
      resolve(Buffer.from(pdfData))
    } catch (error) {
      console.error('[Invoice PDF] Generation error:', error)
      reject(error)
    }
  })
}
