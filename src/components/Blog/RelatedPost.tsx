import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const RelatedPost = ({
  image,
  slug,
  title,
  date,
}: {
  image: string;
  slug: string;
  title: string;
  date: string;
}) => {
  return (
    <Link
      href={slug}
      className="group flex gap-4 border border-black/10 bg-gray-50 p-3 transition-all hover:border-lime-500/50 hover:bg-lime-500/5 dark:border-white/10 dark:bg-black/40 dark:hover:bg-zinc-900"
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden sm:h-[72px] sm:w-24">
        <Image src={image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="96px" />
      </div>
      <div className="min-w-0 flex-1">
        <h5 className="line-clamp-2 text-sm font-bold uppercase leading-snug text-gray-900 group-hover:text-lime-600 dark:text-white dark:group-hover:text-lime-400">
          {title}
        </h5>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:text-zinc-500">{date}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-gray-400 transition-colors group-hover:text-lime-600 dark:text-zinc-600 dark:group-hover:text-lime-500" />
    </Link>
  );
};

export default RelatedPost;
