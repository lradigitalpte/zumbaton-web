import type { PublicClass } from '@/lib/classes-server'
import { formatClassScheduleLine } from '@/lib/classes-server'

interface ScheduleStructuredDataProps {
  classes: PublicClass[]
}

export default function ScheduleStructuredData({ classes }: ScheduleStructuredDataProps) {
  if (classes.length === 0) {
    return null
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onestepfitness.sg'
  const scheduleUrl = `${siteUrl.replace(/\/$/, '')}/schedule`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'One Step Fitness Class Schedule',
    description: classes.slice(0, 10).map(formatClassScheduleLine).join(', '),
    itemListElement: classes.slice(0, 20).map((cls, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: cls.title,
        startDate: cls.scheduled_at,
        duration: `PT${cls.duration_minutes}M`,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: cls.room_name || cls.location || 'One Step Fitness',
        },
        performer: cls.instructor_name
          ? { '@type': 'Person', name: cls.instructor_name }
          : undefined,
        organizer: {
          '@type': 'Organization',
          name: 'One Step Fitness',
          url: siteUrl,
        },
        url: scheduleUrl,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
