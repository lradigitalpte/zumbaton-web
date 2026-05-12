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
    <section className="py-20 md:py-28 bg-gray-50 dark:bg-zinc-900 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-black text-center text-gray-900 dark:text-white mb-6 tracking-tight uppercase italic"
        >
          Community <span className="text-lime-500">Love</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-center text-gray-600 dark:text-zinc-400 mb-16 max-w-2xl mx-auto text-lg font-medium"
        >
          Join thousands of members who've transformed their lives through dance fitness and community.
        </motion.p>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {trustBadges.map((badge, i) => (
            <motion.div
              key={badge.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="inline-flex items-center gap-2 px-6 md:px-7 py-3 md:py-4 rounded-full bg-white dark:bg-black/40 backdrop-blur-sm border border-gray-300 dark:border-white/10 text-gray-800 dark:text-white text-sm md:text-base font-semibold shadow-md hover:shadow-lg dark:shadow-none hover:scale-105 transition-all duration-300"
            >
              <span className="text-lime-500 font-black text-lg">{badge.icon}</span>
              {badge.label}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsV2;
