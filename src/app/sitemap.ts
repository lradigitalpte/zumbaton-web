import { getAllPublishedBlogSlugs } from '@/lib/blog-queries'
import {
  getClassPageEntries,
  getSiteUrl,
  PUBLIC_PAGES,
} from '@/lib/site-discovery'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()

  const staticEntries: MetadataRoute.Sitemap = PUBLIC_PAGES.map((page) => ({
    url: `${base}${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency ?? 'weekly',
    priority: page.priority ?? 0.8,
  }))

  const classEntries: MetadataRoute.Sitemap = getClassPageEntries().map(
    (page) => ({
      url: `${base}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency ?? 'monthly',
      priority: page.priority ?? 0.85,
    })
  )

  const blogSlugs = await getAllPublishedBlogSlugs()
  const blogEntries: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticEntries, ...classEntries, ...blogEntries]
}
