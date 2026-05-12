"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const TrialBookingHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[60vh] md:h-[60vh] flex items-center overflow-hidden bg-black pt-32 sm:pt-40 lg:pt-48 pb-12 md:pb-0"
    >
      {/* High-Impact Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/images/hero/hero.jpeg"
          alt="Book a Trial Class"
          fill
          className="object-cover scale-105 transition-transform duration-[2000ms]"
          priority
        />
        {/* Sophisticated gradient overlay - Darker at top for menu visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/60 md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent"></div>
      </div>

      {/* Sharp architectural lines - Reduced on mobile */}
      <div className="absolute top-0 left-0 w-full h-full border-[10px] md:border-[15px] border-white/5 pointer-events-none z-20"></div>

      <div className="container relative z-30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lime-500 font-black text-xs md:text-base uppercase tracking-[0.3em] mb-4 md:mb-6 flex items-center gap-4">
              <span className="w-8 md:w-12 h-[2px] bg-lime-500"></span>
              One Step Fitness
            </div>
            
            <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-6 md:mb-10 drop-shadow-2xl">
              BOOK A <br />
              <span className="text-lime-500 underline decoration-4 underline-offset-8">TRIAL CLASS</span>
            </h1>

            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
              <nav className="flex items-center gap-3 text-[9px] md:text-xs font-black uppercase tracking-widest bg-lime-500 text-black px-3 py-1.5 md:px-6 md:py-3 self-start shadow-2xl">
                <Link href="/explore" className="hover:opacity-70 transition-opacity">Home</Link>
                <span className="opacity-30">/</span>
                <span>Book a Trial</span>
              </nav>
              
              <p className="max-w-md text-white font-bold text-xs md:text-base leading-relaxed border-l-4 border-lime-500 pl-6 md:pl-8 uppercase tracking-wider">
                Select a class, enter your details, and pay securely. 
                No account required to start your journey.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 w-full h-2 bg-lime-500 z-40"></div>
    </section>
  );
};

export default TrialBookingHero;
