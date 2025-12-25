"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

const PricingHero = () => {
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
      className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background Image */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        <div 
          className="absolute inset-0 w-full h-[130%] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070')",
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
            Pricing & Packages
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-6 max-w-3xl mx-auto px-4">
            Choose the perfect package that fits your schedule. Your pace. Your dance. Your Zumbaton.
          </p>
          
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-white/80">
            <Link href="/" className="hover:text-green-400 transition-colors">
              Home
            </Link>
            <span className="text-green-500">/</span>
            <span className="text-green-400">Pricing</span>
          </nav>
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-dark to-transparent z-10"></div>
    </section>
  );
};

export default PricingHero;

