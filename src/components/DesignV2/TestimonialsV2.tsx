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
    <section className="py-24 bg-gray-100 dark:bg-zinc-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Community Love
        </h2>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white dark:bg-black/60 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white/90 text-sm sm:text-base font-medium shadow-sm dark:shadow-none"
            >
              <span className="text-green-600 dark:text-green-500 font-bold">{badge.icon}</span>
              {badge.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsV2;
