"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CallToActionV2 = () => {
  return (
    <section className="relative overflow-hidden bg-[#f6f4ee] py-16 text-gray-900 dark:bg-black dark:text-white md:py-32">
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.36, ease: "easeOut" }}
          className="border border-black/10 bg-white px-5 py-6 dark:border-white/10 dark:bg-zinc-950 sm:px-8 sm:py-10 md:px-12 md:py-14"
        >
          <div className="grid grid-cols-1 gap-6 sm:gap-10 lg:flex lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="mb-5 inline-flex border border-black/10 bg-[#f6f4ee] px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-800 dark:border-white/10 dark:bg-black dark:text-zinc-200">
                Your First Step
              </span>
              <h2 className="text-4xl font-black uppercase italic leading-[0.85] tracking-tight text-gray-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl lg:leading-[0.85]">
                Ready to <span className="mt-2 block text-lime-500">Sweat?</span>
              </h2>
              <p className="mt-4 max-w-3xl text-base font-medium leading-relaxed text-gray-600 sm:mt-6 sm:text-lg md:text-2xl dark:text-zinc-400">
                Your first class is the start of something amazing. Join the One Step Fitness family and experience the
                difference.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:flex lg:flex-col xl:flex-row">
              <Link
                href="/trial-booking"
                className="inline-flex items-center justify-center bg-lime-500 px-6 py-3.5 text-center text-sm font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-lime-400 sm:px-10 sm:py-5 sm:text-lg"
              >
                Book Your Trial Class
              </Link>
              <Link
                href="/schedule"
                className="inline-flex items-center justify-center border border-black/10 px-6 py-3.5 text-center text-sm font-black uppercase tracking-[0.2em] text-gray-900 transition-colors hover:border-lime-500 hover:text-lime-600 dark:border-white/10 dark:text-white dark:hover:border-lime-400 dark:hover:text-lime-400 sm:px-10 sm:py-5 sm:text-lg"
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
