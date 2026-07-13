import type { Package } from '@/lib/packages-queries'

export const HOMEPAGE_PREVIEW_PACKAGE_COUNT = 3

/** First N packages for homepage/explore carousel preview (full list on /pricing). */
export function getHomepagePreviewPackages(packages: Package[]): Package[] {
  return packages.slice(0, HOMEPAGE_PREVIEW_PACKAGE_COUNT)
}

/** Highlight the 8-session pack when present, otherwise the middle preview card. */
export function isHomepagePopularPackage(
  pkg: Package,
  previewPackages: Package[]
): boolean {
  const eightPack = previewPackages.find((p) => p.token_count === 8)
  if (eightPack) return pkg.id === eightPack.id

  const middle = previewPackages[Math.floor(previewPackages.length / 2)]
  return middle ? pkg.id === middle.id : false
}

export function formatPackagePrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: currency || 'SGD',
    maximumFractionDigits: 0,
  }).format(priceCents / 100)
}

export function formatPackageValidity(days: number): string {
  if (days === 7) return '1 week'
  if (days === 30) return '1 month'
  if (days === 60) return '2 months'
  if (days === 90) return '3 months'
  return `${days} days`
}

export function getPackageSubtitle(pkg: Package): string {
  return (
    pkg.description ||
    (pkg.is_unlimited ? 'Unlimited class access' : `${pkg.token_count} class tokens`)
  )
}

export function getPackageFeatures(pkg: Package): string[] {
  return [
    pkg.is_unlimited
      ? 'Unlimited class bookings'
      : `${pkg.token_count} class ${pkg.token_count === 1 ? 'token' : 'tokens'}`,
    `Valid for ${formatPackageValidity(pkg.validity_days)}`,
    'All class types included',
    'Easy online booking',
  ]
}

export function buildPricingMetadataDescription(
  adultPackages: Package[],
  kidsPackages: Package[]
): string {
  const parts: string[] = []

  for (const pkg of adultPackages.slice(0, 4)) {
    const price = formatPackagePrice(pkg.price_cents, pkg.currency)
    const tokens = pkg.is_unlimited
      ? 'unlimited classes'
      : `${pkg.token_count} class token${pkg.token_count === 1 ? '' : 's'}`
    parts.push(`${pkg.name}: ${price} (${tokens})`)
  }

  for (const pkg of kidsPackages.slice(0, 2)) {
    const price = formatPackagePrice(pkg.price_cents, pkg.currency)
    parts.push(`Kids ${pkg.name}: ${price}`)
  }

  if (parts.length === 0) {
    return 'Choose the right One Step Fitness package for your goals. Flexible plans for adults and kids with 1-month validity options.'
  }

  return `One Step Fitness packages — ${parts.join('. ')}.`
}
