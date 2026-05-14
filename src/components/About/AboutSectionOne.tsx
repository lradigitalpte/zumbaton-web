"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const AboutSectionOne = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Side - Editorial Image Layout */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0">
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 z-10 border border-black/10 dark:border-white/10"
              >
                <Image
                  src="/images/hero/hero2.jpeg"
                  alt="One Step Fitness Class"
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>

              {/* Decorative Frame */}
              <div className="absolute -top-6 -left-6 w-full h-full border-2 border-lime-500 -z-0 hidden md:block"></div>
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="absolute -bottom-10 -right-6 z-20 bg-black text-white p-8 md:p-10 rounded-none shadow-2xl max-w-[200px]"
              >
                <div className="text-4xl font-black text-lime-500 mb-2 italic tracking-tighter">100%</div>
                <div className="text-xs font-black uppercase tracking-[0.2em] leading-tight">
                  Commitment to your progress
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Bold Content */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-block bg-lime-500 text-black px-4 py-1 text-xs font-black uppercase tracking-[0.3em] mb-8">
                The Foundation
              </div>
              
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] uppercase italic tracking-tighter mb-8">
                WE BUILD <br />
                <span className="text-lime-500 underline decoration-4 underline-offset-8">ENERGY</span> <br />
                THROUGH RHYTHM.
              </h2>

              <div className="space-y-6 mb-10">
                <p className="text-lg md:text-xl text-gray-900 dark:text-white font-bold leading-tight uppercase tracking-tight">
                  High-energy sessions built for movement and pure joy.
                </p>
                <p className="text-base text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
                  We don&apos;t do boring. Our approach is direct: smart movement, raw energy, and a community that keeps you moving forward. No distractions, just smart movement.
                </p>
              </div>

              <button
                onClick={openWhatsAppModal}
                className="group relative inline-flex items-center gap-4 bg-black dark:bg-white text-white dark:text-black px-10 py-5 text-sm font-black uppercase tracking-[0.3em] transition-all hover:bg-lime-500 hover:text-black dark:hover:bg-lime-500"
              >
                <span>Start Your Journey</span>
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Values — 2×2 on mobile, single row from md */}
        <div className="mt-24 grid grid-cols-2 gap-px border-t border-black/10 bg-black/10 pt-px dark:border-white/10 dark:bg-white/10 md:mt-32 md:grid-cols-4">
          <ValueItem number="01" title="All Levels" desc="Sessions for everyone." />
          <ValueItem number="02" title="All Stages" desc="Energy for every stage." />
          <ValueItem number="03" title="Structured" desc="Raw, structured energy." />
          <ValueItem number="04" title="The Squad" desc="The best in the game." />
        </div>
      </div>
    </section>
  );
};

const ValueItem = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="group bg-[#f6f4ee] p-5 transition-colors hover:bg-lime-500/5 dark:bg-black sm:p-6 md:p-10">
    <div className="mb-3 text-sm font-black tracking-widest text-lime-500 md:mb-6">{number}</div>
    <h3 className="mb-2 text-lg font-black uppercase italic tracking-tighter text-gray-900 transition-colors group-hover:text-lime-500 dark:text-white sm:text-xl md:mb-4 md:text-2xl">
      {title}
    </h3>
    <p className="text-[11px] font-medium uppercase leading-snug tracking-wide text-gray-600 dark:text-zinc-400 sm:text-xs md:text-sm md:leading-relaxed">
      {desc}
    </p>
  </div>
);

export default AboutSectionOne;
