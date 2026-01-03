# Google Search Console Verification Setup

This guide will help you verify your Zumbaton website with Google Search Console.

## Step 1: Get Your Verification Code from Google

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click **"Add Property"** or select your property
3. Choose **"URL prefix"** method and enter your website URL (e.g., `https://yourdomain.com`)
4. Select **"HTML tag"** as the verification method
5. Copy the `content` value from the meta tag that Google provides

   Example meta tag from Google:
   ```html
   <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE_HERE" />
   ```
   
   You only need the `content` value (the part after `content="` and before `"`)

## Step 2: Add Verification Code to Your Project

1. Open `zumbaton-web/.env.local` file (create it if it doesn't exist)
2. Add the following line with your verification code:

```env
NEXT_PUBLIC_GOOGLE_VERIFICATION=YOUR_VERIFICATION_CODE_HERE
```

**Example:**
```env
NEXT_PUBLIC_GOOGLE_VERIFICATION=abc123xyz789verificationcode
```

## Step 3: Deploy and Verify

1. **For Local Development:**
   - Restart your development server: `npm run dev`
   - The meta tag will be automatically added to your site's `<head>`

2. **For Production:**
   - Commit and push your changes
   - Deploy to your hosting platform (Vercel, etc.)
   - Wait for deployment to complete

3. **Verify in Google Search Console:**
   - Go back to Google Search Console
   - Click the **"Verify"** button
   - Google will check for the meta tag on your homepage
   - If successful, you'll see a success message!

## Alternative: HTML File Method

If you prefer the HTML file method instead:

1. Download the HTML verification file from Google Search Console
2. Place it in the `zumbaton-web/public/` directory
3. The file will be accessible at `https://yourdomain.com/google1234567890.html`
4. Click "Verify" in Google Search Console

## Troubleshooting

- **Verification fails?** 
  - Make sure the meta tag is in the `<head>` section of your homepage
  - Clear your browser cache and try again
  - Check that your `.env.local` file has the correct variable name
  - Ensure the verification code doesn't have extra quotes or spaces

- **Can't see the meta tag?**
  - View page source (Ctrl+U or Cmd+Option+U)
  - Search for "google-site-verification"
  - Make sure `NEXT_PUBLIC_GOOGLE_VERIFICATION` is set correctly

## Current Implementation

The verification meta tag is automatically added in:
- File: `zumbaton-web/src/app/layout.tsx`
- It reads from: `process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION`

The meta tag will appear in the `<head>` section of all pages on your site.

