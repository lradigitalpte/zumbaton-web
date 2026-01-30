/**
 * Email Service
 * Reusable email utility for sending emails via SMTP
 */

import nodemailer from 'nodemailer'

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  replyTo?: string
  from?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Create a reusable email transporter
 * Uses SMTP configuration from environment variables
 */
function createTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com'
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10)
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_USERNAME
  const smtpPassword = process.env.SMTP_PASSWORD
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465

  if (!smtpUser || !smtpPassword) {
    throw new Error('SMTP credentials not configured. Please set SMTP_USER and SMTP_PASSWORD environment variables.')
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  })
}

/**
 * Send an email using SMTP
 * 
 * @param options - Email options
 * @returns Promise with email result
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const transporter = createTransporter()
    
    const fromEmail = options.from || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER
    const fromName = process.env.SMTP_FROM_NAME || 'Zumbaton'
    const from = fromName ? `"${fromName}" <${fromEmail}>` : fromEmail

    const mailOptions = {
      from,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      replyTo: options.replyTo || fromEmail,
      attachments: options.attachments || [],
    }

    const info = await transporter.sendMail(mailOptions)

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Send a contact form email
 * 
 * @param formData - Contact form data
 * @returns Promise with email result
 */
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export async function sendContactEmail(formData: ContactFormData): Promise<EmailResult> {
  const recipientEmail = process.env.CONTACT_EMAIL || 'hello@zumbaton.sg'
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .value { color: #6b7280; }
        .message-box { background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #16a34a; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
        </div>
        <div class="content">
          <div class="field">
            <div class="label">Name:</div>
            <div class="value">${escapeHtml(formData.name)}</div>
          </div>
          <div class="field">
            <div class="label">Email:</div>
            <div class="value"><a href="mailto:${escapeHtml(formData.email)}">${escapeHtml(formData.email)}</a></div>
          </div>
          ${formData.phone ? `
          <div class="field">
            <div class="label">Phone:</div>
            <div class="value"><a href="tel:${escapeHtml(formData.phone)}">${escapeHtml(formData.phone)}</a></div>
          </div>
          ` : ''}
          <div class="field">
            <div class="label">Subject:</div>
            <div class="value">${escapeHtml(formData.subject)}</div>
          </div>
          <div class="field">
            <div class="label">Message:</div>
            <div class="message-box">${escapeHtml(formData.message).replace(/\n/g, '<br>')}</div>
          </div>
        </div>
        <div class="footer">
          <p>This email was sent from the Zumbaton website contact form.</p>
          <p>You can reply directly to this email to respond to ${escapeHtml(formData.name)}.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
New Contact Form Submission

Name: ${formData.name}
Email: ${formData.email}
${formData.phone ? `Phone: ${formData.phone}` : ''}
Subject: ${formData.subject}

Message:
${formData.message}

---
This email was sent from the Zumbaton website contact form.
You can reply directly to this email to respond to ${formData.name}.
  `

  return sendEmail({
    to: recipientEmail,
    subject: `Contact Form: ${formData.subject}`,
    html,
    text,
    replyTo: formData.email,
  })
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// =====================================================
// EMAIL TEMPLATE FUNCTIONS
// =====================================================

import {
  getWelcomeEmailTemplate,
  getTokenPurchaseEmailTemplate,
  getTokenExpiryWarningEmailTemplate,
  getClassReminderEmailTemplate,
  getBookingConfirmationEmailTemplate,
  getTokenAdjustmentEmailTemplate,
  getAdminCreatedUserEmailTemplate,
  getBookingCancellationEmailTemplate,
  getWaitlistPromotionEmailTemplate,
  getClassCancellationEmailTemplate,
  getNoShowWarningEmailTemplate,
  getPasswordResetEmailTemplate,
  getForgotPasswordEmailTemplate,
  getForgotPasswordOTPEmailTemplate,
  getBirthdayEmailTemplate,
} from './email-templates'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResult> {
  const template = getWelcomeEmailTemplate({ userName })
  
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to Zumbaton! 🎉',
    html: template.html,
    text: template.text,
  })
}

/**
 * Send token purchase confirmation email
 */
export async function sendTokenPurchaseEmail(data: {
  userEmail: string
  userName: string
  packageName: string
  tokenCount: number
  amount: number
  currency?: string
  expiresAt: string
}): Promise<EmailResult> {
  const template = getTokenPurchaseEmailTemplate({
    userName: data.userName,
    packageName: data.packageName,
    tokenCount: data.tokenCount,
    amount: data.amount,
    currency: data.currency,
    expiresAt: data.expiresAt,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `Payment Successful! ${data.tokenCount} tokens added`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send token expiry warning email
 */
export async function sendTokenExpiryWarningEmail(data: {
  userEmail: string
  userName: string
  tokensRemaining: number
  expiresAt: string
}): Promise<EmailResult> {
  const template = getTokenExpiryWarningEmailTemplate({
    userName: data.userName,
    tokensRemaining: data.tokensRemaining,
    expiresAt: data.expiresAt,
  })
  
  const expiresDate = new Date(data.expiresAt)
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  
  return sendEmail({
    to: data.userEmail,
    subject: `⏰ Your tokens expire in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send class reminder email (3 hours before)
 */
export async function sendClassReminderEmail(data: {
  userEmail: string
  userName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
}): Promise<EmailResult> {
  const template = getClassReminderEmailTemplate({
    userName: data.userName,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classLocation: data.classLocation,
    instructorName: data.instructorName,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `📅 Class Reminder: ${data.className} starts in 3 hours!`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(data: {
  userEmail: string
  userName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  tokensUsed: number
  instructorName?: string
}): Promise<EmailResult> {
  const template = getBookingConfirmationEmailTemplate({
    userName: data.userName,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classLocation: data.classLocation,
    tokensUsed: data.tokensUsed,
    instructorName: data.instructorName,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `🎉 Booking Confirmed: ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send token adjustment email (admin action)
 */
export async function sendTokenAdjustmentEmail(data: {
  userEmail: string
  userName: string
  tokensChange: number
  newBalance: number
  reason: string
  adjustedBy?: string
}): Promise<EmailResult> {
  const template = getTokenAdjustmentEmailTemplate({
    userName: data.userName,
    tokensChange: data.tokensChange,
    newBalance: data.newBalance,
    reason: data.reason,
    adjustedBy: data.adjustedBy,
  })
  
  const action = data.tokensChange > 0 ? 'added' : 'removed'
  
  return sendEmail({
    to: data.userEmail,
    subject: `Token Balance Updated: ${data.tokensChange > 0 ? '+' : ''}${data.tokensChange} tokens ${action}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send admin created user email
 */
export async function sendAdminCreatedUserEmail(data: {
  userEmail: string
  userName: string
  temporaryPassword?: string
  createdBy?: string
}): Promise<EmailResult> {
  const template = getAdminCreatedUserEmailTemplate({
    userName: data.userName,
    email: data.userEmail,
    temporaryPassword: data.temporaryPassword,
    createdBy: data.createdBy,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: 'Welcome to Zumbaton! Your account has been created',
    html: template.html,
    text: template.text,
  })
}

/**
 * Send booking cancellation email
 */
export async function sendBookingCancellationEmail(data: {
  userEmail: string
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensRefunded: number
  penalty?: boolean
  reason?: string
}): Promise<EmailResult> {
  const template = getBookingCancellationEmailTemplate({
    userName: data.userName,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    tokensRefunded: data.tokensRefunded,
    penalty: data.penalty,
    reason: data.reason,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `Booking Cancelled: ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send waitlist promotion email
 */
export async function sendWaitlistPromotionEmail(data: {
  userEmail: string
  userName: string
  className: string
  classDate: string
  confirmUrl: string
  expiresIn?: string
}): Promise<EmailResult> {
  const template = getWaitlistPromotionEmailTemplate({
    userName: data.userName,
    className: data.className,
    classDate: data.classDate,
    confirmUrl: data.confirmUrl,
    expiresIn: data.expiresIn,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `🎟️ Spot Available: ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send class cancellation email (admin cancelled class)
 */
export async function sendClassCancellationEmail(data: {
  userEmail: string
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensRefunded: number
}): Promise<EmailResult> {
  const template = getClassCancellationEmailTemplate({
    userName: data.userName,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    tokensRefunded: data.tokensRefunded,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `Class Cancelled: ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send no-show warning email
 */
export async function sendNoShowWarningEmail(data: {
  userEmail: string
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensConsumed: number
  noShowCount: number
  isFlagged?: boolean
}): Promise<EmailResult> {
  const template = getNoShowWarningEmailTemplate({
    userName: data.userName,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    tokensConsumed: data.tokensConsumed,
    noShowCount: data.noShowCount,
    isFlagged: data.isFlagged,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `⚠️ No-Show Recorded: ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send forgot password email (user requested reset)
 */
export async function sendForgotPasswordEmail(data: {
  userEmail: string
  userName: string
  resetLink: string
  expiresIn?: string
}): Promise<EmailResult> {
  const template = getForgotPasswordEmailTemplate({
    userName: data.userName,
    resetLink: data.resetLink,
    expiresIn: data.expiresIn,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: 'Reset Your Password - Zumbaton',
    html: template.html,
    text: template.text,
  })
}

/**
 * Send forgot password OTP email (6-digit code)
 */
export async function sendForgotPasswordOTPEmail(data: {
  userEmail: string
  userName: string
  otpCode: string
  verifyUrl?: string
  expiresIn?: string
}): Promise<EmailResult> {
  const template = getForgotPasswordOTPEmailTemplate({
    userName: data.userName,
    otpCode: data.otpCode,
    verifyUrl: data.verifyUrl,
    expiresIn: data.expiresIn,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: 'Password Reset Verification Code - Zumbaton',
    html: template.html,
    text: template.text,
  })
}

/**
 * Send password reset email (admin reset password)
 */
export async function sendPasswordResetEmail(data: {
  userEmail: string
  userName: string
  newPassword: string
  resetBy?: string
}): Promise<EmailResult> {
  const template = getPasswordResetEmailTemplate({
    userName: data.userName,
    newPassword: data.newPassword,
    resetBy: data.resetBy,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: 'Password Reset - Zumbaton',
    html: template.html,
    text: template.text,
  })
}

/**
 * Send birthday email
 */
export async function sendBirthdayEmail(data: {
  userEmail: string
  userName: string
  age?: number
}): Promise<EmailResult> {
  const template = getBirthdayEmailTemplate({
    userName: data.userName,
    age: data.age,
  })
  
  return sendEmail({
    to: data.userEmail,
    subject: `Happy Birthday${data.age ? ` ${data.age}` : ''}, ${data.userName}! 🎉`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send check-in confirmation email
 */
export async function sendCheckInConfirmationEmail(data: {
  userEmail: string
  userName: string
  className: string
  classDate: string
  classTime: string
  location?: string
  tokensUsed?: number
}): Promise<EmailResult> {
  const template = getCheckInConfirmationTemplate(data)
  
  return sendEmail({
    to: data.userEmail,
    subject: `Check-in Confirmed - ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

function getCheckInConfirmationTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  location?: string
  tokensUsed?: number
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Check-in Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 40px 0;">
            <table role="presentation" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 8px 8px 0 0;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">✓ Check-in Confirmed!</h1>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 20px; color: #1f2937; font-size: 16px; line-height: 1.5;">
                    Hi <strong>${data.userName}</strong>,
                  </p>
                  
                  <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                    Great news! You've successfully checked in to your class. We're excited to see you!
                  </p>
                  
                  <!-- Class Details Card -->
                  <table role="presentation" style="width: 100%; border: 2px solid #10b981; border-radius: 8px; margin-bottom: 30px;">
                    <tr>
                      <td style="padding: 20px; background-color: #f0fdf4;">
                        <h2 style="margin: 0 0 15px; color: #059669; font-size: 18px; font-weight: bold;">Class Details</h2>
                        
                        <table role="presentation" style="width: 100%;">
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; width: 100px;">Class:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.className}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Date:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.classDate}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Time:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.classTime}</td>
                          </tr>
                          ${data.location ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Location:</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${data.location}</td>
                          </tr>
                          ` : ''}
                          ${data.tokensUsed ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px;">Tokens:</td>
                            <td style="padding: 8px 0; color: #ea580c; font-size: 14px; font-weight: 600;">${data.tokensUsed} token${data.tokensUsed > 1 ? 's' : ''} used</td>
                          </tr>
                          ` : ''}
                        </table>
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 0 0 20px; color: #4b5563; font-size: 14px; line-height: 1.5;">
                    <strong>What to bring:</strong><br>
                    • Water bottle<br>
                    • Towel<br>
                    • Positive energy!
                  </p>
                  
                  <p style="margin: 0; color: #4b5563; font-size: 14px; line-height: 1.5;">
                    See you in class! 💃🕺
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                  <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                    Questions? Contact us at <a href="mailto:support@zumbaton.com" style="color: #f59e0b; text-decoration: none;">support@zumbaton.com</a>
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} Zumbaton. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const text = `
Check-in Confirmed!

Hi ${data.userName},

Great news! You've successfully checked in to your class. We're excited to see you!

Class Details:
- Class: ${data.className}
- Date: ${data.classDate}
- Time: ${data.classTime}
${data.location ? `- Location: ${data.location}` : ''}
${data.tokensUsed ? `- Tokens: ${data.tokensUsed} token${data.tokensUsed > 1 ? 's' : ''} used` : ''}

What to bring:
• Water bottle
• Towel
• Positive energy!

See you in class! 💃🕺

Questions? Contact us at support@zumbaton.com

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `

  return { html, text }
}

/**
 * Send referral voucher email (admin-issued discount)
 */
export async function sendReferralVoucherEmail(data: {
  userEmail: string
  userName: string
  voucherCode: string
  discountPercent: number
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Zumbaton</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Referral Discount</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${data.userName}</strong>,</p>
          
          <p style="margin-bottom: 20px;">
            You've received a <strong>${data.discountPercent}% discount</strong> voucher for your next token package purchase at Zumbaton.
          </p>
          
          <div style="background: white; border: 2px dashed #84cc16; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">Your voucher code</p>
            <p style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #15803d;">${data.voucherCode}</p>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #6b7280;">${data.discountPercent}% off your next package</p>
          </div>
          
          <p style="margin-bottom: 20px;">
            Use this code when you buy tokens on the Zumbaton app or website. The discount will be applied at checkout.
          </p>
          
          <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
            This voucher is for one-time use. If you have any questions, contact the Zumbaton team.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #9ca3af;">
          <p>© ${new Date().getFullYear()} Zumbaton. All rights reserved.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Your Referral Discount

Hi ${data.userName},

You've received a ${data.discountPercent}% discount voucher for your next token package purchase at Zumbaton.

Your voucher code: ${data.voucherCode}

Use this code when you buy tokens on the Zumbaton app or website. The discount will be applied at checkout.

This voucher is for one-time use.

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `

  return sendEmail({
    to: data.userEmail,
    subject: `Your ${data.discountPercent}% discount voucher – Zumbaton`,
    html,
    text: text.trim(),
  })
}

/**
 * Send registration form email
 */
export async function sendRegistrationFormEmail(data: {
  userEmail: string
  userName: string
  formUrl: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Zumbaton</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Complete Your Registration</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${data.userName}</strong>,</p>
          
          <p style="margin-bottom: 20px;">
            Please complete your registration by filling out the membership terms and conditions form. 
            This is required to finalize your membership with Zumbaton.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.formUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      display: inline-block;
                      font-size: 16px;">
              Complete Registration Form
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            This link will expire in 7 days. If you need a new link, please contact us.
          </p>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            <a href="${data.formUrl}" style="color: #667eea; word-break: break-all;">${data.formUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
          <p>© ${new Date().getFullYear()} Zumbaton. All rights reserved.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      </body>
    </html>
  `

  const text = `
Complete Your Registration

Hi ${data.userName},

Please complete your registration by filling out the membership terms and conditions form.
This is required to finalize your membership with Zumbaton.

Form Link: ${data.formUrl}

This link will expire in 7 days. If you need a new link, please contact us.

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `

  return await sendEmail({
    to: data.userEmail,
    subject: 'Zumbaton Registration Form - Action Required',
    html,
    text,
  })
}

/**
 * Send registration form completion email with PDF attachment
 */
export async function sendRegistrationFormCompletedEmail(data: {
  userEmail: string
  userName: string
  pdfBuffer: Buffer
  fileName: string
}): Promise<EmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Registration Complete!</h1>
          </div>
          <div class="content">
            <p>Hi ${data.userName},</p>
            
            <p>Thank you for completing your Zumbaton membership registration!</p>
            
            <p>Your registration form has been submitted and is attached to this email as a PDF. Please save this for your records.</p>
            
            <p><strong>What happens next:</strong></p>
            <ul>
              <li>Our staff will review and countersign your form</li>
              <li>You'll receive a final copy with all signatures</li>
              <li>Your membership will be fully activated</li>
            </ul>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Welcome to the Zumbaton family! 💃🕺</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Zumbaton. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const text = `
Registration Complete!

Hi ${data.userName},

Thank you for completing your Zumbaton membership registration!

Your registration form has been submitted and is attached to this email as a PDF. 
Please save this for your records.

What happens next:
- Our staff will review and countersign your form
- You'll receive a final copy with all signatures
- Your membership will be fully activated

If you have any questions, please don't hesitate to contact us.

Welcome to the Zumbaton family!

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `

  return await sendEmail({
    to: data.userEmail,
    subject: '✅ Your Zumbaton Registration Form',
    html,
    text,
    attachments: [
      {
        filename: data.fileName,
        content: data.pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}

/**
 * Send trial booking confirmation email to guest
 */
export async function sendTrialBookingConfirmationEmail(data: {
  guestEmail: string
  guestName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
  amount: number
  currency: string
}): Promise<EmailResult> {
  const { getTrialBookingConfirmationEmailTemplate } = await import('./email-templates')
  const template = getTrialBookingConfirmationEmailTemplate({
    guestName: data.guestName,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classLocation: data.classLocation,
    instructorName: data.instructorName,
    amount: data.amount,
    currency: data.currency,
  })
  
  return sendEmail({
    to: data.guestEmail,
    subject: `Trial Class Booked: ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send trial booking admin notification email
 */
export async function sendTrialBookingAdminNotificationEmail(data: {
  adminEmails: string[]
  guestName: string
  guestEmail: string
  guestPhone: string
  guestDateOfBirth?: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
  amount: number
  currency: string
  bookingId: string
}): Promise<EmailResult> {
  const { getTrialBookingAdminNotificationEmailTemplate } = await import('./email-templates')
  const template = getTrialBookingAdminNotificationEmailTemplate({
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    guestDateOfBirth: data.guestDateOfBirth,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classLocation: data.classLocation,
    instructorName: data.instructorName,
    amount: data.amount,
    currency: data.currency,
    bookingId: data.bookingId,
  })
  
  return sendEmail({
    to: data.adminEmails,
    subject: `New Trial Booking: ${data.guestName} - ${data.className}`,
    html: template.html,
    text: template.text,
  })
}
