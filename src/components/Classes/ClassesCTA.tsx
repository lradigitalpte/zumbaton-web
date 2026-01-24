"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const ClassesCTA = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section 
      ref={sectionRef}
      className="bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 py-16 md:py-20 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Start Dancing?
            </h3>
            <p className="text-white/95 text-lg md:text-xl leading-relaxed">
              Join our community and find your Zumba class. Your pace. Your dance. Your Zumbaton.
            </p>
          </motion.div>

          {/* Button */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="inline-flex items-center gap-3 px-10 py-5 text-lg font-bold text-green-600 bg-white hover:bg-gray-50 transition-all duration-300 rounded-xl shadow-2xl hover:shadow-3xl hover:scale-105 group"
            >
              <span>Join Now</span>
              <svg 
                className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClassesCTA;
