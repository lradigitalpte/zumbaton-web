"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const ClassesCTA = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section 
      ref={sectionRef}
      className="bg-lime-500 py-16 md:py-20 relative overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-1/4 h-full bg-black/5 -skew-x-12 -translate-x-1/4"></div>

      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="text-center lg:text-left max-w-4xl"
          >
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-black mb-8 uppercase italic tracking-tighter leading-[0.9]">
              READY TO <br />
              <span className="bg-black text-lime-500 px-4 py-1 inline-block">START</span> <br />
              DANCING?
            </h3>
            <p className="text-black/80 text-lg md:text-xl font-bold uppercase tracking-tight leading-relaxed max-w-2xl">
              Join our community and find your perfect class. One Step Fitness helps you build consistency one workout at a time.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex-shrink-0 w-full lg:w-auto flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/trial-booking"
              className="w-full lg:w-auto inline-flex items-center justify-center gap-4 px-12 py-6 text-xl font-black text-white bg-black hover:bg-zinc-900 transition-all duration-300 rounded-none shadow-2xl uppercase tracking-[0.2em] group"
            >
              <span>Book Trial</span>
              <svg 
                className="w-6 h-6 transform group-hover:translate-x-2 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="w-full lg:w-auto inline-flex items-center justify-center gap-4 px-12 py-6 text-xl font-black text-black border-4 border-black hover:bg-black hover:text-lime-500 transition-all duration-300 rounded-none uppercase tracking-[0.2em]"
            >
              <span>WhatsApp</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ClassesCTA;
