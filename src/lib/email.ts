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

