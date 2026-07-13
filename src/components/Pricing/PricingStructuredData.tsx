import type { Package } from '@/lib/packages-queries'
import { formatPackagePrice } from '@/lib/packages-utils'

interface PricingStructuredDataProps {
  adultPackages: Package[]
  kidsPackages: Package[]
}

export default function PricingStructuredData({
  adultPackages,
  kidsPackages,
}: PricingStructuredDataProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://onestepfitness.sg'
  const pricingUrl = `${siteUrl.replace(/\/$/, '')}/pricing`

  const offers = [...adultPackages, ...kidsPackages].map((pkg) => ({
    '@type': 'Offer',
    name: pkg.name,
    description:
      pkg.description ||
      (pkg.is_unlimited
        ? 'Unlimited class access'
        : `${pkg.token_count} class tokens`),
    price: (pkg.price_cents / 100).toFixed(2),
    priceCurrency: pkg.currency || 'SGD',
    availability: 'https://schema.org/InStock',
    url: pricingUrl,
    itemOffered: {
      '@type': 'Service',
      name: pkg.name,
      description: pkg.is_unlimited
        ? `Unlimited class bookings valid for ${pkg.validity_days} days`
        : `${pkg.token_count} class tokens valid for ${pkg.validity_days} days`,
      provider: {
        '@type': 'Organization',
        name: 'One Step Fitness',
      },
    },
  }))

  if (offers.length === 0) {
    return null
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'One Step Fitness Packages',
    description: [...adultPackages, ...kidsPackages]
      .map(
        (pkg) =>
          `${pkg.name} ${formatPackagePrice(pkg.price_cents, pkg.currency)}`
      )
      .join(', '),
    itemListElement: offers.map((offer, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: offer,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
