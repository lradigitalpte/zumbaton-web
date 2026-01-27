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
  // Priority: NEXT_PUBLIC_ADMIN_API_URL first (explicit admin URL)
  let adminApiUrl = process.env.NEXT_PUBLIC_ADMIN_API_URL

  // If not set, check NEXT_PUBLIC_API_URL but validate it's not the web app URL
  if (!adminApiUrl && process.env.NEXT_PUBLIC_API_URL) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    // Don't use NEXT_PUBLIC_API_URL if it points to the web app (port 3000)
    if (!apiUrl.includes('3000') && !apiUrl.includes('zumbaton.sg') || apiUrl.includes('admin')) {
      adminApiUrl = apiUrl
    }
  }

  if (!adminApiUrl) {
    // Default to admin app URL based on environment
    adminApiUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3001'
      : 'https://admin.zumbaton.sg'
  } else {
    // Validate and fix common mistakes
    if (process.env.NODE_ENV === 'development') {
      // In development, ensure we're using port 3001 (admin), not 3000 (web)
      if (adminApiUrl.includes('3000')) {
        console.warn('[AdminApiUrl] Warning: URL points to web app (3000), switching to admin app (3001)')
        adminApiUrl = adminApiUrl.replace(':3000', ':3001').replace('localhost:3000', 'localhost:3001')
      }
    } else {
      // In production, ensure we're using the admin app URL
      if (adminApiUrl.includes('localhost') || adminApiUrl.includes('3000') || adminApiUrl.includes('3001')) {
        // If somehow localhost/dev port is set in production, override it
        console.error('[AdminApiUrl] CRITICAL: Localhost/dev URL detected in production! Got:', adminApiUrl)
        console.error('[AdminApiUrl] Please set NEXT_PUBLIC_ADMIN_API_URL=https://admin.zumbaton.sg in Vercel environment')
        adminApiUrl = 'https://admin.zumbaton.sg'
      }
    }
  }

  // Normalize URL: remove trailing slashes and any /api suffix
  adminApiUrl = adminApiUrl.trim()
  adminApiUrl = adminApiUrl.replace(/\/+$/, '') // Remove trailing slashes
  adminApiUrl = adminApiUrl.replace(/\/api$/, '') // Remove /api suffix if present
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[AdminApiUrl] Resolved admin API URL:', adminApiUrl)
  }
  
  return adminApiUrl
}
