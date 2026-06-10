"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildBlogListUrl } from "@/lib/blog-queries";

type BlogPaginationProps = {
  page: number;
  totalPages: number;
  filters: {
    category?: string;
    year?: number;
    month?: number;
  };
};

export default function BlogPagination({ page, totalPages, filters }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pageUrl = (p: number) =>
    buildBlogListUrl({
      ...filters,
      page: p > 1 ? p : undefined,
    });

  const pages: (number | "ellipsis")[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("ellipsis")
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
  }

  const navBtn =
    "inline-flex h-10 items-center gap-1 border border-black/15 px-4 text-xs font-bold uppercase tracking-widest text-gray-600 transition-colors hover:border-lime-500 hover:text-lime-600 dark:border-white/15 dark:text-zinc-400 dark:hover:text-lime-400";
  const navBtnDisabled =
    "inline-flex h-10 cursor-not-allowed items-center gap-1 border border-black/5 px-4 text-xs font-bold uppercase tracking-widest text-gray-300 dark:border-white/5 dark:text-zinc-700";

  return (
    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Blog pagination">
      {page > 1 ? (
        <Link href={pageUrl(page - 1)} className={navBtn}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Link>
      ) : (
        <span className={navBtnDisabled}>
          <ChevronLeft className="h-4 w-4" />
          Prev
        </span>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === "ellipsis" ? (
            <span key={`e-${i}`} className="px-2 text-gray-400 dark:text-zinc-600">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={pageUrl(p)}
              className={`flex h-10 min-w-10 items-center justify-center px-3 text-xs font-bold uppercase tracking-widest transition-colors ${
                p === page
                  ? "bg-lime-500 text-black"
                  : "border border-black/15 text-gray-600 hover:border-lime-500 hover:text-gray-900 dark:border-white/15 dark:text-zinc-400 dark:hover:text-white"
              }`}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </Link>
          )
        )}
      </div>

      {page < totalPages ? (
        <Link href={pageUrl(page + 1)} className={navBtn}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={navBtnDisabled}>
          Next
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
