"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const CallToActionV2 = () => {
  return (
    <section
      className="py-32 relative overflow-hidden bg-gray-100 dark:bg-black"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.15) 0%, transparent 45%),
          radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.1) 0%, transparent 45%),
          radial-gradient(circle 1.5px at center center, rgba(34, 197, 94, 0.12) 0%, transparent 100%)
        `,
        backgroundSize: "100% 100%, 100% 100%, 28px 28px",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent dark:via-green-950/20 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-8 tracking-tight"
        >
          Ready to <span className="text-green-600 dark:text-green-500">Sweat?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto"
        >
          Your first class is the start of something amazing. Join the Zumbaton family today.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link
            href="/trial-booking"
            className="inline-block px-12 py-6 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded-full transition-all hover:scale-105 shadow-[0_0_40px_rgba(22,163,74,0.4)] hover:shadow-[0_0_60px_rgba(22,163,74,0.6)]"
          >
            Book Your Trial Class
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionV2;
