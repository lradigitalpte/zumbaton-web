import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-discovery'

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard',
          '/book-classes',
          '/my-bookings',
          '/my-packages',
          '/profile',
          '/settings',
          '/tokens',
          '/notifications',
          '/onboarding',
          '/signin',
          '/signup',
          '/forgot-password',
          '/reset-password',
          '/set-password',
          '/verify-otp',
          '/magic-link-callback',
          '/sign-in/',
          '/registration-form/',
          '/check-in/',
          '/start/dev',
          '/payment/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
