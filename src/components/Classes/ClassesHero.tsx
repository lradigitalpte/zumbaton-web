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
  breadcrumbs 
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
      className="relative min-h-[60vh] md:h-[70vh] flex items-center overflow-hidden bg-black pt-32 sm:pt-40 lg:pt-48 pb-12 md:pb-0"
    >
      {/* Dual Image Background Layout - Simplified for mobile */}
      <div className="absolute inset-0 -z-10 flex flex-col md:flex-row">
        {/* Image 1 - Left/Top */}
        <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
          <Image 
            src="/images/hero/hero.jpeg"
            alt="One Step Fitness Classes"
            fill
            className="object-cover scale-110 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent md:bg-black/40"></div>
        </div>
        
        {/* Image 2 - Right/Bottom */}
        <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden">
          <Image 
            src="/images/hero/hero2.jpeg"
            alt="One Step Fitness Movement"
            fill
            className="object-cover scale-110 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 md:bg-black/40"></div>
        </div>

        {/* Sharp architectural lines - Reduced on mobile */}
        <div className="absolute top-0 left-0 w-full h-full border-[10px] md:border-[15px] border-white/5 pointer-events-none z-20"></div>
      </div>

      <div className="container relative z-30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lime-500 font-black text-sm md:text-base uppercase tracking-[0.3em] mb-4 md:mb-6 flex items-center gap-4">
              <span className="w-8 md:w-12 h-[2px] bg-lime-500"></span>
              One Step Fitness
            </div>
            
            <h1 className="text-3xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-6 md:mb-12 drop-shadow-2xl">
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

            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-10">
              <nav className="flex items-center gap-3 text-[10px] md:text-sm font-bold uppercase tracking-widest bg-lime-500 text-black px-3 py-1.5 md:px-8 md:py-4 self-start shadow-2xl">
                {items.map((item, i) => (
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
              
              <p className="max-w-md text-white font-bold text-xs md:text-base leading-relaxed border-l-4 border-lime-500 pl-6 md:pl-8 uppercase tracking-wider">
                {description}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-lime-500 z-40"></div>
    </section>
  );
};

export default ClassesHero;
