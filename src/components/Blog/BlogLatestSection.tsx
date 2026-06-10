import SectionTitle from "../Common/SectionTitle";
import { BlogCard } from "./BlogCard";
import { getPublishedBlogPosts } from "@/lib/blog-queries";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function BlogLatestSection() {
  const posts = await getPublishedBlogPosts(3);
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="bg-[#f6f4ee] py-16 dark:bg-black md:py-24">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 border-b border-black/10 pb-8 sm:flex-row sm:items-end dark:border-white/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-600 dark:text-lime-500">From the blog</p>
            <h2 className="mt-2 text-3xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Latest <span className="text-lime-600 dark:text-lime-500">stories</span>
            </h2>
            <p className="mt-3 max-w-xl text-gray-600 dark:text-zinc-400">
              Fitness tips, family dance, and wellness advice from the One Step community.
            </p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-lime-600 hover:text-gray-900 dark:text-lime-500 dark:hover:text-white"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          {posts.map((blog) => (
            <BlogCard key={blog.id} blog={blog} variant="compact" />
          ))}
        </div>
        <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
          {posts.map((blog) => (
            <BlogCard key={blog.id} blog={blog} variant="grid" />
          ))}
        </div>
      </div>
    </section>
  );
}
