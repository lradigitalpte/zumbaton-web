# Email Integration Status

## ✅ Completed

1. **Email Templates** - Beautiful, responsive HTML templates created
   - Welcome email
   - Token purchase confirmation
   - Token expiry warning
   - Class reminder (3 hours before)
   - Booking confirmation

2. **Email Service Functions** - All email functions created in `src/lib/email.ts`
   - `sendWelcomeEmail()`
   - `sendTokenPurchaseEmail()`
   - `sendTokenExpiryWarningEmail()`
   - `sendClassReminderEmail()`
   - `sendBookingConfirmationEmail()`

3. **Email API Endpoint** - Created `/api/email/send` for admin app to use

4. **Token Purchase Email** - ✅ Integrated in payment webhook

## ✅ All Integrations Complete!

### 1. Welcome Email on Signup ✅
**Location**: `zumbaton-web/src/context/AuthContext.tsx`
**Function**: `signUp()`
**Status**: ✅ Integrated - Sends welcome email after successful signup

### 2. Token Expiry Warning Email ✅
**Location**: `zumbaton-admin/src/services/scheduled-jobs.service.ts`
**Function**: `sendTokenExpiryWarnings()`
**Status**: ✅ Integrated - Sends email via web app API when tokens expire in 3 days

### 3. Class Reminder Email (3 hours before) ✅
**Location**: `zumbaton-admin/src/services/scheduled-jobs.service.ts`
**Function**: `sendClassReminders()`
**Status**: ✅ Integrated - Updated to 3 hours before, sends email via web app API

### 4. Booking Confirmation Email ✅
**Location**: `zumbaton-admin/src/services/booking.service.ts`
**Function**: `createBooking()`
**Status**: ✅ Integrated - Sends email via web app API when booking is confirmed

## Integration Pattern

For admin app integrations, use the email API endpoint:

```typescript
// In admin app
const emailApiUrl = process.env.NEXT_PUBLIC_WEB_APP_URL + '/api/email/send'
const emailApiSecret = process.env.EMAIL_API_SECRET

await fetch(emailApiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'welcome', // or 'token-purchase', 'token-expiry', 'class-reminder', 'booking-confirmation'
    secret: emailApiSecret,
    data: {
      userEmail: 'user@example.com',
      userName: 'John Doe',
      // ... other data
    },
  }),
})
```

For web app integrations, import directly:

```typescript
import { sendWelcomeEmail } from '@/lib/email'

await sendWelcomeEmail(userEmail, userName)
```

## Environment Variables Needed

Add to both `.env.local` files:

```env
# Email API Secret (for admin app to call web app email API)
EMAIL_API_SECRET=your-secret-key-here

# Web App URL (for admin app to call email API)
NEXT_PUBLIC_WEB_APP_URL=https://zumbaton-web.vercel.app
```

