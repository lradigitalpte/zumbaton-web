/**
 * Contact Form API Route
 * POST /api/contact - Submit contact form and send email
 */

import { NextRequest, NextResponse } from 'next/server'
import { sendContactEmail, type ContactFormData } from '@/lib/email'
import { z } from 'zod'

const ContactFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject is too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000, 'Message is too long'),
})

/**
 * POST /api/contact - Submit contact form
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    const parseResult = ContactFormSchema.safeParse(body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parseResult.error.issues,
        },
        { status: 400 }
      )
    }

    // At this point, parseResult.data is guaranteed to match ContactFormData
    // The schema ensures all required fields are present
    const formData: ContactFormData = {
      name: parseResult.data.name,
      email: parseResult.data.email,
      phone: parseResult.data.phone,
      subject: parseResult.data.subject,
      message: parseResult.data.message,
    }

    // Send email
    const emailResult = await sendContactEmail(formData)

    if (!emailResult.success) {
      console.error('Failed to send contact email:', emailResult.error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          message: 'We encountered an error while sending your message. Please try again later.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.',
    })
  } catch (error) {
    console.error('Error in contact form endpoint:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        message: 'Failed to process contact form submission',
      },
      { status: 500 }
    )
  }
}

