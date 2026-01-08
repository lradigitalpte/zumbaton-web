# Email Triggers - Complete List

## Overview

This document lists all email triggers in the Zumbaton system. All emails use beautiful, responsive HTML templates with consistent branding.

## Email Triggers

### 1. Welcome Email (On Signup)
- **Trigger**: User successfully signs up
- **Location**: `AuthContext.tsx` - after successful signup
- **Template**: `getWelcomeEmailTemplate()`
- **Function**: `sendWelcomeEmail()`
- **Status**: ⏳ To be integrated

### 2. Token Purchase Confirmation
- **Trigger**: Payment webhook receives successful payment
- **Location**: `zumbaton-web/src/app/api/payments/webhook/route.ts`
- **Template**: `getTokenPurchaseEmailTemplate()`
- **Function**: `sendTokenPurchaseEmail()`
- **Status**: ⏳ To be integrated

### 3. Token Expiry Warning (3 days before)
- **Trigger**: Cron job runs daily at 9:00 AM
- **Location**: `zumbaton-admin/src/services/scheduled-jobs.service.ts` - `sendTokenExpiryWarnings()`
- **Template**: `getTokenExpiryWarningEmailTemplate()`
- **Function**: `sendTokenExpiryWarningEmail()`
- **Status**: ⏳ To be integrated (currently sends in-app notification only)

### 4. Class Reminder (3 hours before)
- **Trigger**: Cron job runs every 15 minutes
- **Location**: `zumbaton-admin/src/services/scheduled-jobs.service.ts` - `sendClassReminders()`
- **Template**: `getClassReminderEmailTemplate()`
- **Function**: `sendClassReminderEmail()`
- **Status**: ⏳ To be integrated (currently sends in-app notification only, needs to be updated to 3 hours)

### 5. Booking Confirmation
- **Trigger**: User successfully books a class
- **Location**: `zumbaton-admin/src/services/booking.service.ts` - `createBooking()`
- **Template**: `getBookingConfirmationEmailTemplate()`
- **Function**: `sendBookingConfirmationEmail()`
- **Status**: ⏳ To be integrated (currently sends in-app notification only)

## Email Template Features

All email templates include:
- ✅ Responsive design (mobile-friendly)
- ✅ Consistent branding (Zumbaton green gradient)
- ✅ Professional styling
- ✅ Clear call-to-action buttons
- ✅ Plain text fallback
- ✅ XSS protection (HTML escaping)

## Integration Notes

### For Web App (zumbaton-web)
- Email service: `src/lib/email.ts`
- Email templates: `src/lib/email-templates.ts`
- Uses SMTP configuration from `.env.local`

### For Admin App (zumbaton-admin)
- Can use the same email service by importing from web app
- Or create API endpoint in web app to send emails
- Recommended: Create API endpoint in web app for email sending

## Next Steps

1. ✅ Create email templates
2. ✅ Create email service functions
3. ⏳ Integrate welcome email on signup
4. ⏳ Integrate token purchase confirmation
5. ⏳ Integrate token expiry warning
6. ⏳ Update class reminder to 3 hours and integrate email
7. ⏳ Integrate booking confirmation email

