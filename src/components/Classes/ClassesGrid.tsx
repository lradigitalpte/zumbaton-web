"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { zumbaClasses } from "@/data/classes";

const ClassesGrid = () => {
  return (
    <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-green-600 dark:text-green-500 font-semibold text-sm uppercase tracking-wide mb-3">
            Explore Our Programs
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Find Your Perfect Zumba Class
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            From high-energy dance parties to low-impact sessions, we have a Zumba class for everyone. 
            Click on any class to learn more!
          </p>
        </div>

        {/* Classes Grid - PowerFlow Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zumbaClasses.map((classItem, index) => (
            <ClassCard key={classItem.id} classItem={classItem} index={index} />
          ))}
        </div>
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
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const isFeatured = classItem.featured;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/classes/${classItem.slug}`} className="block group">
        <div className={`relative rounded-xl overflow-hidden ${
          isFeatured 
            ? "bg-green-600 dark:bg-green-700" 
            : "bg-gray-100 dark:bg-dark-2"
        }`}>
          <div className="flex flex-col md:flex-row">
            {/* Content Side */}
            <div className={`flex flex-col justify-between p-6 md:p-8 md:w-[45%] ${
              isFeatured ? "text-white" : "text-gray-900 dark:text-white"
            }`}>
              <div>
                {/* Intensity Badge */}
                <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 ${
                  isFeatured 
                    ? "bg-white/20 text-white" 
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}>
                  {classItem.intensity}
                </span>
                
                <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-lime-400 transition-colors">
                  {classItem.name}
                </h3>
                <p className={`text-sm md:text-base mb-4 line-clamp-3 ${
                  isFeatured ? "text-white/90" : "text-gray-600 dark:text-gray-400"
                }`}>
                  {classItem.shortDescription}
                </p>

                {/* Quick Info */}
                <div className={`flex flex-wrap gap-4 text-sm ${
                  isFeatured ? "text-white/80" : "text-gray-500 dark:text-gray-400"
                }`}>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {classItem.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                    {classItem.calories} cal
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <span className={`inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide ${
                  isFeatured 
                    ? "text-lime-400 group-hover:text-white" 
                    : "text-green-600 dark:text-green-500 group-hover:text-green-500"
                } transition-colors`}>
                  View Details
                  <svg 
                    className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Image Side - Angled like PowerFlow */}
            <div className="relative md:w-[55%] h-48 md:h-auto min-h-[250px]">
              {/* Angled overlay */}
              <div className={`absolute inset-y-0 left-0 w-16 z-10 hidden md:block ${
                isFeatured 
                  ? "bg-gradient-to-r from-green-600 dark:from-green-700 to-transparent" 
                  : "bg-gradient-to-r from-gray-100 dark:from-dark-2 to-transparent"
              }`} 
              style={{ 
                clipPath: "polygon(0 0, 100% 15%, 100% 85%, 0 100%)" 
              }}></div>
              
              <Image
                src={classItem.image}
                alt={classItem.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              
              {/* Gradient overlay on image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20"></div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ClassesGrid;
