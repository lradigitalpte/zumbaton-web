import { zumbaClasses } from '@/data/classes'

export interface PublicPageEntry {
  path: string
  title: string
  description: string
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  /** Curated index for /llms.txt (keep concise — not every URL). */
  includeInLlms?: boolean
}

const defaultWebUrl = 'https://onestepfitness.sg'

export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_WEB_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    defaultWebUrl

  return (configured.includes('admin.') ? defaultWebUrl : configured).replace(
    /\/$/,
    ''
  )
}

/** Marketing and content pages crawlers should index. */
export const PUBLIC_PAGES: PublicPageEntry[] = [
  {
    path: '',
    title: 'Home',
    description:
      'Dance fitness studio in Singapore — Zumba Step, Groove Stepper, kids classes, and trial bookings.',
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/pricing',
    title: 'Pricing & packages',
    description:
      'Session packs, token packages, and kids plans with prices and validity.',
    changeFrequency: 'weekly',
    priority: 0.95,
  },
  {
    path: '/schedule',
    title: 'Class schedule',
    description: 'Weekly and monthly class timetable with instructors and times.',
    changeFrequency: 'daily',
    priority: 0.95,
  },
  {
    path: '/classes',
    title: 'Classes overview',
    description: 'All dance fitness formats offered at One Step Fitness.',
    changeFrequency: 'monthly',
    priority: 0.9,
  },
  {
    path: '/trial-booking',
    title: 'Book a trial class',
    description: 'Reserve a trial session online with live class availability.',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    path: '/instructors',
    title: 'Instructors',
    description: 'Meet the One Step Fitness teaching team.',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/about',
    title: 'About us',
    description: 'Our story, mission, and studio experience.',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/faq',
    title: 'FAQ',
    description: 'Common questions about classes, pricing, and bookings.',
    changeFrequency: 'monthly',
    priority: 0.75,
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Studio location, hours, and how to reach us.',
    changeFrequency: 'monthly',
    priority: 0.75,
  },
  {
    path: '/blog',
    title: 'Blog',
    description: 'Fitness tips, studio news, and community updates.',
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    path: '/explore',
    title: 'Explore',
    description: 'Extended homepage with community highlights and pricing preview.',
    changeFrequency: 'weekly',
    priority: 0.7,
    includeInLlms: false,
  },
  {
    path: '/terms',
    title: 'Terms of service',
    description: 'Terms and conditions for using One Step Fitness services.',
    changeFrequency: 'yearly',
    priority: 0.3,
    includeInLlms: false,
  },
  {
    path: '/privacy',
    title: 'Privacy policy',
    description: 'How we collect and use personal data.',
    changeFrequency: 'yearly',
    priority: 0.3,
    includeInLlms: false,
  },
  {
    path: '/refund',
    title: 'Refund policy',
    description: 'Refund and cancellation policy for packages and bookings.',
    changeFrequency: 'yearly',
    priority: 0.3,
    includeInLlms: false,
  },
]

export function getClassPageEntries(): PublicPageEntry[] {
  return zumbaClasses.map((cls) => ({
    path: `/classes/${cls.slug}`,
    title: cls.name,
    description: cls.shortDescription,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
    includeInLlms: true,
  }))
}

export function getLlmsIndexPages(): PublicPageEntry[] {
  return [...PUBLIC_PAGES, ...getClassPageEntries()].filter(
    (page) => page.includeInLlms !== false
  )
}

export function buildLlmsTxt(): string {
  const base = getSiteUrl()
  const pages = getLlmsIndexPages()

  const lines = [
    '# One Step Fitness',
    '',
    '> Dance fitness studio in Singapore. Public pages below include live pricing, class schedule, and trial booking.',
    '',
    '## Key pages',
    '',
    ...pages.map(
      (page) =>
        `- [${page.title}](${base}${page.path}): ${page.description}`
    ),
    '',
    '## Machine-readable indexes',
    '',
    `- [Sitemap](${base}/sitemap.xml): complete list of indexable URLs`,
    `- [Pricing page](${base}/pricing): full package list with server-rendered prices`,
    `- [Schedule page](${base}/schedule): server-rendered weekly class timetable`,
    '',
    '## Notes for crawlers',
    '',
    '- Pricing, schedule, and trial availability are rendered on the server (not client-only).',
    '- Authenticated member areas (/dashboard, /signin, etc.) are not listed here.',
    '',
  ]

  return lines.join('\n')
}
