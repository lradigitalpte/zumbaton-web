# Email Service Setup Guide

## Overview

The email service is a reusable utility for sending emails via SMTP. It's currently used for:
- Contact form submissions
- (Future: Token purchase confirmations, expiry warnings, etc.)

## Configuration

### Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# SMTP Configuration (Required)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@zumbaton.sg
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM_EMAIL=hello@zumbaton.sg
SMTP_FROM_NAME=Zumbaton

# Contact Form Recipient (Optional - defaults to hello@zumbaton.sg)
CONTACT_EMAIL=hello@zumbaton.sg
```

### Gmail Setup

1. **Enable 2-Step Verification** on your Google Account
2. **Generate App-Specific Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password for "Mail"
   - Copy the 16-character password (without spaces)
3. **Use the app password** as `SMTP_PASSWORD` in your `.env.local`

### SMTP Settings for Gmail

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false  # false for port 587 (TLS), true for port 465 (SSL)
```

## Usage

### In API Routes

```typescript
import { sendEmail } from '@/lib/email'

// Send a simple email
const result = await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to Zumbaton!</h1>',
  text: 'Welcome to Zumbaton!', // Optional
})
```

### Contact Form

The contact form automatically uses the email service. Just submit the form and it will:
1. Validate the form data
2. Send an email to `CONTACT_EMAIL` (or `hello@zumbaton.sg` by default)
3. Include a reply-to address set to the sender's email

## Testing

### Test Contact Form

1. Navigate to `/contact` on your website
2. Fill out the contact form
3. Submit the form
4. Check the recipient email inbox (and spam folder)

### Test Email Service Directly

You can test the email service by creating a test API route:

```typescript
// app/api/test-email/route.ts
import { sendEmail } from '@/lib/email'
import { NextResponse } from 'next/server'

export async function GET() {
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<p>This is a test email</p>',
  })
  
  return NextResponse.json(result)
}
```

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**: Make sure all SMTP variables are set correctly
2. **Verify app-specific password**: For Gmail, use an app-specific password, not your regular password
3. **Check SMTP port**: Port 587 uses TLS, port 465 uses SSL
4. **Check server logs**: Look for error messages in your Next.js console

### Common Errors

- **"Invalid login"**: Wrong password or username
- **"Connection timeout"**: Wrong SMTP host or port
- **"Authentication failed"**: Need to use app-specific password for Gmail

## Security Notes

- **Never commit `.env.local`** to version control
- **Use app-specific passwords** for Gmail (not your main password)
- **Rotate passwords regularly** for production
- **Use environment-specific configurations** (dev, staging, production)

## Future Enhancements

The email service can be extended to support:
- Email templates
- Queue system for bulk emails
- Email tracking (opens, clicks)
- Multiple SMTP providers
- Email validation

