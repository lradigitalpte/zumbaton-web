"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const ScheduleHero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={sectionRef}
      className="relative h-[60vh] md:h-[70vh] lg:h-[75vh] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background Image */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        <div 
          className="absolute inset-0 w-full h-[120%] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero/hero2.jpeg')",
          }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </motion.div>

      {/* Content */}
      <motion.div 
        style={{ y: textY, opacity }}
        className="container relative z-10 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-4 md:mb-6">
            Find Zumba Class of Your Own
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 max-w-3xl mx-auto px-4">
            We have Zumba step class for everyone. Join now — this is the schedule.
          </p>
          
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-white/80">
            <Link href="/" className="hover:text-green-400 transition-colors">
              Home
            </Link>
            <span className="text-green-500">/</span>
            <span className="text-green-400">Schedule</span>
          </nav>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-dark to-transparent z-10"></div>
    </section>
  );
};

export default ScheduleHero;
