/**
 * API Route: Generate Registration Form PDF
 * POST /api/registration-form/generate-pdf
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationFormPDF } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate required fields
    if (!formData.fullNameNric || !formData.memberSignature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateRegistrationFormPDF(formData)

    // Convert buffer to base64 for JSON response
    const pdfBase64 = pdfBuffer.toString('base64')

    // Return as JSON with base64 encoded PDF
    return NextResponse.json({
      success: true,
      pdf: pdfBase64,
      filename: `zumbaton-registration-${formData.fullNameNric.replace(/\s+/g, '-')}.pdf`
    })
  } catch (error) {
    console.error('[PDF Generation] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
