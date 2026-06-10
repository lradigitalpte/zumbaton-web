"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { X } from "lucide-react";
import type { BlogFilterMeta } from "@/lib/blog-queries";
import { buildBlogListUrl, getMonthName } from "@/lib/blog-queries";

type BlogFiltersProps = {
  meta: BlogFilterMeta;
  active: {
    category?: string;
    year?: number;
    month?: number;
    page?: number;
  };
  totalCount: number;
};

export default function BlogFilters({ meta, active, totalCount }: BlogFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const pushFilters = useCallback(
    (next: { category?: string; year?: number; month?: number; page?: number }) => {
      const url = buildBlogListUrl({
        category: next.category,
        year: next.year,
        month: next.month,
        page: next.page && next.page > 1 ? next.page : undefined,
      });
      startTransition(() => {
        router.push(url, { scroll: false });
      });
    },
    [router]
  );

  const hasFilters = Boolean(active.category || active.year || active.month);
  const availableMonths = active.year ? meta.monthsByYear[active.year] || [] : [];

  const linkClass = (isActive: boolean) =>
    `flex w-full items-center justify-between border-l-2 py-2.5 pl-4 pr-2 text-left text-sm font-semibold uppercase tracking-wide transition-colors ${
      isActive
        ? "border-lime-500 bg-lime-500/10 text-lime-600 dark:text-lime-400"
        : "border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-white"
    }`;

  return (
    <aside
      className={`space-y-8 ${isPending ? "opacity-70" : ""}`}
      aria-label="Blog filters"
    >
      {/* Categories */}
      <div>
        <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">
          Categories
        </h3>
        <nav className="flex flex-col border border-black/10 bg-white dark:border-white/10 dark:bg-black">
          <button
            type="button"
            onClick={() => pushFilters({ year: active.year, month: active.month })}
            className={linkClass(!active.category)}
          >
            <span>All articles</span>
            <span className="text-xs text-gray-400 dark:text-zinc-600">{totalCount}</span>
          </button>
          {meta.categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              onClick={() =>
                pushFilters({
                  category: cat.slug,
                  year: active.year,
                  month: active.month,
                })
              }
              className={linkClass(active.category === cat.slug)}
            >
              <span>{cat.label}</span>
              <span className="text-xs text-gray-400 dark:text-zinc-600">{cat.count}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Archive */}
      {(meta.years.length > 0) && (
        <div>
          <h3 className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-zinc-500">
            Archive
          </h3>
          <div className="space-y-3 border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-black">
            <div>
              <label htmlFor="blog-year" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-600">
                Year
              </label>
              <select
                id="blog-year"
                value={active.year ?? ""}
                onChange={(e) => {
                  const year = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  pushFilters({ category: active.category, year, month: undefined });
                }}
                className="w-full border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-lime-500 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              >
                <option value="">Any year</option>
                {meta.years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="blog-month" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-600">
                Month
              </label>
              <select
                id="blog-month"
                value={active.month ?? ""}
                disabled={!active.year}
                onChange={(e) => {
                  const month = e.target.value ? parseInt(e.target.value, 10) : undefined;
                  pushFilters({ category: active.category, year: active.year, month });
                }}
                className="w-full border border-black/10 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-lime-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
              >
                <option value="">Any month</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {hasFilters ? (
        <button
          type="button"
          onClick={() => pushFilters({})}
          className="inline-flex w-full items-center justify-center gap-1.5 border border-black/15 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-600 hover:border-lime-500/50 hover:text-lime-600 dark:border-white/15 dark:text-zinc-400 dark:hover:text-lime-400"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      ) : null}
    </aside>
  );
}
