/**
 * API Route: Send Registration Form PDF via Email
 * POST /api/registration-form/send-pdf
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateRegistrationFormPDF } from '@/lib/pdf-generator'
import { sendRegistrationFormCompletedEmail } from '@/lib/email'
import { getSupabaseClient } from '@/lib/supabase'

// CORS headers for cross-origin requests (admin panel -> web app)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle OPTIONS preflight request
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  console.log('[Send PDF] API called')
  
  try {
    const body = await request.json()
    console.log('[Send PDF] Request body:', { formId: body.formId, includeAdminCopy: body.includeAdminCopy })

    // Support both direct form data and formId
    if (body.formId) {
      // Fetch form data from database
      const supabase = getSupabaseClient()
      console.log('[Send PDF] Fetching form from database...')
      
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
        .eq('id', body.formId)
        .single()

      if (error || !form) {
        console.error('[Send PDF] Form not found:', error)
        return NextResponse.json(
          { success: false, error: 'Form not found' },
          { status: 404 }
        )
      }

      console.log('[Send PDF] Form fetched:', form.id)

      // Transform to the expected format
      const formData = {
        fullNameNric: form.full_name_nric,
        residentialAddress: form.residential_address,
        postalCode: form.postal_code,
        dateOfBirth: form.date_of_birth,
        email: form.email,
        phone: form.phone,
        gender: form.gender || '',
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

      console.log('[Send PDF] Generating PDF for form:', body.formId)

      // Generate PDF
      let pdfBuffer: Buffer
      try {
        pdfBuffer = await generateRegistrationFormPDF(formData)
        console.log('[Send PDF] PDF generated successfully, size:', pdfBuffer.length, 'bytes')
      } catch (pdfError) {
        console.error('[Send PDF] PDF generation failed:', pdfError)
        return NextResponse.json(
          { success: false, error: 'Failed to generate PDF: ' + (pdfError instanceof Error ? pdfError.message : 'Unknown error') },
          { status: 500 }
        )
      }

      // Generate filename
      const fileName = `zumbaton-registration-${formData.fullNameNric.replace(/\s+/g, '-')}.pdf`

      // Send email to user
      console.log('[Send PDF] Sending email to user:', formData.email)
      const emailResult = await sendRegistrationFormCompletedEmail({
        userEmail: formData.email,
        userName: form.user?.name || form.full_name_nric,
        pdfBuffer,
        fileName,
      })

      if (!emailResult.success) {
        console.error('[Send PDF] Failed to send email to user:', emailResult.error)
        return NextResponse.json(
          { success: false, error: 'Failed to send email: ' + emailResult.error },
          { status: 500 }
        )
      }

      console.log('[Send PDF] Email sent to user successfully')

      // Send copy to admin/staff if requested
      if (body.includeAdminCopy && body.adminEmail) {
        console.log('[Send PDF] Sending copy to staff:', body.adminEmail)
        const adminEmailResult = await sendRegistrationFormCompletedEmail({
          userEmail: body.adminEmail,
          userName: 'Staff',
          pdfBuffer,
          fileName,
        })
        
        if (!adminEmailResult.success) {
          console.error('[Send PDF] Failed to send email to staff:', adminEmailResult.error)
          // Don't fail if admin email fails, user email is more important
        } else {
          console.log('[Send PDF] Copy sent to staff successfully')
        }
      }

      return NextResponse.json(
        {
          success: true,
          message: 'PDF sent successfully',
        },
        { headers: corsHeaders }
      )
    }

    // Original flow: Direct form data
    const formData = body

    // Validate required fields
    if (!formData.userEmail || !formData.userName || !formData.fullNameNric) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate PDF
    const pdfBuffer = await generateRegistrationFormPDF(formData)
    
    // Generate filename
    const fileName = `zumbaton-registration-${formData.fullNameNric.replace(/\s+/g, '-')}.pdf`

    // Send email with PDF attachment
    const emailResult = await sendRegistrationFormCompletedEmail({
      userEmail: formData.userEmail,
      userName: formData.userName,
      pdfBuffer,
      fileName,
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'PDF sent successfully',
      },
      { headers: corsHeaders }
    )
  } catch (error) {
    console.error('[Send PDF] Unexpected error:', error)
    console.error('[Send PDF] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send PDF: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500, headers: corsHeaders }
    )
  }
}