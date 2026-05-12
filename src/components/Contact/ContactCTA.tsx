"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const ContactCTA = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section 
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden bg-black"
    >
      {/* Editorial Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/images/image00040.jpeg"
          alt="Ready to Dance"
          fill
          className="object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
      </div>

      {/* Sharp architectural lines */}
      <div className="absolute top-0 left-0 w-full h-full border-[20px] border-white/5 pointer-events-none z-20"></div>

      <div className="container relative z-30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-lime-500 font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-8 flex items-center justify-center gap-4">
              <span className="w-12 h-[2px] bg-lime-500"></span>
              Join the Community
              <span className="w-12 h-[2px] bg-lime-500"></span>
            </div>
            
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-10">
              READY TO START <br />
              <span className="text-lime-500 underline decoration-4 underline-offset-8">DANCING?</span>
            </h2>
            
            <p className="text-lg md:text-xl font-medium uppercase tracking-tight text-white/70 mb-12 max-w-2xl mx-auto">
              Find your dance fitness class and join our vibrant community. 
              One beat. One step. One happy you.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/pricing"
                className="group relative px-10 py-5 bg-lime-500 text-black font-black uppercase tracking-[0.3em] overflow-hidden transition-all duration-300 hover:bg-white"
              >
                <span className="relative z-10 flex items-center gap-3">
                  VIEW PACKAGES
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </Link>
              
              <Link
                href="/schedule"
                className="group px-10 py-5 bg-transparent text-white border-2 border-white/20 font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              >
                CLASS SCHEDULE
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-full h-2 bg-lime-500 z-40"></div>
    </section>
  );
};

export default ContactCTA;
