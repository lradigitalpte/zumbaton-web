"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { zumbaClasses } from "@/data/classes";
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
  const totalPages = Math.ceil(filteredClasses.length / CLASSES_PER_PAGE);
  const paginatedClasses = useMemo(
    () =>
      filteredClasses.slice(
        (currentPage - 1) * CLASSES_PER_PAGE,
        currentPage * CLASSES_PER_PAGE
      ),
    [currentPage, filteredClasses]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-block bg-lime-500 text-black px-4 py-1 text-xs font-black uppercase tracking-[0.3em] mb-8">
              Adult Dance Programs
            </div>
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] uppercase italic tracking-tighter mb-8 max-w-4xl">
              FIND YOUR <br />
              <span className="text-lime-500 underline decoration-4 underline-offset-8">PERFECT</span> <br />
              WORKOUT.
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl uppercase tracking-tight">
              Explore our adult dance fitness lineup, from high-energy step workouts to structured choreography sessions built for stamina, strength, and fun.
            </p>
          </motion.div>
        </div>

        {/* Classes Grid - Editorial Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-black/10 dark:border-white/10 max-w-7xl mx-auto">
          {paginatedClasses.map((classItem, index) => (
            <ClassCard key={classItem.id} classItem={classItem} index={index} sectionInView={isInView} />
          ))}
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
              {Math.min(currentPage * CLASSES_PER_PAGE, filteredClasses.length)} of{" "}
              {filteredClasses.length} classes
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
  classItem: typeof zumbaClasses[0];
  index: number;
  sectionInView: boolean;
}

const ClassCard = ({ classItem, index, sectionInView }: ClassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={sectionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative bg-white dark:bg-zinc-950 border-b lg:border-r border-black/10 dark:border-white/10 last:border-r-0 overflow-hidden"
    >
      <Link href={`/classes/${classItem.slug}`} className="block h-full">
        <div className="flex flex-col h-full">
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
            <div className="absolute top-0 right-0">
              <span className="inline-flex items-center px-6 py-3 bg-lime-500 text-black text-xs font-black uppercase tracking-widest">
                {classItem.intensity}
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 flex flex-col flex-1">
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6 uppercase italic tracking-tighter group-hover:text-lime-500 transition-colors">
              {classItem.name}
            </h3>
            
            <p className="text-gray-600 dark:text-zinc-400 text-base font-medium leading-relaxed mb-8 line-clamp-3 uppercase tracking-tight">
              {classItem.shortDescription}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8 mb-10 pb-8 border-b border-black/5 dark:border-white/5 mt-auto">
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
            <div className="flex items-center justify-between">
              <span className="text-black dark:text-white font-black text-xs uppercase tracking-[0.3em] group-hover:text-lime-500 transition-colors">
                View Details
              </span>
              <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:bg-lime-500 group-hover:text-black transition-all duration-300">
                <ArrowRight className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ClassesGrid;
