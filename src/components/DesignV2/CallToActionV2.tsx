"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CallToActionV2 = () => {
  return (
    <section
      className="py-32 relative overflow-hidden bg-white dark:bg-black text-gray-900 dark:text-white"
    >
      <div className="absolute inset-0 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white mb-8 tracking-tight leading-tight"
        >
          Ready to <span className="text-lime-500 block mt-3">Sweat?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-2xl text-gray-600 dark:text-zinc-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed"
        >
          Your first class is the start of something amazing. Join the One Step Fitness family and experience the difference.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/trial-booking"
            className="group relative inline-block px-10 md:px-14 py-5 md:py-6 bg-lime-500 hover:bg-lime-600 text-black font-black text-lg md:text-xl rounded-full transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg hover:shadow-xl overflow-hidden"
          >
            <span className="relative z-10">Book Your Trial Class</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionV2;
