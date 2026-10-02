"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ClassesHeroProps {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
}

const ClassesHero = ({
  title = "Classes",
  description = "Explore our adult dance fitness lineup, from high-energy step workouts to structured choreography sessions built for stamina and strength.",
  breadcrumbs,
}: ClassesHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/explore" },
    { label: "Classes", href: "/classes" },
  ];
  const items = breadcrumbs ?? defaultBreadcrumbs;

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[30vh] items-end overflow-hidden bg-black pb-10 pt-20 md:h-[40vh] md:pb-0 sm:pt-24 lg:pt-28"
    >
      <div className="absolute inset-0 -z-10 flex flex-col md:flex-row">
        <div className="relative h-1/2 w-full overflow-hidden border-b border-white/10 md:h-full md:w-1/2 md:border-b-0 md:border-r">
          <Image
            src="/images/hero/hero.jpeg"
            alt="One Step Fitness Classes"
            fill
            className="scale-110 object-cover transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent md:bg-black/40" />
        </div>
        <div className="relative h-1/2 w-full overflow-hidden md:h-full md:w-1/2">
          <Image
            src="/images/hero/hero2.jpeg"
            alt="One Step Fitness Movement"
            fill
            className="scale-110 object-cover transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 md:bg-black/40" />
        </div>
        <div className="pointer-events-none absolute left-0 top-0 z-20 h-full w-full border-[10px] border-white/5 md:border-[15px]" />
      </div>

      <div className="container relative z-30 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl pb-8 md:pb-10"
        >
          <div className="mb-4 flex items-center gap-4 text-sm font-black uppercase tracking-[0.3em] text-lime-500 md:mb-6 md:text-base">
            <span className="h-[2px] w-8 bg-lime-500 md:w-12" />
            One Step Fitness
          </div>

          <h1 className="mb-4 text-3xl font-black uppercase italic leading-[0.85] tracking-tighter text-white drop-shadow-2xl sm:text-4xl md:mb-6 md:text-5xl lg:text-6xl">
            {title === "Classes" ? (
              <>
                THE <br />
                <span className="text-lime-500">CLASSES</span>
              </>
            ) : title.includes(" ") ? (
              <>
                {title.split(" ")[0]} <br />
                <span className="text-lime-500">{title.split(" ").slice(1).join(" ")}</span>
              </>
            ) : (
              title
            )}
          </h1>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-8">
            <nav className="flex items-center gap-3 self-start bg-lime-500 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black shadow-2xl md:px-6 md:py-3 md:text-xs">
              {items.map((item, i) => (
                <span key={i} className="flex items-center gap-3">
                  {i > 0 && <span className="opacity-30">/</span>}
                  {item.href ? (
                    <Link href={item.href} className="transition-opacity hover:opacity-70">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </span>
              ))}
            </nav>

            {description ? (
              <p className="max-w-xl border-l-4 border-lime-500 pl-6 text-xs font-bold uppercase leading-relaxed tracking-wider text-white/95 md:pl-8 md:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 z-40 h-2 w-full bg-lime-500" />
    </section>
  );
};

export default ClassesHero;
