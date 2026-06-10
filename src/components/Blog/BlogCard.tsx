import { BlogPost } from "@/types/blog";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";

function estimateReadMinutes(excerpt: string, body?: string) {
  const text = `${excerpt} ${body || ""}`.replace(/<[^>]+>/g, " ");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.min(12, Math.ceil(words / 200)));
}

export function BlogCard({
  blog,
  variant = "grid",
}: {
  blog: BlogPost;
  variant?: "grid" | "compact";
}) {
  const { slug, title, image, excerpt, tags, publishDate } = blog;
  const primaryTag = tags[0] || "Fitness";
  const readMin = estimateReadMinutes(excerpt);

  if (variant === "compact") {
    return (
      <Link
        href={`/blog/${slug}`}
        className="group flex gap-3 border border-black/10 bg-white p-3 transition-all hover:border-lime-500/60 hover:bg-lime-500/5 dark:border-white/10 dark:bg-zinc-950 dark:hover:bg-zinc-900 sm:gap-4 sm:p-4"
      >
        <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden sm:h-24 sm:w-28">
          <Image src={image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="112px" />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-lime-600 dark:text-lime-500">{primaryTag}</p>
          <h4 className="mt-1 line-clamp-2 text-sm font-black uppercase italic leading-snug text-gray-900 group-hover:text-lime-600 dark:text-white dark:group-hover:text-lime-400">
            {title}
          </h4>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-gray-600 dark:text-zinc-400">{excerpt}</p>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{publishDate}</span>
            <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
            <span>{readMin} min</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden border-2 border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-lime-500 hover:shadow-[0_20px_50px_-12px_rgba(132,204,22,0.25)] dark:border-zinc-800 dark:bg-black">
      <Link href={`/blog/${slug}`} className="absolute inset-0 z-10" aria-label={title} />

      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <span className="absolute left-4 top-4 z-20 border border-lime-500/50 bg-black/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-lime-400 backdrop-blur-sm">
          {primaryTag}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {publishDate}
          </span>
          <span className="h-1 w-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
          <span>{readMin} min read</span>
        </div>

        <h3 className="mb-3 text-lg font-black uppercase italic leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-lime-600 dark:text-white dark:group-hover:text-lime-400 sm:text-xl">
          {title}
        </h3>

        <p className="mb-5 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-zinc-400">{excerpt}</p>

        <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-lime-600 dark:text-lime-500">
          Read article
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </article>
  );
}

export function BlogFeaturedCard({ blog }: { blog: BlogPost }) {
  const { slug, title, image, excerpt, tags, publishDate } = blog;
  const primaryTag = tags[0] || "Featured";
  const readMin = estimateReadMinutes(excerpt);

  return (
    <article className="group relative overflow-hidden border-2 border-lime-500/30 bg-white dark:bg-zinc-950 md:grid md:grid-cols-2 lg:min-h-0">
      <Link href={`/blog/${slug}`} className="absolute inset-0 z-20" aria-label={title} />

      <div className="relative min-h-[220px] overflow-hidden sm:min-h-[260px] md:min-h-[320px] lg:min-h-[420px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent lg:from-transparent lg:to-black/40" />
        <span className="absolute left-5 top-5 border border-lime-500 bg-lime-500 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black">
          {primaryTag}
        </span>
      </div>

      <div className="relative flex flex-col justify-center border-t border-lime-500/20 p-5 sm:p-6 md:border-l md:p-8 lg:p-12">
        <div className="absolute left-0 top-0 hidden h-full w-1 bg-lime-500 md:block" />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-lime-600 dark:text-lime-500">Featured story</p>
        <h2 className="mt-2 text-xl font-black uppercase italic leading-snug tracking-tight text-gray-900 dark:text-white sm:mt-3 sm:text-2xl sm:leading-[1.1] lg:text-4xl">
          {title}
        </h2>
        <p className="mt-3 line-clamp-3 max-w-xl text-sm leading-relaxed text-gray-600 dark:text-zinc-400 sm:mt-4 sm:line-clamp-none sm:text-base">{excerpt}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500 sm:mt-6 sm:gap-4">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-lime-600 dark:text-lime-500" />
            {publishDate}
          </span>
          <span>{readMin} min read</span>
        </div>
        <span className="mt-5 inline-flex w-fit items-center gap-2 border-2 border-lime-500 bg-lime-500 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-black transition-colors group-hover:bg-white group-hover:text-black sm:mt-8 sm:px-6 sm:py-3">
          Read now
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
}
