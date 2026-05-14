"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const AboutCTA = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section 
      ref={sectionRef}
      className="bg-lime-500 py-16 md:py-24"
    >
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="text-center md:text-left max-w-3xl"
          >
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-black mb-4 uppercase italic tracking-tighter leading-[0.95]">
              Ready to start your fitness journey?
            </h3>
            <p className="text-black/80 text-lg md:text-xl font-bold uppercase tracking-wide">
              Join our community today and achieve your goals with structured routines.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-shrink-0 w-full md:w-auto"
          >
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 text-xl font-black text-white bg-black hover:bg-zinc-900 transition-all duration-300 rounded-none shadow-2xl uppercase tracking-widest group"
            >
              <span>Try Now!</span>
              <svg 
                className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
