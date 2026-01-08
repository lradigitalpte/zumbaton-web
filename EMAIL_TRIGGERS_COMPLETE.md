# Complete Email Triggers List

## ✅ All Email Triggers Implemented

### User-Facing Emails

1. **Welcome Email** ✅
   - **Trigger**: User signs up
   - **Location**: `zumbaton-web/src/context/AuthContext.tsx`
   - **Template**: `getWelcomeEmailTemplate`

2. **Token Purchase Confirmation** ✅
   - **Trigger**: Payment successful
   - **Location**: `zumbaton-web/src/app/api/payments/webhook/route.ts`
   - **Template**: `getTokenPurchaseEmailTemplate`

3. **Token Expiry Warning** ✅
   - **Trigger**: 3 days before expiry (cron job)
   - **Location**: `zumbaton-admin/src/services/scheduled-jobs.service.ts`
   - **Template**: `getTokenExpiryWarningEmailTemplate`

4. **Class Reminder** ✅
   - **Trigger**: 3 hours before class (cron job)
   - **Location**: `zumbaton-admin/src/services/scheduled-jobs.service.ts`
   - **Template**: `getClassReminderEmailTemplate`

5. **Booking Confirmation** ✅
   - **Trigger**: User books a class
   - **Location**: `zumbaton-admin/src/services/booking.service.ts`
   - **Template**: `getBookingConfirmationEmailTemplate`

6. **Booking Cancellation** ✅ **NEW**
   - **Trigger**: User cancels booking
   - **Location**: `zumbaton-admin/src/services/booking.service.ts`
   - **Template**: `getBookingCancellationEmailTemplate`
   - **Includes**: Tokens refunded, penalty info, reason

7. **Waitlist Promotion** ✅ **NEW**
   - **Trigger**: Spot opens from waitlist
   - **Location**: `zumbaton-admin/src/services/waitlist.service.ts`
   - **Template**: `getWaitlistPromotionEmailTemplate`
   - **Includes**: Confirm URL, expiration time

8. **Class Cancellation** ✅ **NEW**
   - **Trigger**: Admin cancels a class
   - **Location**: `zumbaton-admin/src/services/class.service.ts`
   - **Template**: `getClassCancellationEmailTemplate`
   - **Includes**: Tokens refunded automatically

9. **No-Show Warning** ✅ **NEW**
   - **Trigger**: User marked as no-show
   - **Location**: `zumbaton-admin/src/services/attendance.service.ts`
   - **Template**: `getNoShowWarningEmailTemplate`
   - **Includes**: Tokens consumed, no-show count, flagged status

### Admin-Action Emails

10. **Token Adjustment** ✅
    - **Trigger**: Admin adjusts user tokens
    - **Location**: `zumbaton-admin/src/services/token.service.ts`
    - **Template**: `getTokenAdjustmentEmailTemplate`
    - **Includes**: Tokens added/removed, new balance, reason, admin name

11. **Admin Created User** ✅
    - **Trigger**: Admin creates user account
    - **Location**: `zumbaton-admin/src/services/user.service.ts`
    - **Template**: `getAdminCreatedUserEmailTemplate`
    - **Includes**: Temporary password (if provided), admin name

12. **Password Reset by Admin** ✅ **NEW**
    - **Trigger**: Admin resets user password
    - **Location**: `zumbaton-admin/src/app/api/users/[userId]/reset-password/route.ts`
    - **Template**: `getPasswordResetEmailTemplate`
    - **Includes**: New password, admin name who reset it

## Email API Endpoint

All emails are sent via: `POST /api/email/send`

**Authentication**: Uses `EMAIL_API_SECRET`

**Available Types**:
- `welcome`
- `token-purchase`
- `token-expiry`
- `class-reminder`
- `booking-confirmation`
- `booking-cancellation` ✅ NEW
- `waitlist-promotion` ✅ NEW
- `class-cancellation` ✅ NEW
- `no-show-warning` ✅ NEW
- `token-adjustment`
- `admin-created-user`
- `password-reset` ✅ NEW

## Summary

**Total Email Types**: 12
- **User-facing**: 9
- **Admin-action**: 3

All emails use consistent, responsive HTML templates with:
- Modern design
- Mobile-friendly
- Clear call-to-action buttons
- Brand colors (green gradient)
- Professional styling

All emails are sent via the web app's SMTP configuration (Gmail/Google Workspace).

