"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ClassesCTA = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section 
      ref={sectionRef}
      className="bg-green-600 dark:bg-green-700 py-12 md:py-16"
    >
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Ready to start your Zumba journey?
            </h3>
            <p className="text-white/80 text-lg">
              Join now and get your first class free!
            </p>
          </motion.div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 text-lg font-bold text-green-600 bg-white hover:bg-gray-100 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl group"
            >
              <span>Join Now</span>
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClassesCTA;
