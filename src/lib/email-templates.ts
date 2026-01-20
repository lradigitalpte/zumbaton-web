/**
 * Professional Email Templates for Zumbaton
 * All templates use a consistent, clean design without emojis
 */

export interface EmailTemplateData {
  userName?: string
  [key: string]: unknown
}

/**
 * Base email template with consistent styling and mobile responsiveness
 */
function getBaseTemplate(content: string, preheader?: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Zumbaton</title>
  <style type="text/css">
    ${preheader ? `#preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; }` : ''}
    
    /* Mobile Responsive Styles */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        padding: 10px !important;
      }
      
      .email-content {
        padding: 20px 15px !important;
      }
      
      .email-header {
        padding: 30px 20px !important;
      }
      
      .email-header h1 {
        font-size: 24px !important;
      }
      
      .email-header p {
        font-size: 13px !important;
      }
      
      .email-footer {
        padding: 20px 15px !important;
      }
      
      .email-footer p {
        font-size: 13px !important;
      }
      
      .email-footer a {
        display: block !important;
        margin: 5px 0 !important;
      }
      
      .mobile-button {
        display: block !important;
        width: 100% !important;
        padding: 14px 20px !important;
        font-size: 16px !important;
        text-align: center !important;
      }
      
      .mobile-table {
        width: 100% !important;
        display: block !important;
      }
      
      .mobile-table td {
        display: block !important;
        width: 100% !important;
        padding: 8px 0 !important;
        text-align: left !important;
      }
      
      .mobile-table td:first-child {
        font-weight: 600 !important;
        color: #374151 !important;
        margin-bottom: 4px !important;
      }
      
      .mobile-spacing {
        margin: 20px 0 !important;
      }
      
      .mobile-text {
        font-size: 14px !important;
        line-height: 1.5 !important;
      }
      
      .mobile-title {
        font-size: 20px !important;
      }
      
      .mobile-subtitle {
        font-size: 15px !important;
      }
      
      .mobile-box {
        padding: 15px !important;
        margin: 20px 0 !important;
      }
      
      .mobile-otp {
        font-size: 28px !important;
        padding: 15px 30px !important;
        letter-spacing: 4px !important;
      }
      
      .mobile-link-break {
        display: block !important;
      }
    }
    
    /* Prevent auto-linking on iOS */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  ${preheader ? `<div id="preheader" style="display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">${preheader}</div>` : ''}
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f3f4f6; padding: 20px;" class="email-container">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 30px; text-align: center;" class="email-header">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">Zumbaton</h1>
              <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 14px; font-weight: 500;">Dance Your Way to Fitness</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;" class="email-content">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;" class="email-footer">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                <strong style="color: #374151;">Zumbaton Fitness Studio</strong><br>
                Singapore<br>
                <a href="mailto:hello@zumbaton.sg" style="color: #16a34a; text-decoration: none;">hello@zumbaton.sg</a><span class="mobile-link-break" style="display: inline;"> | </span>
                <a href="tel:+6584927347" style="color: #16a34a; text-decoration: none;">+65 8492 7347</a>
              </p>
              <p style="margin: 20px 0 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Zumbaton. All rights reserved.<br>
                Designed by LRA Digital
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Welcome Email Template
 */
export function getWelcomeEmailTemplate(data: { userName: string }): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Welcome to Zumbaton, ${escapeHtml(data.userName)}!</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">We're thrilled to have you join our dance fitness community!</p>
    </div>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 15px 0; color: #15803d; font-size: 18px; font-weight: 600;" class="mobile-subtitle">Get Started</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;" class="mobile-text">
        <li style="margin-bottom: 8px;">Browse our exciting dance classes</li>
        <li style="margin-bottom: 8px;">Purchase token packages to book classes</li>
        <li style="margin-bottom: 8px;">Book your first session and start dancing!</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/packages" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Browse Packages
      </a>
    </div>
    
    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;" class="mobile-text">
      If you have any questions, feel free to reach out to us at 
      <a href="mailto:hello@zumbaton.sg" style="color: #16a34a; text-decoration: none;">hello@zumbaton.sg</a>
    </p>
  `, `Welcome to Zumbaton! Start your dance fitness journey today.`)

  const text = `
Welcome to Zumbaton, ${data.userName}!

We're thrilled to have you join our dance fitness community!

Get Started:
- Browse our exciting dance classes
- Purchase token packages to book classes
- Book your first session and start dancing!

Visit: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/packages

If you have any questions, feel free to reach out to us at hello@zumbaton.sg

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Token Purchase Confirmation Email Template
 */
export function getTokenPurchaseEmailTemplate(data: {
  userName: string
  packageName: string
  tokenCount: number
  amount: number
  currency?: string
  expiresAt: string
}): { html: string; text: string } {
  const currency = data.currency || 'SGD'
  const formattedAmount = new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency,
  }).format(data.amount)
  
  const expiresDate = new Date(data.expiresAt)
  const formattedExpiry = expiresDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Payment Successful!</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Your token package has been added to your account</p>
    </div>
    
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0;" class="mobile-box">
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Package:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.packageName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Tokens Added:</td>
          <td style="padding: 10px 0; color: #16a34a; font-weight: 700; font-size: 18px;">${data.tokenCount} tokens</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Amount Paid:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${formattedAmount}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Expires:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${formattedExpiry}</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-packages" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        View My Packages
      </a>
    </div>
    
    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;" class="mobile-text">
      Ready to book a class? <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes" style="color: #16a34a; text-decoration: none; font-weight: 600;">Browse Classes</a>
    </p>
  `, `Payment successful! ${data.tokenCount} tokens added to your account.`)

  const text = `
Payment Successful!

Hi ${data.userName},

Your token package has been successfully added to your account.

Package: ${data.packageName}
Tokens Added: ${data.tokenCount} tokens
Amount Paid: ${formattedAmount}
Expires: ${formattedExpiry}

View your packages: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-packages
Browse classes: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Token Expiry Warning Email Template
 */
export function getTokenExpiryWarningEmailTemplate(data: {
  userName: string
  tokensRemaining: number
  expiresAt: string
}): { html: string; text: string } {
  const expiresDate = new Date(data.expiresAt)
  const formattedExpiry = expiresDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  
  const daysUntilExpiry = Math.ceil((expiresDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Your Tokens Are Expiring Soon</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Don't let your tokens go to waste!</p>
    </div>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 15px 0; color: #d97706; font-size: 18px; font-weight: 600;">Package Details</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Tokens Remaining:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 700; font-size: 18px;">${data.tokensRemaining} tokens</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Expires In:</td>
          <td style="padding: 10px 0; color: #d97706; font-weight: 700; font-size: 18px;">${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Expiry Date:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${formattedExpiry}</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>Important:</strong> Book a class now to use your tokens before they expire! Unused tokens will be lost after the expiry date.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Book a Class Now
      </a>
    </div>
  `, `Your tokens expire in ${daysUntilExpiry} days. Book a class now!`)

  const text = `
Your Tokens Are Expiring Soon

Hi ${data.userName},

Your token package is expiring soon. Don't let your tokens go to waste!

Tokens Remaining: ${data.tokensRemaining} tokens
Expires In: ${daysUntilExpiry} ${daysUntilExpiry === 1 ? 'day' : 'days'}
Expiry Date: ${formattedExpiry}

Important: Book a class now to use your tokens before they expire! Unused tokens will be lost after the expiry date.

Book a class: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Class Reminder Email Template (3 hours before)
 */
export function getClassReminderEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  instructorName?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Class Reminder</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Your class starts in 3 hours!</p>
    </div>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 25px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 20px 0; color: #1e40af; font-size: 20px; font-weight: 600;" class="mobile-subtitle">${escapeHtml(data.className)}</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Date:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Time:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classTime)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Location:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classLocation)}</td>
        </tr>
        ${data.instructorName ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Instructor:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.instructorName)}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>Reminder:</strong> Please arrive 10 minutes early. Bring water and wear comfortable workout clothes. We can't wait to see you!
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-bookings" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        View My Bookings
      </a>
    </div>
  `, `Class reminder: ${data.className} starts in 3 hours!`)

  const text = `
Class Reminder

Hi ${data.userName},

Your class starts in 3 hours!

Class: ${data.className}
Date: ${data.classDate}
Time: ${data.classTime}
Location: ${data.classLocation}
${data.instructorName ? `Instructor: ${data.instructorName}` : ''}

Reminder: Please arrive 10 minutes early. Bring water and wear comfortable workout clothes. We can't wait to see you!

View bookings: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-bookings

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Booking Confirmation Email Template
 */
export function getBookingConfirmationEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  classLocation: string
  tokensUsed: number
  instructorName?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Booking Confirmed!</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">You're all set for your class</p>
    </div>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin: 0 0 20px 0; color: #15803d; font-size: 20px; font-weight: 600;" class="mobile-subtitle">${escapeHtml(data.className)}</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Date:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Time:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classTime)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Location:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classLocation)}</td>
        </tr>
        ${data.instructorName ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Instructor:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.instructorName)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Tokens:</td>
          <td style="padding: 10px 0; color: #16a34a; font-weight: 700; font-size: 15px;">${data.tokensUsed} token${data.tokensUsed !== 1 ? 's' : ''} used</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>What's Next?</strong><br>
        You'll receive a reminder 3 hours before your class. Please arrive 10 minutes early and bring water!
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-bookings" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        View My Bookings
      </a>
    </div>
  `, `Booking confirmed! ${data.className} on ${data.classDate}`)

  const text = `
Booking Confirmed!

Hi ${data.userName},

Your booking has been confirmed!

Class: ${data.className}
Date: ${data.classDate}
Time: ${data.classTime}
Location: ${data.classLocation}
${data.instructorName ? `Instructor: ${data.instructorName}` : ''}
Tokens: ${data.tokensUsed} token${data.tokensUsed !== 1 ? 's' : ''} used

What's Next?
You'll receive a reminder 3 hours before your class. Please arrive 10 minutes early and bring water!

View bookings: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-bookings

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Token Adjustment Email Template (Admin Action)
 */
export function getTokenAdjustmentEmailTemplate(data: {
  userName: string
  tokensChange: number
  newBalance: number
  reason: string
  adjustedBy?: string
}): { html: string; text: string } {
  const isPositive = data.tokensChange > 0
  const action = isPositive ? 'added' : 'removed'
  const actionColor = isPositive ? '#16a34a' : '#dc2626'

  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Token Balance ${isPositive ? 'Updated' : 'Adjusted'}</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Your token balance has been ${action} by an administrator</p>
    </div>
    
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0;" class="mobile-box">
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Tokens ${isPositive ? 'Added' : 'Removed'}:</td>
          <td style="padding: 10px 0; color: ${actionColor}; font-weight: 700; font-size: 18px;">${isPositive ? '+' : ''}${data.tokensChange} tokens</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">New Balance:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 700; font-size: 18px;">${data.newBalance} tokens</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Reason:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.reason)}</td>
        </tr>
        ${data.adjustedBy ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Adjusted By:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.adjustedBy)}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-packages" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        View My Packages
      </a>
    </div>
  `, `Token balance ${action}: ${isPositive ? '+' : ''}${data.tokensChange} tokens. New balance: ${data.newBalance} tokens.`)

  const text = `
Token Balance ${isPositive ? 'Updated' : 'Adjusted'}

Hi ${data.userName},

Your token balance has been ${action} by an administrator.

Tokens ${isPositive ? 'Added' : 'Removed'}: ${isPositive ? '+' : ''}${data.tokensChange} tokens
New Balance: ${data.newBalance} tokens
Reason: ${data.reason}
${data.adjustedBy ? `Adjusted By: ${data.adjustedBy}` : ''}

View your packages: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-packages

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Admin Created User Email Template
 */
export function getAdminCreatedUserEmailTemplate(data: {
  userName: string
  email: string
  temporaryPassword?: string
  createdBy?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Welcome to Zumbaton, ${escapeHtml(data.userName)}!</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Your account has been created by our team</p>
    </div>
    
    ${data.temporaryPassword ? `
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 10px 0; color: #d97706; font-size: 18px; font-weight: 600;" class="mobile-subtitle">Temporary Password</h3>
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        Your temporary password: <strong style="font-family: monospace; background: white; padding: 4px 8px; border-radius: 4px;">${escapeHtml(data.temporaryPassword)}</strong>
      </p>
      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;" class="mobile-text">
        Please change this password after your first login for security.
      </p>
    </div>
    ` : ''}
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 15px 0; color: #15803d; font-size: 18px; font-weight: 600;" class="mobile-subtitle">Get Started</h3>
      <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 1.8;" class="mobile-text">
        <li style="margin-bottom: 8px;">Sign in to your account</li>
        <li style="margin-bottom: 8px;">${data.temporaryPassword ? 'Change your temporary password' : 'Set up your profile'}</li>
        <li style="margin-bottom: 8px;">Browse classes and book your first session</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/signin" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3); margin-bottom: 15px;">
        Sign In Now
      </a>
      ${data.temporaryPassword ? `
      <div style="margin-top: 20px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/forgot-password" 
           style="color: #16a34a; text-decoration: none; font-size: 14px; font-weight: 500;">
          Change your password
        </a>
      </div>
      ` : ''}
    </div>
    
    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;" class="mobile-text">
      If you have any questions, feel free to reach out to us at 
      <a href="mailto:hello@zumbaton.sg" style="color: #16a34a; text-decoration: none;">hello@zumbaton.sg</a>
    </p>
  `, `Welcome to Zumbaton! Your account has been created.${data.temporaryPassword ? ` Temporary password: ${data.temporaryPassword}` : ''}`)

  const text = `
Welcome to Zumbaton, ${data.userName}!

Your account has been created by our team.

${data.temporaryPassword ? `
Temporary Password: ${data.temporaryPassword}
Please change this password after your first login for security.
` : ''}

Get Started:
- Sign in to your account
- ${data.temporaryPassword ? 'Change your temporary password' : 'Set up your profile'}
- Browse classes and book your first session

Sign in: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/signin
${data.temporaryPassword ? `Change password: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/forgot-password` : ''}

If you have any questions, feel free to reach out to us at hello@zumbaton.sg

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Booking Cancellation Email Template
 */
export function getBookingCancellationEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensRefunded: number
  penalty?: boolean
  reason?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Booking Cancelled</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Your class booking has been cancelled</p>
    </div>
    
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 20px 0; color: #111827; font-size: 20px; font-weight: 600;">${escapeHtml(data.className)}</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Date:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Time:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classTime)}</td>
        </tr>
        ${data.tokensRefunded > 0 ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Tokens:</td>
          <td style="padding: 10px 0; color: #16a34a; font-weight: 700; font-size: 15px;">${data.tokensRefunded} token${data.tokensRefunded !== 1 ? 's' : ''} refunded</td>
        </tr>
        ` : data.penalty ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Note:</td>
          <td style="padding: 10px 0; color: #dc2626; font-weight: 600; font-size: 15px;">Late cancellation - tokens consumed</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    ${data.reason ? `
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>Reason:</strong> ${escapeHtml(data.reason)}
      </p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Book Another Class
      </a>
    </div>
  `, `Booking cancelled: ${data.className} on ${data.classDate}`)

  const text = `
Booking Cancelled

Hi ${data.userName},

Your booking has been cancelled.

Class: ${data.className}
Date: ${data.classDate}
Time: ${data.classTime}
${data.tokensRefunded > 0 ? `Tokens: ${data.tokensRefunded} token${data.tokensRefunded !== 1 ? 's' : ''} refunded` : data.penalty ? 'Note: Late cancellation - tokens consumed' : ''}
${data.reason ? `Reason: ${data.reason}` : ''}

Book another class: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Waitlist Promotion Email Template
 */
export function getWaitlistPromotionEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  confirmUrl: string
  expiresIn?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Spot Available!</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">A spot has opened up in the class you were waiting for</p>
    </div>
    
    <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 25px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin: 0 0 20px 0; color: #d97706; font-size: 20px; font-weight: 600;" class="mobile-subtitle">${escapeHtml(data.className)}</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Date:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classDate)}</td>
        </tr>
        ${data.expiresIn ? `
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Expires:</td>
          <td style="padding: 10px 0; color: #d97706; font-weight: 700; font-size: 15px;">${escapeHtml(data.expiresIn)}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>Important:</strong> This spot is reserved for you, but you need to confirm your booking soon. If you don't confirm within the time limit, the spot will be offered to the next person on the waitlist.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${data.confirmUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Confirm Booking Now
      </a>
    </div>
  `, `Spot available! Confirm your booking for ${data.className}`)

  const text = `
Spot Available!

Hi ${data.userName},

A spot has opened up in the class you were waiting for!

Class: ${data.className}
Date: ${data.classDate}
${data.expiresIn ? `Expires: ${data.expiresIn}` : ''}

Important: This spot is reserved for you, but you need to confirm your booking soon. If you don't confirm within the time limit, the spot will be offered to the next person on the waitlist.

Confirm booking: ${data.confirmUrl}

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Class Cancellation Email Template (Admin cancelled class)
 */
export function getClassCancellationEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensRefunded: number
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Class Cancelled</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">We're sorry, but this class has been cancelled</p>
    </div>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 25px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 20px 0; color: #991b1b; font-size: 20px; font-weight: 600;" class="mobile-subtitle">${escapeHtml(data.className)}</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Date:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Time:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classTime)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Tokens:</td>
          <td style="padding: 10px 0; color: #16a34a; font-weight: 700; font-size: 15px;">${data.tokensRefunded} token${data.tokensRefunded !== 1 ? 's' : ''} refunded</td>
        </tr>
      </table>
    </div>
    
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>What Happened?</strong><br>
        This class has been cancelled by our team. Your tokens have been automatically refunded to your account. We apologize for any inconvenience.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Browse Other Classes
      </a>
    </div>
  `, `Class cancelled: ${data.className} on ${data.classDate}`)

  const text = `
Class Cancelled

Hi ${data.userName},

We're sorry, but this class has been cancelled.

Class: ${data.className}
Date: ${data.classDate}
Time: ${data.classTime}
Tokens: ${data.tokensRefunded} token${data.tokensRefunded !== 1 ? 's' : ''} refunded

What Happened?
This class has been cancelled by our team. Your tokens have been automatically refunded to your account. We apologize for any inconvenience.

Browse other classes: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/classes

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * No-Show Warning Email Template
 */
export function getNoShowWarningEmailTemplate(data: {
  userName: string
  className: string
  classDate: string
  classTime: string
  tokensConsumed: number
  noShowCount: number
  isFlagged?: boolean
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">No-Show Recorded</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">You missed your scheduled class</p>
    </div>
    
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 25px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 20px 0; color: #991b1b; font-size: 20px; font-weight: 600;" class="mobile-subtitle">${escapeHtml(data.className)}</h3>
      <table role="presentation" style="width: 100%; border-collapse: collapse;" class="mobile-table">
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; width: 140px; vertical-align: top;">Date:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classDate)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Time:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${escapeHtml(data.classTime)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Tokens:</td>
          <td style="padding: 10px 0; color: #dc2626; font-weight: 700; font-size: 15px;">${data.tokensConsumed} token${data.tokensConsumed !== 1 ? 's' : ''} consumed</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 15px; vertical-align: top;">Total No-Shows:</td>
          <td style="padding: 10px 0; color: #111827; font-weight: 600; font-size: 15px;">${data.noShowCount}</td>
        </tr>
      </table>
    </div>
    
    ${data.isFlagged ? `
    <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #991b1b; font-size: 15px; line-height: 1.6; font-weight: 600;">
        Your account has been flagged due to multiple no-shows. Please contact us if you have any questions.
      </p>
    </div>
    ` : ''}
    
    <div style="background-color: #eff6ff; border-radius: 8px; padding: 20px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>Reminder:</strong> If you can't make it to a class, please cancel at least 24 hours in advance to avoid losing tokens. You can cancel bookings from your "My Bookings" page.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-bookings" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        View My Bookings
      </a>
    </div>
  `, `No-show recorded: ${data.className} on ${data.classDate}`)

  const text = `
No-Show Recorded

Hi ${data.userName},

You missed your scheduled class.

Class: ${data.className}
Date: ${data.classDate}
Time: ${data.classTime}
Tokens: ${data.tokensConsumed} token${data.tokensConsumed !== 1 ? 's' : ''} consumed
Total No-Shows: ${data.noShowCount}

${data.isFlagged ? 'Your account has been flagged due to multiple no-shows. Please contact us if you have any questions.' : ''}

Reminder: If you can't make it to a class, please cancel at least 24 hours in advance to avoid losing tokens. You can cancel bookings from your "My Bookings" page.

View bookings: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/my-bookings

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Forgot Password Email Template (User requested reset)
 */
export function getForgotPasswordEmailTemplate(data: {
  userName: string
  resetLink: string
  expiresIn?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Reset Your Password</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Click the button below to reset your password</p>
    </div>
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>Security Note:</strong> This link will expire ${data.expiresIn || 'in 1 hour'}. If you didn't request this password reset, please ignore this email or contact us if you have concerns.
      </p>
    </div>
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${data.resetLink}" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Reset Password
      </a>
    </div>
    
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 30px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;" class="mobile-text">
        <strong>Having trouble?</strong> If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 10px 0 0 0; color: #3b82f6; font-size: 13px; word-break: break-all; font-family: monospace;">
        ${data.resetLink}
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;" class="mobile-text">
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    </p>
  `, `Reset your password: Click the link to reset your password`)

  const text = `
Reset Your Password

Hi ${data.userName},

Click the link below to reset your password:

${data.resetLink}

Security Note: This link will expire ${data.expiresIn || 'in 1 hour'}. If you didn't request this password reset, please ignore this email.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Forgot Password OTP Email Template (6-digit code)
 */
export function getForgotPasswordOTPEmailTemplate(data: {
  userName: string
  otpCode: string
  verifyUrl?: string
  expiresIn?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Reset Your Password</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Enter the verification code below to reset your password</p>
    </div>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 20px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <p style="margin: 0 0 15px 0; color: #374151; font-size: 15px; line-height: 1.6; text-align: center;">
        <strong>Your verification code:</strong>
      </p>
      <div style="text-align: center; margin: 20px 0;">
         <div style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; padding: 20px 40px; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: monospace; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-otp">
          ${escapeHtml(data.otpCode)}
        </div>
      </div>
      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;">
        This code will expire ${data.expiresIn || 'in 15 minutes'}.
      </p>
    </div>
    
    ${data.verifyUrl ? `
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${data.verifyUrl}" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Verify Code
      </a>
    </div>
    ` : ''}
    
    <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email or contact us if you have concerns.
      </p>
    </div>
    
    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;" class="mobile-text">
      If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
    </p>
  `, `Reset your password: Enter verification code ${data.otpCode}`)

  const text = `
Reset Your Password

Hi ${data.userName},

Enter this verification code to reset your password:

${data.otpCode}

This code will expire ${data.expiresIn || 'in 15 minutes'}.

${data.verifyUrl ? `Visit this page to enter your code: ${data.verifyUrl}` : ''}

Security Note: If you didn't request this password reset, please ignore this email.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Password Reset Email Template (Admin reset password)
 */
export function getPasswordResetEmailTemplate(data: {
  userName: string
  newPassword: string
  resetBy?: string
}): { html: string; text: string } {
  const html = getBaseTemplate(`
    <div style="text-align: center; margin-bottom: 30px;" class="mobile-spacing">
      <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 24px; font-weight: 700;" class="mobile-title">Password Reset</h2>
      <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-subtitle">Your password has been reset by an administrator</p>
    </div>
    
    <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 30px 0;" class="mobile-box">
      <h3 style="margin: 0 0 10px 0; color: #d97706; font-size: 18px; font-weight: 600;" class="mobile-subtitle">New Password</h3>
       <p style="margin: 0; color: #374151; font-size: 15px; line-height: 1.6;" class="mobile-text">
        Your new password: <strong style="font-family: monospace; background: white; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-top: 8px;">${escapeHtml(data.newPassword)}</strong>
      </p>
      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;" class="mobile-text">
        Please change this password after your first login for security.
      </p>
    </div>
    
    ${data.resetBy ? `
    <div style="background-color: #f9fafb; border-radius: 8px; padding: 15px; margin: 30px 0;">
      <p style="margin: 0; color: #6b7280; font-size: 14px;" class="mobile-text">
        Password reset by: <strong>${escapeHtml(data.resetBy)}</strong>
      </p>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin: 40px 0;" class="mobile-spacing">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/signin" 
         style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(22, 163, 74, 0.3);" class="mobile-button">
        Sign In Now
      </a>
    </div>
    
    <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6; text-align: center;" class="mobile-text">
      If you didn't request this password reset, please contact us immediately at 
      <a href="mailto:hello@zumbaton.sg" style="color: #16a34a; text-decoration: none;">hello@zumbaton.sg</a>
    </p>
  `, `Password reset: Your new password is ${data.newPassword}`)

  const text = `
Password Reset

Hi ${data.userName},

Your password has been reset by an administrator.

New Password: ${data.newPassword}
Please change this password after your first login for security.

${data.resetBy ? `Password reset by: ${data.resetBy}` : ''}

Sign in: ${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || 'https://zumbaton.sg'}/signin

If you didn't request this password reset, please contact us immediately at hello@zumbaton.sg

© ${new Date().getFullYear()} Zumbaton. All rights reserved.
  `.trim()

  return { html, text }
}

/**
 * Escape HTML to prevent XSS
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
