import BlogListing from "@/components/Blog/BlogListing";
import PageHero from "@/components/Common/PageHero";
import {
  getBlogFilterMeta,
  getPublishedBlogPostsPaginated,
} from "@/lib/blog-queries";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Blog | One Step Fitness",
  description:
    "Read the latest fitness tips, class updates, and health articles from One Step Fitness Singapore.",
  openGraph: {
    title: "Blog | One Step Fitness",
    description:
      "Read the latest fitness tips, class updates, and health articles from One Step Fitness Singapore.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    category?: string;
    year?: string;
    month?: string;
    page?: string;
  }>;
};

function parseSearchParams(raw: {
  category?: string;
  year?: string;
  month?: string;
  page?: string;
}) {
  const year = raw.year ? parseInt(raw.year, 10) : undefined;
  const month = raw.month ? parseInt(raw.month, 10) : undefined;
  const page = raw.page ? parseInt(raw.page, 10) : 1;

  return {
    category: raw.category?.trim() || undefined,
    year: year && Number.isFinite(year) ? year : undefined,
    month: month && month >= 1 && month <= 12 ? month : undefined,
    page: page && Number.isFinite(page) ? page : 1,
  };
}

export default async function BlogPage({ searchParams }: PageProps) {
  const raw = await searchParams;
  const filters = parseSearchParams(raw);

  const [filterMeta, listing] = await Promise.all([
    getBlogFilterMeta(),
    getPublishedBlogPostsPaginated(filters),
  ]);

  return (
    <>
      <PageHero
        title="The Blog"
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "Blog" },
        ]}
      />
      <Suspense fallback={<div className="min-h-[40vh] bg-[#f6f4ee] dark:bg-black" />}>
        <BlogListing
          posts={listing.posts}
          featured={listing.featured}
          filterMeta={filterMeta}
          pagination={{
            page: listing.page,
            totalPages: listing.totalPages,
            total: listing.total,
          }}
          activeFilters={{
            category: filters.category,
            year: filters.year,
            month: filters.month,
          }}
          filtersActive={listing.filtersActive}
          totalPublished={filterMeta.totalPublished}
        />
      </Suspense>
    </>
  );
}
