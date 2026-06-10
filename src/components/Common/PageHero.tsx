"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeroProps {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  backgroundImage?: string;
  /** `display` = big stacked words (short page titles). `article` = wrapped readable title for blog posts. */
  titleMode?: "display" | "article";
}

const PageHero = ({
  title,
  breadcrumbs,
  backgroundImage = "/images/hero/hero.jpeg",
  titleMode = "display",
}: PageHeroProps) => {
  const isArticle = titleMode === "article";
  const titleWords = title.trim().split(/\s+/);
  const stackTitleWords = titleWords.length >= 3;

  return (
    <section
      className={`relative flex bg-black ${
        isArticle
          ? "min-h-[38vh] items-end overflow-x-hidden pt-28 pb-16 sm:pt-36 sm:pb-20 md:min-h-[42vh] lg:pt-40"
          : "min-h-[42vh] items-end overflow-x-hidden pt-28 pb-16 sm:min-h-[48vh] sm:pt-36 sm:pb-20 md:min-h-[52vh] lg:pt-40"
      }`}
    >
      {/* High-Impact Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover scale-105 transition-transform duration-[2000ms]"
          priority
        />
        {/* Sophisticated gradient overlay - Darker at top for menu visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/60 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent"></div>
      </div>

      {/* Sharp architectural lines - Reduced on mobile */}
      <div className="absolute top-0 left-0 w-full h-full border-[10px] md:border-[15px] border-white/5 pointer-events-none z-20"></div>

      <div className="container relative z-30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lime-500 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-4 md:mb-6 flex items-center gap-4">
              <span className="w-8 md:w-12 h-[2px] bg-lime-500"></span>
              One Step Fitness
            </div>
            
            {isArticle ? (
              <h1 className="mb-6 max-w-4xl break-words text-2xl font-black uppercase italic leading-snug tracking-tight text-white drop-shadow-2xl sm:text-3xl sm:leading-snug md:text-4xl md:leading-tight lg:text-[2.75rem] lg:leading-tight">
                {title}
              </h1>
            ) : (
              <h1 className="mb-6 max-w-5xl text-3xl font-black uppercase italic leading-none tracking-tighter text-white drop-shadow-2xl sm:text-6xl md:mb-8 md:text-7xl lg:text-8xl">
                {titleWords.map((word, i) => (
                  <span key={i} className={i === titleWords.length - 1 ? "text-lime-500" : ""}>
                    {word}
                    {stackTitleWords && i < titleWords.length - 1 ? (
                      <br className="hidden md:block" />
                    ) : i < titleWords.length - 1 ? (
                      " "
                    ) : null}
                  </span>
                ))}
              </h1>
            )}

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <nav className="flex items-center gap-3 text-[9px] md:text-xs font-black uppercase tracking-widest bg-lime-500 text-black px-3 py-1.5 md:px-6 md:py-3 self-start shadow-2xl">
                {breadcrumbs.map((item, i) => (
                  <span key={i} className="flex items-center gap-3">
                    {i > 0 && <span className="opacity-30">/</span>}
                    {item.href ? (
                      <Link href={item.href} className="hover:opacity-70 transition-opacity">
                        {item.label}
                      </Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </span>
                ))}
              </nav>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-lime-500 z-40"></div>
    </section>
  );
};

export default PageHero;
