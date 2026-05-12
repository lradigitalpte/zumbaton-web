"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CallToActionV2 = () => {
  return (
    <section
      className="py-16 md:py-32 relative overflow-hidden bg-[#f6f4ee] dark:bg-black text-gray-900 dark:text-white"
    >
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[28px] sm:rounded-[36px] border border-gray-200 bg-white px-5 sm:px-8 py-6 sm:py-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:px-12 md:py-14"
        >
          <div className="grid grid-cols-1 gap-6 sm:gap-10 lg:flex lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="mb-5 inline-flex rounded-full border border-gray-300 bg-[#f6f4ee] px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-700 dark:border-zinc-800 dark:bg-black dark:text-zinc-300">
                Your First Step
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic leading-[0.96]">
                Ready to <span className="text-lime-500 block mt-2">Sweat?</span>
              </h2>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-2xl text-gray-600 dark:text-zinc-400 max-w-3xl font-medium leading-relaxed">
                Your first class is the start of something amazing. Join the One Step Fitness family and experience the difference.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:flex lg:flex-col xl:flex-row">
              <Link
                href="/trial-booking"
                className="inline-flex items-center justify-center rounded-full bg-lime-500 px-6 sm:px-10 py-3.5 sm:py-5 text-center text-sm sm:text-lg font-black text-black transition-all hover:scale-[1.03] hover:bg-lime-400 active:scale-[0.97] shadow-lg hover:shadow-xl"
              >
                Book Your Trial Class
              </Link>
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center rounded-full border border-gray-300 px-6 sm:px-10 py-3.5 sm:py-5 text-center text-sm sm:text-lg font-bold text-gray-900 transition-all hover:border-lime-400 hover:text-lime-600 dark:border-zinc-700 dark:text-white dark:hover:border-lime-400 dark:hover:text-lime-400"
              >
                Explore Schedule
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionV2;
