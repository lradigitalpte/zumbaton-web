import { getAllPublishedBlogSlugs } from "@/lib/blog-queries";
import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://onestepfitness.sg";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl.replace(/\/$/, "");
  const staticPages = [
    "",
    "/explore",
    "/about",
    "/classes",
    "/pricing",
    "/schedule",
    "/instructors",
    "/faq",
    "/contact",
    "/blog",
  ];

  const blogSlugs = await getAllPublishedBlogSlugs();

  return [
    ...staticPages.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" || path === "/explore" ? 1 : 0.8,
    })),
    ...blogSlugs.map((slug) => ({
      url: `${base}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
