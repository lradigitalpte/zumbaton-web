"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { zumbaClasses, THUNDERBOLT_CLASS_SLUGS, isThunderboltClassSlug, CLASS_ENERGY } from "@/data/classes";
import { highlightCoachInText } from "@/lib/highlightCoachInText";
import { LightningRating } from "@/components/Common/LightningRating";
import { Clock, Flame, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const CLASSES_PER_PAGE = 6;
const EXCLUDED_CLASS_SLUGS = new Set(["zumbuddies", "lil-steppers"]);

const ClassesGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const filteredClasses = useMemo(
    () => zumbaClasses.filter((c) => !EXCLUDED_CLASS_SLUGS.has(c.slug)),
    []
  );

  const regularClasses = useMemo(
    () => filteredClasses.filter((c) => !isThunderboltClassSlug(c.slug)),
    [filteredClasses]
  );

  const thunderboltClasses = useMemo(
    () =>
      THUNDERBOLT_CLASS_SLUGS.map((slug) => filteredClasses.find((c) => c.slug === slug)).filter(
        (c): c is (typeof zumbaClasses)[number] => Boolean(c)
      ),
    [filteredClasses]
  );

  const totalPages = Math.max(1, Math.ceil(regularClasses.length / CLASSES_PER_PAGE));
  const paginatedRegular = useMemo(
    () =>
      regularClasses.slice(
        (currentPage - 1) * CLASSES_PER_PAGE,
        currentPage * CLASSES_PER_PAGE
      ),
    [currentPage, regularClasses]
  );

  const showThunderboltBlock =
    thunderboltClasses.length > 0 && currentPage === totalPages;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="py-12 md:py-16 bg-[#f6f4ee] dark:bg-black overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="flex-1"
          >
            <div className="inline-block bg-lime-500 text-black px-4 py-1 text-xs font-black uppercase tracking-[0.3em] mb-8">
              Adult Dance Programs
            </div>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white leading-[0.9] uppercase italic tracking-tighter mb-8 max-w-4xl">
              FIND YOUR <br />
              <span className="text-lime-500 underline decoration-4 underline-offset-8">PERFECT</span> <br />
              WORKOUT.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl uppercase tracking-tight">
              Explore our adult dance fitness lineup, from high-energy step workouts to structured choreography sessions built for stamina, strength, and fun.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="shrink-0"
          >
            <Link 
              href="/promos"
              className="group relative flex flex-col items-start p-6 bg-black border border-white/10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black px-2 py-1 uppercase tracking-widest z-10">
                New Offer
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500 mb-2">Limited Time</p>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-4">1-for-1 Trial <br />Special</h3>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white transition-colors">
                  <span>View Promos</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-lime-500/10 rounded-full blur-2xl group-hover:bg-lime-500/20 transition-colors"></div>
            </Link>
          </motion.div>
        </div>

        {/* Classes grid + Thunderbolt category (two formats) */}
        <div className="mx-auto max-w-7xl overflow-hidden border border-black/10 dark:border-white/10">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            {paginatedRegular.map((classItem, index) => (
              <ClassCard key={classItem.id} classItem={classItem} index={index} sectionInView={isInView} />
            ))}
          </div>

          {showThunderboltBlock ? (
            <>
              <div
                id="thunderbolt-series"
                className="scroll-mt-28 border-t border-l-4 border-t-black/10 border-l-lime-500 bg-[#ebe8e0] px-6 py-10 dark:border-t-white/10 dark:border-l-lime-400 dark:bg-zinc-900/90 md:px-12 md:py-12"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-lime-700 dark:text-lime-300 sm:text-sm">
                      Thunderbolt series
                    </p>
                    <h2 className="mt-2 text-4xl font-black uppercase italic leading-[0.9] tracking-tighter text-gray-900 drop-shadow-sm dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
                      <span className="text-lime-600 dark:text-lime-400">Thunder</span>
                      <span className="text-gray-900 dark:text-white">bolt</span>
                    </h2>
                    <h3 className="mt-3 text-xl font-black uppercase italic tracking-tight text-gray-800 dark:text-zinc-200 md:text-2xl lg:text-3xl">
                      Tabata-style · full body
                    </h3>
                    <p className="mt-5 max-w-3xl text-sm font-medium uppercase leading-relaxed tracking-tight text-gray-600 dark:text-zinc-400 md:text-base md:normal-case md:tracking-normal">
                      {highlightCoachInText(
                        "High-intensity Tabata-style rounds in two coached formats: power and stamina on the step with Coach Robert, or resistance bands and dance-led cardio with Coach Fizah. Choose the session that fits how you like to train."
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 divide-y divide-black/10 dark:divide-white/10 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                {thunderboltClasses.map((classItem, index) => (
                  <ClassCard
                    key={classItem.id}
                    classItem={classItem}
                    index={index}
                    sectionInView={isInView}
                    cellVariant="divided"
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-8 max-w-7xl mx-auto border-t border-black/10 dark:border-white/10 pt-12"
          >
            <p className="text-sm font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">
              Showing {(currentPage - 1) * CLASSES_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * CLASSES_PER_PAGE, regularClasses.length)} of {regularClasses.length} in grid
              {thunderboltClasses.length > 0 ? (
                <span className="block sm:inline sm:before:content-['\00a0']">· {filteredClasses.length} class formats</span>
              ) : null}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-12 h-12 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-lime-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-12 h-12 font-black transition-all duration-300 ${
                      currentPage === page
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-lime-500 hover:text-black"
                    }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-12 h-12 bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-lime-500 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                aria-label="Next page"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

interface ClassCardProps {
  classItem: (typeof zumbaClasses)[0];
  index: number;
  sectionInView: boolean;
  /** Inside Thunderbolt split row: parent handles dividers */
  cellVariant?: "default" | "divided";
}

const ClassCard = ({ classItem, index, sectionInView, cellVariant = "default" }: ClassCardProps) => {
  const edgeClasses =
    cellVariant === "divided"
      ? "border-0"
      : "border-b border-black/10 last:border-r-0 dark:border-white/10 lg:border-r";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative overflow-hidden bg-white dark:bg-zinc-950 ${edgeClasses}`}
    >
      <div className="flex flex-col h-full">
        {/* Main Clickable Area */}
        <Link href={`/classes/${classItem.slug}`} className="absolute inset-0 z-0" aria-label={`View details for ${classItem.name}`} />
        
        {/* Image Section */}
        <div className="relative h-72 md:h-80 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
          <Image
            src={classItem.image}
            alt={classItem.name}
            fill
            className={`object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ${classItem.slug === "zumbuddies" ? "object-[50%_20%]" : "object-center"}`}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          
          {/* Intensity Badge */}
          <div className="absolute right-0 top-0 z-10">
            <span className="inline-flex items-center px-6 py-3 bg-lime-500 text-black text-xs font-black uppercase tracking-widest">
              {classItem.intensity}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex flex-1 flex-col p-6 md:p-10 pointer-events-none">
          {isThunderboltClassSlug(classItem.slug) ? (
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-lime-600 dark:text-lime-400">
              Thunderbolt format
            </p>
          ) : null}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900 transition-colors group-hover:text-lime-500 dark:text-white md:text-3xl">
              {classItem.name}
            </h3>
            <LightningRating filled={CLASS_ENERGY[classItem.slug] ?? 4} size="md" aria-hidden />
          </div>
          
          <p className="mb-6 line-clamp-3 text-sm font-medium uppercase leading-relaxed tracking-tight text-gray-600 dark:text-zinc-400">
            {highlightCoachInText(classItem.shortDescription)}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-black/5 dark:border-white/5 mt-auto">
            <div className="flex items-center gap-3 text-gray-900 dark:text-white">
              <Clock className="w-5 h-5 text-lime-500" />
              <span className="font-black uppercase tracking-widest text-xs">{classItem.duration}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-900 dark:text-white">
              <Flame className="w-5 h-5 text-lime-500" />
              <span className="font-black uppercase tracking-widest text-xs">{classItem.calories} cal</span>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between gap-4 pointer-events-auto">
            <div className="flex items-center gap-6">
              <span className="text-black dark:text-white font-black text-xs uppercase tracking-[0.3em] group-hover:text-lime-500 transition-colors">
                View Details
              </span>
              <Link 
                href="/trial-booking" 
                className="hidden sm:block text-[10px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 hover:underline"
              >
                Book Trial
              </Link>
            </div>
            <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:bg-lime-500 group-hover:text-black transition-all duration-300">
              <ArrowRight className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClassesGrid;
