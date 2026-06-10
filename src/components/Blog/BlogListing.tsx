import { BlogPost } from "@/types/blog";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BlogCard, BlogFeaturedCard } from "./BlogCard";
import BlogFilters from "./BlogFilters";
import BlogPagination from "./BlogPagination";
import type { BlogFilterMeta } from "@/lib/blog-queries";
import { getMonthName } from "@/lib/blog-queries";
import { getCategoryLabel } from "@/lib/blog-categories";

type BlogListingProps = {
  posts: BlogPost[];
  featured: BlogPost | null;
  filterMeta: BlogFilterMeta;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  activeFilters: {
    category?: string;
    year?: number;
    month?: number;
  };
  filtersActive: boolean;
  totalPublished: number;
};

function ActiveFilterLabel({
  category,
  year,
  month,
}: {
  category?: string;
  year?: number;
  month?: number;
}) {
  const parts: string[] = [];
  if (category) parts.push(getCategoryLabel(category));
  if (year && month) parts.push(`${getMonthName(month)} ${year}`);
  else if (year) parts.push(String(year));
  if (parts.length === 0) return null;
  return (
    <p className="text-sm text-gray-500 dark:text-zinc-500">
      {parts.join(" · ")}
    </p>
  );
}

export default function BlogListing({
  posts,
  featured,
  filterMeta,
  pagination,
  activeFilters,
  filtersActive,
  totalPublished,
}: BlogListingProps) {
  const isEmpty = !featured && posts.length === 0;

  if (isEmpty && !filtersActive && totalPublished === 0) {
    return (
      <section className="bg-[#f6f4ee] py-24 dark:bg-black">
        <div className="container px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-600 dark:text-lime-500">Coming soon</p>
          <h2 className="mt-4 text-3xl font-black uppercase italic text-gray-900 dark:text-white">New stories on the way</h2>
          <p className="mx-auto mt-4 max-w-md text-gray-600 dark:text-zinc-400">
            We are preparing fitness tips, class updates, and community stories. Check back shortly.
          </p>
          <Link
            href="/schedule"
            className="mt-8 inline-flex items-center gap-2 border-2 border-lime-500 bg-lime-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-white"
          >
            View class schedule
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="relative overflow-hidden bg-[#f6f4ee] py-10 dark:bg-black md:py-14">
        <div className="pointer-events-none absolute -right-20 top-0 h-96 w-96 bg-lime-500/5 blur-3xl" />
        <div className="container relative px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl lg:mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-lime-600 dark:text-lime-500">Movement stories</p>
            <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Tips, wellness & <span className="text-lime-600 dark:text-lime-500">community</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Sidebar filters */}
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <BlogFilters
                  meta={filterMeta}
                  active={{ ...activeFilters, page: pagination.page }}
                  totalCount={totalPublished}
                />
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-9">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4 dark:border-white/10">
                <div>
                  <h3 className="text-lg font-black uppercase italic text-gray-900 dark:text-white">
                    {filtersActive ? "Filtered results" : "Latest articles"}
                  </h3>
                  <ActiveFilterLabel
                    category={activeFilters.category}
                    year={activeFilters.year}
                    month={activeFilters.month}
                  />
                </div>
                {pagination.totalPages > 1 ? (
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Page {pagination.page} / {pagination.totalPages}
                  </p>
                ) : null}
              </div>

              {featured ? (
                <div className="mb-10">
                  <BlogFeaturedCard blog={featured} />
                </div>
              ) : null}

              {posts.length > 0 ? (
                <>
                  {/* Mobile: single-column compact list (easier to scan than tall cards) */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {posts.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} variant="compact" />
                    ))}
                  </div>
                  {/* Tablet+: 2-column magazine grid */}
                  <div className="hidden gap-6 md:grid md:grid-cols-2">
                    {posts.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} variant="grid" />
                    ))}
                  </div>
                  <BlogPagination
                    page={pagination.page}
                    totalPages={pagination.totalPages}
                    filters={activeFilters}
                  />
                </>
              ) : (
                <div className="border border-black/10 bg-white py-16 text-center dark:border-white/10 dark:bg-zinc-950">
                  <p className="text-lg font-bold uppercase italic text-gray-900 dark:text-white">No articles here</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-zinc-500">Try another category or date.</p>
                  <Link
                    href="/blog"
                    className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-lime-600 hover:text-lime-700 dark:text-lime-500 dark:hover:text-lime-300"
                  >
                    View all articles
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-[#f6f4ee] py-16 dark:border-white/10 dark:bg-black">
        <div className="container flex flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-2xl font-black uppercase italic text-gray-900 dark:text-white sm:text-3xl">
            Ready to <span className="text-lime-600 dark:text-lime-500">move</span>?
          </h3>
          <p className="mt-3 max-w-lg text-gray-600 dark:text-zinc-400">
            Reading is great — dancing is better. Book a trial class and feel the One Step difference.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/trial-booking"
              className="inline-flex items-center gap-2 bg-lime-500 px-8 py-3 text-xs font-black uppercase tracking-widest text-black hover:bg-white"
            >
              Try a class
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/schedule"
              className="inline-flex items-center gap-2 border border-black/20 px-8 py-3 text-xs font-black uppercase tracking-widest text-gray-900 hover:border-lime-500 hover:text-lime-600 dark:border-white/20 dark:text-white dark:hover:text-lime-400"
            >
              View schedule
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
