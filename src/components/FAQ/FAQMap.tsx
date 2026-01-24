"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const FAQMap = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section
      ref={sectionRef}
      className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900 relative"
    >
      <div className="container px-3 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <span className="inline-block px-3 sm:px-4 py-1.5 bg-green-100 dark:bg-green-600/20 text-green-600 dark:text-green-400 rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            Find Us
          </span>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Visit Zumbaton in Singapore
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl border border-gray-200 dark:border-white/20"
        >
          <div className="w-full h-96 sm:h-[500px] bg-gray-200 dark:bg-gray-800 relative">
            <iframe
              src="https://www.google.com/maps?q=2+Jalan+Klapa+Singapore+199314&output=embed&zoom=17"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
        >
          {/* Contact Info Card */}
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Location</h3>
            </div>
            <p className="text-gray-600 dark:text-white/70 mb-4">
              2 JALAN KLAPA, #2-A, SINGAPORE 199314
            </p>
            <p className="text-sm text-gray-500 dark:text-white/60">
              Singapore
            </p>
          </div>

          {/* Contact Method Card */}
          <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6 sm:p-8 border border-gray-200 dark:border-white/20 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Get In Touch</h3>
            </div>
            <p className="text-gray-600 dark:text-white/70 mb-4">
              Have questions about our location or want to know more?
            </p>
            <a
              href="mailto:hello@zumbaton.sg"
              className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:underline"
            >
              hello@zumbaton.sg
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQMap;
