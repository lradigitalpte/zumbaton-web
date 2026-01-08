# Environment Variables Explanation

## Two Different Email Systems

### 1. Supabase SMTP (Configured in Supabase Dashboard)
**Purpose:** Handles authentication-related emails automatically sent by Supabase
- Password reset emails
- Magic link emails
- Email confirmation emails
- Account verification emails

**Where it's configured:** Supabase Dashboard → Settings → Auth → SMTP Settings

**Why:** Supabase uses this SMTP to send its own auth emails. You don't need to add these credentials to your app's `.env.local` because Supabase handles it internally.

---

### 2. App SMTP (In `.env.local` and Vercel)
**Purpose:** Handles custom emails sent by your Next.js application
- Contact form submissions
- Token purchase confirmations
- Token expiry warnings
- Package expiration alerts
- Booking confirmations
- Any other custom notifications

**Where it's configured:** Your app's `.env.local` file (and Vercel environment variables for production)

**Why:** Your Next.js app needs its own SMTP credentials to send custom emails using Nodemailer. This is separate from Supabase's email system.

---

## Environment Variables Needed

### For Local Development (`.env.local`)

```env
# Supabase Configuration (for database and auth)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# App SMTP Configuration (for custom emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hello@zumbaton.sg
SMTP_PASSWORD=[YOUR_GMAIL_APP_SPECIFIC_PASSWORD]
SMTP_FROM_EMAIL=hello@zumbaton.sg
SMTP_FROM_NAME=Zumbaton
CONTACT_EMAIL=hello@zumbaton.sg
```

### For Production (Vercel Environment Variables)

**Yes, you need to add these to Vercel too!**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add all the SMTP variables:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM_EMAIL`
   - `SMTP_FROM_NAME`
   - `CONTACT_EMAIL`

4. Make sure to select the correct **Environment** (Production, Preview, Development)
5. Click **Save**

---

## Summary

| System | Purpose | Where Configured | Used By |
|--------|---------|------------------|---------|
| **Supabase SMTP** | Auth emails (password reset, etc.) | Supabase Dashboard | Supabase Auth |
| **App SMTP** | Custom emails (contact form, etc.) | `.env.local` + Vercel | Your Next.js App |

**Both use the same Gmail account** (`hello@zumbaton.sg`), but they're configured in different places because they serve different purposes.

---

## Security Notes

- ✅ **Never commit `.env.local`** to git (it's in `.gitignore`)
- ✅ **Use app-specific password** for Gmail (not your regular password)
- ✅ **Add to Vercel** for production deployments
- ✅ **Rotate passwords** regularly in production

