"use client";

import { motion } from "framer-motion";

const trustBadges = [
  { label: "Certified Coaches", icon: "✓" },
  { label: "All Levels Welcome", icon: "✓" },
  { label: "Friendly Community", icon: "✓" },
  { label: "No Judgement", icon: "✓" },
  { label: "Beginner Friendly", icon: "✓" },
  { label: "Real Vibes", icon: "✓" },
];

const TestimonialsV2 = () => {
  return (
    <section className="py-16 md:py-28 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[28px] border border-gray-200 bg-[#fbfaf6] p-5 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-10"
          >
            <span className="mb-5 inline-flex rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
              Community Love
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white tracking-tight uppercase italic leading-[0.96]">
              Real energy. <span className="text-lime-500 block mt-2">Real consistency.</span>
            </h2>
            <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg md:text-xl leading-relaxed font-medium text-gray-600 dark:text-zinc-400">
              Members stay because the classes are fun, the coaching feels human, and the environment helps people keep showing up.
            </p>
            <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 sm:max-w-md">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-950 sm:px-5 sm:py-4">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Vibe</div>
                <div className="mt-1 text-2xl font-black">Welcoming</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-950 sm:px-5 sm:py-4">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Focus</div>
                <div className="mt-1 text-2xl font-black">Progress</div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex min-h-[88px] sm:min-h-[96px] items-center gap-3 rounded-[20px] sm:rounded-[24px] border border-gray-200 bg-[#fbfaf6] px-4 sm:px-6 py-4 sm:py-5 text-gray-800 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            >
              <span className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-lime-500 text-base sm:text-lg font-black text-black">{badge.icon}</span>
              <span className="text-xs sm:text-sm md:text-base font-semibold leading-snug">{badge.label}</span>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsV2;
