/**
 * API Route: Download Registration Form PDF
 * GET /api/registration-form/download-pdf?formId=xxx
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationFormPDF } from '@/lib/pdf-generator'
import { getSupabaseClient } from '@/lib/supabase'

// CORS headers for cross-origin requests (admin panel -> web app)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function GET(request: NextRequest) {
  console.log('[Download PDF] API called')
  
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')

    console.log('[Download PDF] Form ID:', formId)

    if (!formId) {
      return NextResponse.json(
        { success: false, error: 'Form ID is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Fetch form data from database
    const supabase = getSupabaseClient()
    const { data: form, error } = await supabase
      .from('registration_forms')
      .select(`
        *,
        user:user_profiles!user_id (
          id,
          name,
          email
        )
      `)
      .eq('id', formId)
      .single()

    if (error || !form) {
      console.error('[Download PDF] Form not found:', error)
      return NextResponse.json(
        { success: false, error: 'Form not found' },
        { status: 404 }
      )
    }

    // Transform to the expected format
    const formData = {
      fullNameNric: form.full_name_nric,
      residentialAddress: form.residential_address,
      postalCode: form.postal_code,
      dateOfBirth: form.date_of_birth,
      email: form.email,
      phone: form.phone,
      bloodGroup: form.blood_group,
      emergencyContact: form.emergency_contact,
      emergencyContactPhone: form.emergency_contact_phone,
      parentGuardianName: form.parent_guardian_name || '',
      parentGuardianSignature: form.parent_guardian_signature || '',
      parentGuardianDate: form.parent_guardian_date || '',
      memberSignature: form.member_signature,
      memberSignatureDate: form.member_signature_date || new Date().toISOString(),
      termsAccepted: form.terms_accepted || false,
      mediaConsent: form.media_consent || false,
      staffSignature: form.staff_signature || '',
      staffName: form.staff_name || '',
      staffSignatureDate: form.staff_signature_date || '',
      submittedAt: form.form_completed_at || form.created_at,
    }

    console.log('[Download PDF] Generating PDF for form:', formId)

    // Generate PDF
    const pdfBuffer = await generateRegistrationFormPDF(formData)
    
    console.log('[Download PDF] PDF generated, size:', pdfBuffer.length, 'bytes')

    // Generate filename
    const fileName = `zumbaton-registration-${formData.fullNameNric.replace(/\s+/g, '-')}.pdf`

    // Return PDF as download
    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('[Download PDF] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500, headers: corsHeaders }
    )
  }
}
