/**
 * Curated blog categories — sidebar shows only these, not every post tag.
 */

export type CuratedBlogCategory = {
  slug: string
  label: string
  /** Post tags (lowercase) that belong to this category */
  matchTags: string[]
}

export const BLOG_CATEGORIES: CuratedBlogCategory[] = [
  {
    slug: 'dance-fitness',
    label: 'Dance & Zumba',
    matchTags: [
      'zumba',
      'zumba singapore',
      'dance fitness',
      'group classes',
      'cardio',
      'singapore',
    ],
  },
  {
    slug: 'family',
    label: 'Family & Kids',
    matchTags: [
      'family fitness',
      'kids dance',
      'lil steppers',
      'zumfamilia',
      'parenting',
    ],
  },
  {
    slug: 'wellness',
    label: 'Wellness & Health',
    matchTags: [
      'wellness',
      'better health',
      'stress relief',
      'weight management',
    ],
  },
]

export function postMatchesCategory(postTags: string[], categorySlug: string): boolean {
  const category = BLOG_CATEGORIES.find((c) => c.slug === categorySlug)
  if (!category) return false
  const normalized = postTags.map((t) => t.trim().toLowerCase())
  return category.matchTags.some((needle) => normalized.includes(needle))
}

export function getCategoryLabel(slug: string): string {
  return BLOG_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug
}
