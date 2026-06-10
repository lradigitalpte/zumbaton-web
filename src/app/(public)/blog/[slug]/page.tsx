import BlogPostContent from "@/components/Blog/BlogPostContent";
import RelatedPost from "@/components/Blog/RelatedPost";
import SharePost from "@/components/Blog/SharePost";
import TagButton from "@/components/Blog/TagButton";
import PageHero from "@/components/Common/PageHero";
import { getPublishedBlogPostBySlug, getPublishedBlogPosts } from "@/lib/blog-queries";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const siteUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.NEXT_PUBLIC_APP_URL || "https://onestepfitness.sg";

function estimateReadMinutes(excerpt: string, body: string) {
  const text = `${excerpt} ${body}`.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.min(15, Math.ceil(words / 200)));
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return { title: "Post not found | One Step Fitness" };

  const title = post.seoTitle || `${post.title} | One Step Fitness`;
  const description = post.seoDescription || post.excerpt;
  const ogImage = post.ogImage || post.image;

  return {
    title,
    description,
    openGraph: {
      title: post.seoTitle || post.title,
      description,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      images: ogImage ? [{ url: ogImage, alt: post.title }] : undefined,
      url: `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seoTitle || post.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export const dynamic = "force-dynamic";

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  const allPosts = await getPublishedBlogPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  const postUrl = `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;
  const readMin = estimateReadMinutes(post.excerpt, post.body);
  const primaryTag = post.tags[0] || "Fitness";

  return (
    <>
      <PageHero
        title={post.title}
        titleMode="article"
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "Blog", href: "/blog" },
          { label: "Article" },
        ]}
        backgroundImage={post.image}
      />

      <section className="bg-[#f6f4ee] py-10 dark:bg-black md:py-14">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-lime-600 dark:text-zinc-500 dark:hover:text-lime-400"
            >
              <ArrowLeft className="h-4 w-4" />
              All articles
            </Link>

            <div className="flex flex-wrap items-center gap-3 border-b border-black/10 pb-8 dark:border-white/10">
              <span className="border border-lime-500 bg-lime-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
                {primaryTag}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">
                <Calendar className="h-3.5 w-3.5 text-lime-600 dark:text-lime-500" />
                {post.publishDate}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">
                <Clock className="h-3.5 w-3.5 text-lime-600 dark:text-lime-500" />
                {readMin} min read
              </span>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
              <article className="lg:col-span-8">
                <div className="border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950 sm:p-10 md:p-12">
                  {post.tags.length > 1 ? (
                    <div className="mb-8 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <TagButton key={tag} text={tag} />
                      ))}
                    </div>
                  ) : null}

                  <div className="blog-content">
                    <BlogPostContent body={post.body} />
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-6 border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500">Share this article</p>
                    <p className="mt-1 text-sm text-gray-600 dark:text-zinc-400">Spread the movement with friends & family</p>
                  </div>
                  <SharePost url={postUrl} title={post.title} />
                </div>

                <div className="mt-10 border-t border-black/10 pt-8 dark:border-white/10">
                  <Link
                    href="/trial-booking"
                    className="inline-flex items-center gap-2 bg-lime-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-white"
                  >
                    Try a class at One Step Fitness
                  </Link>
                </div>
              </article>

              <aside className="lg:col-span-4">
                <div className="sticky top-28 space-y-6">
                  <div className="border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-lime-600 dark:text-lime-500">Written by</p>
                    <p className="mt-2 text-lg font-black uppercase italic text-gray-900 dark:text-white">{post.author.name}</p>
                    <p className="text-sm text-gray-500 dark:text-zinc-500">{post.author.designation}</p>
                  </div>

                  {related.length > 0 ? (
                    <div className="border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950">
                      <h3 className="text-sm font-black uppercase italic tracking-tight text-gray-900 dark:text-white">More to read</h3>
                      <div className="mt-5 space-y-3">
                        {related.map((item) => (
                          <RelatedPost
                            key={item.id}
                            image={item.image}
                            slug={`/blog/${item.slug}`}
                            title={item.title}
                            date={item.publishDate}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
