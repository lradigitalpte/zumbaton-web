/**
 * Email Service
 * Reusable email utility for sending emails via Resend
 */

import { Resend } from 'resend'

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

export interface PaymentAlertEmailData {
  paymentId: string
  event: 'initiated' | 'succeeded' | 'failed'
  paymentType: 'package-purchase' | 'trial-booking'
  source: string
  amount: number
  currency?: string
  packageName?: string
  tokenCount?: number
  userName?: string
  userEmail?: string
  userPhone?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  className?: string
  failureReason?: string
}

/**
 * Resend client (lazy singleton)
 */
function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured.')
  }
  return new Resend(apiKey)
}

function getFromAddress(override?: string): string {
  if (override) return override

  const fromEmail =
    process.env.EMAIL_FROM ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.SMTP_FROM_EMAIL

  if (!fromEmail) {
    throw new Error('EMAIL_FROM is not configured.')
  }

  const fromName =
    process.env.EMAIL_FROM_NAME ||
    process.env.RESEND_FROM_NAME ||
    process.env.SMTP_FROM_NAME ||
    'One Step Fitness'

  return `${fromName} <${fromEmail}>`
}

function normalizeRecipients(to: string | string[]): string[] {
  const list = Array.isArray(to) ? to : [to]
  return list.map((entry) => entry.trim()).filter(Boolean)
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const resend = getResendClient()
    const from = getFromAddress(options.from)
    const to = normalizeRecipients(options.to)
    const replyToEmail =
      options.replyTo ||
      process.env.EMAIL_REPLY_TO ||
      process.env.EMAIL_FROM ||
      process.env.RESEND_FROM_EMAIL ||
      process.env.SMTP_FROM_EMAIL

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      replyTo: replyToEmail,
      attachments: options.attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
      })),
    })

    if (error) {
      console.error('Error sending email:', error)
      return {
        success: false,
        error: error.message || 'Failed to send email',
      }
    }

    return {
      success: true,
      messageId: data?.id,
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

function getConfiguredPaymentAlertRecipients(): string[] {
  const configuredRecipients = process.env.PAYMENT_ALERT_EMAIL || process.env.PAYMENT_ALERT_EMAILS || ''

  return configuredRecipients
    .split(/[;,]/)
    .map((recipient) => recipient.replace(/\s+#.*$/, '').trim())
    .filter(Boolean)
}

async function resolvePaymentAlertRecipients(): Promise<string[]> {
  try {
    const { getSupabaseAdminClient } = await import('./supabase')
    const { getStaffAlertRecipients } = await import('./alert-email-recipients')
    const supabase = getSupabaseAdminClient()
    const recipients = await getStaffAlertRecipients(supabase)

    if (recipients.length > 0) {
      return recipients
    }
  } catch (error) {
    console.error('[Email] Failed to resolve payment alert recipients from settings:', error)
  }

  return getConfiguredPaymentAlertRecipients()
}

export async function sendPaymentAlertEmail(data: PaymentAlertEmailData): Promise<EmailResult> {
  const recipients = await resolvePaymentAlertRecipients()

  if (recipients.length === 0) {
    return { success: true }
  }

  const template = getPaymentAlertEmailTemplate({
    event: data.event,
    paymentType: data.paymentType,
    paymentId: data.paymentId,
    source: data.source,
    amount: data.amount,
    currency: data.currency,
    packageName: data.packageName,
    tokenCount: data.tokenCount,
    className: data.className,
    customerName: data.userName || data.guestName || 'Unknown customer',
    customerEmail: data.userEmail || data.guestEmail || null,
    customerPhone: data.userPhone || data.guestPhone || null,
    failureReason: data.failureReason,
  })

  return sendEmail({
    to: recipients,
    subject: `[One Step Fitness] ${template.title}`,
    html: template.html,
    text: template.text,
  })
}

export async function sendSuccessfulPaymentAlertEmail(
  data: Omit<PaymentAlertEmailData, 'event'>
): Promise<EmailResult> {
  return sendPaymentAlertEmail({
    ...data,
    event: 'succeeded',
  })
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
  const recipientEmail = process.env.CONTACT_EMAIL || 'hello@onestepfitness.sg'
  
  const { html, text } = getContactFormEmailTemplate(formData)

  return sendEmail({
    to: recipientEmail,
    subject: `Contact Form: ${formData.subject}`,
    html,
    text,
    replyTo: formData.email,
  })
}

// =====================================================
// EMAIL TEMPLATE FUNCTIONS
// =====================================================

import {
  getWelcomeEmailTemplate,
  getTokenPurchaseEmailTemplate,
  getTokenExpiryWarningEmailTemplate,
  getClassReminderEmailTemplate,
  getStreakReminderEmailTemplate,
  getStreakReminderSubject,
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
  getLeadFollowUpEmailTemplate,
  getPaymentAlertEmailTemplate,
  getContactFormEmailTemplate,
  getReferralVoucherEmailTemplate,
  getRegistrationFormEmailTemplate,
  getRegistrationFormCompletedEmailTemplate,
  getInvoiceEmailTemplate,
} from './email-templates'

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResult> {
  const template = getWelcomeEmailTemplate({ userName })
  
  return sendEmail({
    to: userEmail,
    subject: `Welcome to One Step Fitness, ${userName.trim().split(/\s+/)[0] || 'friend'}`,
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
    subject: `Payment received: ${data.tokenCount} ${data.tokenCount === 1 ? 'token' : 'tokens'} added`,
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
    subject: `Your tokens expire in ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}`,
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
    subject: `${data.className} starts in 3 hours (${data.classTime})`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Remind a member to attend once this week so their week streak survives Sunday.
 */
export async function sendStreakReminderEmail(data: {
  userEmail: string
  userName: string
  streakWeeks: number
  bookUrl: string
}): Promise<EmailResult> {
  const template = getStreakReminderEmailTemplate({
    userName: data.userName,
    streakWeeks: data.streakWeeks,
    bookUrl: data.bookUrl,
  })

  return sendEmail({
    to: data.userEmail,
    subject: getStreakReminderSubject(data.streakWeeks),
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
    subject: `You're booked: ${data.className}, ${data.classDate}`,
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
    subject: 'Welcome to One Step Fitness! Your account has been created',
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
    subject: `A spot opened in ${data.className}. Confirm it now`,
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
    subject: `Sorry, ${data.className} on ${data.classDate} is cancelled`,
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
    subject: `We missed you at ${data.className}`,
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
    subject: 'Reset Your Password - One Step Fitness',
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
    subject: `Your One Step Fitness code: ${data.otpCode}`,
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
    subject: 'Password Reset - One Step Fitness',
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
    subject: `Happy birthday, ${data.userName.trim().split(/\s+/)[0] || data.userName} 🎂`,
    html: template.html,
    text: template.text,
  })
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
  const { html, text } = getReferralVoucherEmailTemplate({
    userName: data.userName,
    voucherCode: data.voucherCode,
    discountPercent: data.discountPercent,
  })

  return sendEmail({
    to: data.userEmail,
    subject: `Your ${data.discountPercent}% discount voucher – One Step Fitness`,
    html,
    text,
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
  const { html, text } = getRegistrationFormEmailTemplate({ userName: data.userName, formUrl: data.formUrl })

  return await sendEmail({
    to: data.userEmail,
    subject: 'One quick form to finish your One Step Fitness registration',
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
  const { html, text } = getRegistrationFormCompletedEmailTemplate({ userName: data.userName })

  return await sendEmail({
    to: data.userEmail,
    subject: 'Your One Step Fitness registration form',
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
 * Send a "pick your class" link to an already-paid pay-first guest who hasn't
 * been scheduled yet, so they can self-serve instead of waiting on staff.
 */
export async function sendPickClassLinkEmail(data: {
  guestEmail: string
  guestName: string
  venueLabel: string
  pickClassUrl: string
}): Promise<EmailResult> {
  const { getPickClassLinkEmailTemplate } = await import('./email-templates')
  const template = getPickClassLinkEmailTemplate({
    guestName: data.guestName,
    venueLabel: data.venueLabel,
    pickClassUrl: data.pickClassUrl,
  })

  return sendEmail({
    to: data.guestEmail,
    subject: `Pick Your Trial Class — ${data.venueLabel}`,
    html: template.html,
    text: template.text,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  })
}

/**
 * Send checkout reminder email (customer started HitPay checkout but didn't pay)
 */
export async function sendCheckoutReminderEmail(data: {
  customerEmail: string
  customerName: string
  itemLabel: string
  itemDetail?: string
  amountLabel: string
  checkoutUrl: string
}): Promise<EmailResult> {
  const { getCheckoutReminderEmailTemplate } = await import('./email-templates')
  const template = getCheckoutReminderEmailTemplate({
    customerName: data.customerName,
    itemLabel: data.itemLabel,
    itemDetail: data.itemDetail,
    amountLabel: data.amountLabel,
    checkoutUrl: data.checkoutUrl,
  })

  return sendEmail({
    to: data.customerEmail,
    subject: `Finish your payment — ${data.itemLabel}`,
    html: template.html,
    text: template.text,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
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

/**
 * Send member booking admin notification email
 */
export async function sendMemberBookingAdminNotificationEmail(data: {
  adminEmails: string[]
  memberName: string
  memberEmail: string
  memberPhone?: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
  tokensUsed: number
  bookingId?: string
  bookingNote?: string
}): Promise<EmailResult> {
  const { getMemberBookingAdminNotificationEmailTemplate } = await import('./email-templates')
  const template = getMemberBookingAdminNotificationEmailTemplate({
    memberName: data.memberName,
    memberEmail: data.memberEmail,
    memberPhone: data.memberPhone,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classLocation: data.classLocation,
    instructorName: data.instructorName,
    tokensUsed: data.tokensUsed,
    bookingId: data.bookingId,
    bookingNote: data.bookingNote,
  })

  return sendEmail({
    to: data.adminEmails,
    subject: `New Booking: ${data.memberName} - ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send member booking tutor notification email
 */
export async function sendMemberBookingTutorNotificationEmail(data: {
  tutorEmail: string
  memberName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  tokensUsed?: number
  bookingNote?: string
}): Promise<EmailResult> {
  const { getMemberBookingTutorNotificationEmailTemplate } = await import('./email-templates')
  const template = getMemberBookingTutorNotificationEmailTemplate({
    memberName: data.memberName,
    className: data.className,
    classDate: data.classDate,
    classTime: data.classTime,
    classLocation: data.classLocation,
    tokensUsed: data.tokensUsed,
    bookingNote: data.bookingNote,
  })

  return sendEmail({
    to: data.tutorEmail,
    subject: `New student booked: ${data.className}`,
    html: template.html,
    text: template.text,
  })
}

export async function sendLeadFollowUpEmail(data: {
  leadEmail: string
  leadName: string
  subject: string
  bodyText: string
}): Promise<EmailResult> {
  const template = getLeadFollowUpEmailTemplate({
    leadName: data.leadName,
    bodyText: data.bodyText,
    subject: data.subject,
  })

  return sendEmail({
    to: data.leadEmail,
    subject: data.subject,
    html: template.html,
    text: template.text,
    replyTo: process.env.EMAIL_REPLY_TO || undefined,
  })
}

/**
 * Send an invoice email (registered-user purchase or guest trial booking).
 * Links to the hosted PDF rather than attaching it.
 */
export async function sendInvoiceEmail(data: {
  toEmail: string
  toName: string
  invoiceNumber: string
  amount: number
  currency: string
  description: string
  pdfUrl: string
  issuedAt: string
}): Promise<EmailResult> {
  const amountLabel = `${data.currency} ${data.amount.toFixed(2)}`
  const issuedDateLabel = new Date(data.issuedAt).toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const { html, text } = getInvoiceEmailTemplate({
    toName: data.toName,
    invoiceNumber: data.invoiceNumber,
    amountLabel,
    issuedDateLabel,
    description: data.description,
    pdfUrl: data.pdfUrl,
  })

  return sendEmail({
    to: data.toEmail,
    subject: `Invoice ${data.invoiceNumber} — One Step Fitness`,
    html,
    text,
  })
}
