/**
 * Helper function to get the admin API URL for cross-app API calls
 * Priority order:
 * 1. NEXT_PUBLIC_ADMIN_API_URL (main variable - should be set to https://admin.zumbaton.sg)
 * 2. NEXT_PUBLIC_API_URL (fallback)
 * 3. https://admin.zumbaton.sg (production default)
 * 4. http://localhost:3001 (development only)
 * 
 * CRITICAL: Must set NEXT_PUBLIC_ADMIN_API_URL in Vercel environment variables!
 * Without it, production will try to connect to localhost:3001 which won't work.
 * 
 * Value should be: https://admin.zumbaton.sg
 */
export function getAdminApiUrl(): string {
  let adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL || process.env.NEXT_PUBLIC_API_URL

  if (!adminApiUrl) {
    // Default to production URL if not set
    adminApiUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://admin.zumbaton.sg'
  } else {
    // Validate and fix common mistakes
    if (process.env.NODE_ENV !== 'development') {
      // In production, ensure we're using the admin app URL
      if (adminApiUrl.includes('localhost') || adminApiUrl.includes('3000') || adminApiUrl.includes('3001')) {
        // If somehow localhost/dev port is set in production, override it
        console.error('[AdminApiUrl] CRITICAL: Localhost/dev URL detected in production! Got:', adminApiUrl)
        console.error('[AdminApiUrl] Please set NEXT_PUBLIC_ADMIN_API_URL=https://admin.zumbaton.sg in Vercel environment')
        adminApiUrl = 'https://admin.zumbaton.sg'
      }
    }
  }

  return adminApiUrl
}
