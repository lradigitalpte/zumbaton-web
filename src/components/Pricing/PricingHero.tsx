"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Zap } from "lucide-react";

const PricingHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-[40vh] md:h-[50vh] flex items-center overflow-hidden bg-black pt-24 sm:pt-32 lg:pt-36 pb-12 md:pb-0"
    >
      {/* Dual Image Background Layout - Simplified for mobile */}
      <div className="absolute inset-0 -z-10 flex flex-col md:flex-row">
        {/* Image 1 - Left/Top */}
        <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
          <Image 
            src="/images/hero/notbad.jpeg"
            alt="One Step Fitness Pricing"
            fill
            className="object-cover scale-110 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent md:bg-black/40"></div>
        </div>
        
        {/* Image 2 - Right/Bottom */}
        <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden">
          <Image 
            src="/images/hero/hero.jpeg"
            alt="One Step Fitness Packages"
            fill
            className="object-cover scale-110 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 md:bg-black/40"></div>
        </div>

        {/* Sharp architectural lines - Reduced on mobile */}
        <div className="absolute top-0 left-0 w-full h-full border-[10px] md:border-[15px] border-white/5 pointer-events-none z-20"></div>
      </div>

      <div className="container relative z-30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lime-500 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-4 md:mb-6 flex items-center gap-4">
              <span className="w-8 md:w-12 h-[2px] bg-lime-500"></span>
              Flexible Options for You
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-6 md:mb-10 drop-shadow-2xl">
              PRICING & <br />
              <span className="text-lime-500">PACKAGES</span>
            </h1>

            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-8">
              <div className="flex flex-col gap-4">
                <nav className="flex items-center gap-3 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-lime-500 text-black px-3 py-1.5 md:px-6 md:py-3 self-start shadow-2xl">
                  <Link href="/explore" className="hover:opacity-70 transition-opacity">Home</Link>
                  <span className="opacity-30">/</span>
                  <span>Pricing</span>
                </nav>
                <Link 
                  href="/promos" 
                  className="group flex items-center gap-3 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] bg-black text-white px-3 py-2 md:px-6 md:py-3 self-start border border-white/10 hover:bg-lime-500 hover:text-black transition-all"
                >
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-lime-500 group-hover:text-black" />
                  View Trial Promos
                </Link>
              </div>
              
              <p className="max-w-md text-white font-bold text-xs md:text-sm leading-relaxed border-l-4 border-lime-500 pl-6 md:pl-8 uppercase tracking-wider">
                Choose the perfect package that fits your schedule. Your pace. 
                Your class. Your One Step Fitness journey.
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

export default PricingHero;
