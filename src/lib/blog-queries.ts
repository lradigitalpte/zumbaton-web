import { getSupabaseAdminClient } from '@/lib/supabase'
import { BLOG_CATEGORIES, postMatchesCategory } from '@/lib/blog-categories'

const DEFAULT_IMAGE = '/images/hero/hero.jpeg'
const DEFAULT_AUTHOR_IMAGE = '/logo/One step fitness logo.png'

export const BLOG_PAGE_SIZE = 6

export type BlogPostRow = {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string
  featured_image_url: string | null
  author_name: string
  author_image_url: string | null
  author_designation: string | null
  tags: string[]
  status: string
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  og_image_url: string | null
  is_featured: boolean
  created_at: string
  updated_at: string
}

export type BlogListParams = {
  category?: string
  year?: number
  month?: number
  page?: number
}

export type BlogCategory = {
  slug: string
  label: string
  count: number
}

export type BlogFilterMeta = {
  categories: BlogCategory[]
  years: number[]
  monthsByYear: Record<number, number[]>
  totalPublished: number
}

const BLOG_SELECT =
  'id, slug, title, excerpt, body, featured_image_url, author_name, author_image_url, author_designation, tags, status, published_at, seo_title, seo_description, og_image_url, is_featured, created_at, updated_at'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function tagToSlug(tag: string) {
  return tag.trim().toLowerCase().replace(/\s+/g, '-')
}

export function getMonthName(month: number) {
  return MONTH_NAMES[month - 1] ?? ''
}

export function mapBlogRow(row: BlogPostRow) {
  const publishedAt = row.published_at || row.created_at
  const publishDate = new Intl.DateTimeFormat('en-SG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Singapore',
  }).format(new Date(publishedAt))

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    image: row.featured_image_url || DEFAULT_IMAGE,
    author: {
      name: row.author_name,
      image: row.author_image_url || DEFAULT_AUTHOR_IMAGE,
      designation: row.author_designation || 'Fitness Team',
    },
    tags: row.tags || [],
    publishDate,
    publishedAt: row.published_at,
    isFeatured: row.is_featured,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    ogImage: row.og_image_url || row.featured_image_url,
  }
}

export type MappedBlogPost = ReturnType<typeof mapBlogRow>

function getSgtParts(iso: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(new Date(iso))
  return {
    year: parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10),
    month: parseInt(parts.find((p) => p.type === 'month')?.value || '0', 10),
  }
}

function getMonthRangeSgt(year: number, month: number) {
  const SGT_OFFSET_MS = 8 * 60 * 60 * 1000
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - SGT_OFFSET_MS)
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0) - SGT_OFFSET_MS)
  return { start: start.toISOString(), end: end.toISOString() }
}

function getYearRangeSgt(year: number) {
  const SGT_OFFSET_MS = 8 * 60 * 60 * 1000
  const start = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0) - SGT_OFFSET_MS)
  const end = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0, 0) - SGT_OFFSET_MS)
  return { start: start.toISOString(), end: end.toISOString() }
}

export async function getBlogFilterMeta(): Promise<BlogFilterMeta> {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('tags, published_at, created_at')
      .eq('status', 'published')

    if (error || !data) return { categories: [], years: [], monthsByYear: {}, totalPublished: 0 }

    const monthsByYear: Record<number, Set<number>> = {}
    const yearsSet = new Set<number>()
    const categoryCounts: Record<string, number> = Object.fromEntries(
      BLOG_CATEGORIES.map((c) => [c.slug, 0])
    )

    for (const row of data) {
      const iso = (row.published_at || row.created_at) as string
      const { year, month } = getSgtParts(iso)
      if (year) {
        yearsSet.add(year)
        if (!monthsByYear[year]) monthsByYear[year] = new Set()
        if (month) monthsByYear[year].add(month)
      }

      const tags = (row.tags as string[]) || []
      for (const cat of BLOG_CATEGORIES) {
        if (postMatchesCategory(tags, cat.slug)) {
          categoryCounts[cat.slug] = (categoryCounts[cat.slug] || 0) + 1
        }
      }
    }

    const categories = BLOG_CATEGORIES.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: categoryCounts[cat.slug] || 0,
    })).filter((c) => c.count > 0)

    const years = [...yearsSet].sort((a, b) => b - a)
    const monthsRecord: Record<number, number[]> = {}
    for (const [y, months] of Object.entries(monthsByYear)) {
      monthsRecord[Number(y)] = [...months].sort((a, b) => b - a)
    }

    return {
      categories,
      years,
      monthsByYear: monthsRecord,
      totalPublished: data.length,
    }
  } catch (e) {
    console.error('[blog-queries] filter meta', e)
    return { categories: [], years: [], monthsByYear: {}, totalPublished: 0 }
  }
}

function hasActiveFilters(params: BlogListParams) {
  return Boolean(params.category || params.year || params.month)
}

export async function getPublishedBlogPostsPaginated(params: BlogListParams = {}) {
  const page = Math.max(1, params.page ?? 1)
  const filtersActive = hasActiveFilters(params)

  try {
    const supabase = getSupabaseAdminClient()
    const categorySlug = params.category
      ? BLOG_CATEGORIES.find((c) => c.slug === params.category)?.slug
      : undefined

    let query = supabase
      .from('blog_posts')
      .select(BLOG_SELECT)
      .eq('status', 'published')

    if (params.year && params.month) {
      const { start, end } = getMonthRangeSgt(params.year, params.month)
      query = query.gte('published_at', start).lt('published_at', end)
    } else if (params.year) {
      const { start, end } = getYearRangeSgt(params.year)
      query = query.gte('published_at', start).lt('published_at', end)
    }

    query = query.order('published_at', { ascending: false })

    const { data: allRows, error } = await query

    if (error) {
      console.error('[blog-queries] paginated error', error)
      return {
        posts: [],
        featured: null as MappedBlogPost | null,
        total: 0,
        page,
        pageSize: BLOG_PAGE_SIZE,
        totalPages: 0,
        filtersActive,
      }
    }

    let rows = (allRows || []) as BlogPostRow[]
    if (categorySlug) {
      rows = rows.filter((row) => postMatchesCategory(row.tags || [], categorySlug))
    }

    const mapped = rows.map(mapBlogRow)

    let featured: MappedBlogPost | null = null
    let listPosts = mapped

    if (!filtersActive && page === 1) {
      const featuredRow = mapped.find((p) => p.isFeatured) ?? mapped[0]
      if (featuredRow) {
        featured = featuredRow
        listPosts = mapped.filter((p) => p.id !== featuredRow.id)
      }
    }

    const total = mapped.length
    const gridTotal = filtersActive || page > 1 ? total : Math.max(0, total - (featured ? 1 : 0))
    const totalPages = Math.max(1, Math.ceil(gridTotal / BLOG_PAGE_SIZE))

    const safePage = Math.min(page, totalPages)
    const offset = (safePage - 1) * BLOG_PAGE_SIZE
    const paginatedPosts = listPosts.slice(offset, offset + BLOG_PAGE_SIZE)

    return {
      posts: paginatedPosts,
      featured: !filtersActive && safePage === 1 ? featured : null,
      total: gridTotal,
      page: safePage,
      pageSize: BLOG_PAGE_SIZE,
      totalPages,
      filtersActive,
    }
  } catch (e) {
    console.error('[blog-queries] paginated', e)
    return {
      posts: [],
      featured: null,
      total: 0,
      page: 1,
      pageSize: BLOG_PAGE_SIZE,
      totalPages: 0,
      filtersActive,
    }
  }
}

export async function getPublishedBlogPosts(limit?: number) {
  try {
    const supabase = getSupabaseAdminClient()
    let query = supabase
      .from('blog_posts')
      .select(BLOG_SELECT)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (limit) query = query.limit(limit)

    const { data, error } = await query
    if (error) {
      console.error('[blog-queries] list error', error)
      return []
    }
    return (data as BlogPostRow[]).map(mapBlogRow)
  } catch (e) {
    console.error('[blog-queries] list', e)
    return []
  }
}

export async function getPublishedBlogPostBySlug(slug: string) {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select(BLOG_SELECT)
      .eq('status', 'published')
      .eq('slug', slug)
      .single()

    if (error || !data) return null
    return mapBlogRow(data as BlogPostRow)
  } catch (e) {
    console.error('[blog-queries] by slug', e)
    return null
  }
}

export async function getAllPublishedBlogSlugs() {
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug')
      .eq('status', 'published')

    if (error) return []
    return (data || []).map((row: { slug: string }) => row.slug)
  } catch {
    return []
  }
}

export function buildBlogListUrl(params: BlogListParams) {
  const search = new URLSearchParams()
  if (params.category) search.set('category', params.category)
  if (params.year) search.set('year', String(params.year))
  if (params.month) search.set('month', String(params.month))
  if (params.page && params.page > 1) search.set('page', String(params.page))
  const qs = search.toString()
  return qs ? `/blog?${qs}` : '/blog'
}
