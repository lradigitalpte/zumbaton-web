# Production URL Setup

## Important: Set Production Domain in Vercel

To ensure all email links use your production domain (`zumbaton.sg`) instead of localhost or Vercel URLs, you **must** set the following environment variable in Vercel:

### Required Environment Variable

**Variable Name:** `NEXT_PUBLIC_WEB_APP_URL`  
**Value:** `https://zumbaton.sg`

### How to Set in Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add or update:
   - **Key:** `NEXT_PUBLIC_WEB_APP_URL`
   - **Value:** `https://zumbaton.sg`
   - **Environment:** Production, Preview, Development (or just Production if you prefer)
4. Click **Save**
5. **Redeploy** your application for the changes to take effect

### Why This Matters

Without this environment variable set:
- Password reset links may contain `localhost:3000` or `vercel.app` URLs
- Email links in templates will fall back to `zumbaton.sg` (which is good), but the reset link from Supabase might still use the wrong domain
- Users clicking reset links may get errors or be redirected to the wrong domain

### Current Fallback Logic

The code now uses this priority order:
1. `NEXT_PUBLIC_WEB_APP_URL` (should be set to `https://zumbaton.sg`)
2. `NEXT_PUBLIC_APP_URL` (alternative)
3. `https://zumbaton.sg` (hardcoded fallback)
4. Vercel URL (if available)
5. `localhost:3001` (development only)

### Additional Configuration

**Supabase Site URL:**
Also make sure your Supabase project's Site URL is set correctly:
1. Go to Supabase Dashboard → **Settings** → **Auth** → **URL Configuration**
2. Set **Site URL** to: `https://zumbaton.sg`
3. Add **Redirect URLs**: `https://zumbaton.sg/reset-password`

This ensures Supabase generates reset links with the correct domain.

### Testing

After setting the environment variable and redeploying:
1. Request a password reset
2. Check the email - the reset link should use `https://zumbaton.sg
3. Click the link - it should work correctly

