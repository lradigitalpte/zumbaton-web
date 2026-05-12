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
}

const PageHero = ({ title, breadcrumbs, backgroundImage = "/images/hero/hero.jpeg" }: PageHeroProps) => {
  return (
    <section className="relative min-h-[50vh] md:h-[60vh] flex items-center overflow-hidden bg-black pt-32 sm:pt-40 lg:pt-48 pb-12 md:pb-0">
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
            
            <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-6 md:mb-10 drop-shadow-2xl">
              {title.split(' ').map((word, i) => (
                <span key={i} className={i === title.split(' ').length - 1 ? "text-lime-500" : ""}>
                  {word} {i < title.split(' ').length - 1 && <br className="hidden md:block" />}
                </span>
              ))}
            </h1>

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
