"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { zumbaClasses } from "@/data/classes";
import { Clock, Flame, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const CLASSES_PER_PAGE = 6;

const ClassesGrid = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(zumbaClasses.length / CLASSES_PER_PAGE);
  const paginatedClasses = useMemo(
    () =>
      zumbaClasses.slice(
        (currentPage - 1) * CLASSES_PER_PAGE,
        currentPage * CLASSES_PER_PAGE
      ),
    [currentPage]
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-20 lg:py-28 bg-gradient-to-b from-white to-gray-50 dark:from-gray-dark dark:to-gray-900">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-semibold rounded-full mb-4">
              Explore Our Programs
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Find Your Perfect Zumba Class
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-lg">
              From high-energy dance parties to low-impact sessions, we have a Zumba class for everyone. 
              Click on any class to learn more!
            </p>
          </motion.div>
        </div>

        {/* Classes Grid - Modern Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 max-w-7xl mx-auto">
          {paginatedClasses.map((classItem, index) => (
            <ClassCard key={classItem.id} classItem={classItem} index={index} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto"
          >
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(currentPage - 1) * CLASSES_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * CLASSES_PER_PAGE, zumbaClasses.length)} of{" "}
              {zumbaClasses.length} classes
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`min-w-[2.5rem] h-10 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? "bg-green-600 text-white"
                        : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-5 h-5" />
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
}

const ClassCard = ({ classItem, index }: ClassCardProps) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
    >
      <Link href={`/classes/${classItem.slug}`} className="block group h-full">
        <div className="relative h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500">
          {/* Image Section - Zumbuddies: focus on upper part of image so faces show (not too low) */}
          <div className="relative h-64 md:h-72 overflow-hidden bg-gradient-to-br from-green-400 to-green-600">
            <Image
              src={classItem.image}
              alt={classItem.name}
              fill
              className={`object-cover group-hover:scale-110 transition-transform duration-700 ${classItem.slug === "zumbuddies" ? "object-[50%_20%]" : "object-center"}`}
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            {/* Intensity Badge - Top Right */}
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center px-4 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-900 dark:text-white text-xs font-bold rounded-full shadow-lg">
                {classItem.intensity}
              </span>
            </div>

            {/* Class Name Overlay - Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {classItem.name}
              </h3>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6 line-clamp-3">
              {classItem.shortDescription}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold">{classItem.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-semibold">{classItem.calories} cal</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-between">
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wide group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                View Details
              </span>
              <div className="w-10 h-10 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center group-hover:bg-green-700 dark:group-hover:bg-green-600 transition-all duration-300 group-hover:scale-110">
                <ArrowRight className="w-5 h-5 text-white transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Hover Effect Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-500/10 to-transparent"></div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ClassesGrid;
