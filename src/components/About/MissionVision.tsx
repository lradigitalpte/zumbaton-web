"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

const MissionVision = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section ref={sectionRef} className="relative bg-black overflow-hidden">
      <div className="flex flex-col lg:flex-row min-h-[80vh]">
        
        {/* Left Side - Visual Statement */}
        <div className="lg:w-1/2 relative min-h-[40vh] lg:min-h-0">
          <Image
            src="/images/image00059.jpeg"
            alt="One Step Fitness Mission"
            fill
            className="object-cover opacity-60 grayscale"
          />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="border-[10px] border-lime-500 p-8 md:p-12 text-center"
            >
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                OUR <br />
                <span className="text-lime-500">PURPOSE</span>
              </h2>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Content */}
        <div className="lg:w-1/2 flex flex-col justify-center p-8 md:p-16 lg:p-24 bg-zinc-950">
          <div className="max-w-xl">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-16 md:mb-24"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-lime-500 font-black text-sm tracking-[0.3em]">01</span>
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">Our Mission</h3>
              </div>
              <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed border-l border-lime-500/30 pl-8">
                One Step Fitness exists to make fitness effective, inclusive, and empowering through structured aerobic routines. We provide a supportive environment where all fitness levels can move with confidence and achieve real results.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="text-lime-500 font-black text-sm tracking-[0.3em]">02</span>
                <h3 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight">Our Vision</h3>
              </div>
              <p className="text-white/60 text-lg md:text-xl font-medium leading-relaxed border-l border-lime-500/30 pl-8">
                To be the leading community for structured fitness that inspires active living. We envision a world where effective workouts are accessible to everyone, driven by smart movement and consistent progress.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
