"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const AboutHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section 
      ref={sectionRef}
      className="relative h-[80vh] md:h-[90vh] flex items-center overflow-hidden bg-black"
    >
      {/* Dual Image Background Layout */}
      <div className="absolute inset-0 -z-10 flex flex-col md:flex-row">
        {/* Image 1 - Left/Top */}
        <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
          <Image 
            src="/images/hero/hero2.jpeg"
            alt="One Step Fitness Energy"
            fill
            className="object-cover scale-110 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Image 2 - Right/Bottom */}
        <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden">
          <Image 
            src="/images/hero/hero.jpeg"
            alt="One Step Fitness Movement"
            fill
            className="object-cover scale-110 transition-all duration-1000"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Sharp architectural lines */}
        <div className="absolute top-0 left-0 w-full h-full border-[20px] border-white/5 pointer-events-none z-20"></div>
      </div>

      <div className="container relative z-30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-lime-500 font-black text-sm md:text-base uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
              <span className="w-12 h-[2px] bg-lime-500"></span>
              One step to change your life
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-[12rem] font-black text-white uppercase italic tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl">
              THE <br />
              <span className="text-lime-500">STORY</span>
            </h1>

            <div className="flex flex-col md:flex-row md:items-end gap-10">
              <nav className="flex items-center gap-3 text-xs md:text-sm font-bold uppercase tracking-widest bg-lime-500 text-black px-8 py-4 self-start shadow-2xl">
                <Link href="/explore" className="hover:opacity-70 transition-opacity">
                  Home
                </Link>
                <span className="opacity-30">/</span>
                <span>About Us</span>
              </nav>
              
              <p className="max-w-md text-white font-bold text-sm md:text-base leading-relaxed border-l-4 border-lime-500 pl-8 uppercase tracking-wider">
                We are more than just a gym. We are a community built on rhythm, 
                movement, and the drive to improve every single day.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom accent bar */}
      <div className="absolute bottom-0 left-0 w-full h-3 bg-lime-500 z-40"></div>
    </section>
  );
};

export default AboutHero;
