"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const slides = [
  {
    id: 1,
    image: "/images/hero/hero.jpeg",
    headline: "Fun into Fitness with",
    highlight: "Zumbaton",
    description:
      "Not world-class training. No pushing beyond your limits. Fitness is a happy side effect! Move at your pace. Smile through every step.",
  },
  {
    id: 2,
    image: "/images/hero/hero2.jpeg",
    headline: "Dance First",
    highlight: "Fitness Follows",
    description:
      "No pressure, no stress. Not hardcore training. Just joyful movement with good energy. One dance step at a time, we're building a healthier, happier community.",
  },
  {
    id: 3,
    image: "/images/hero/notbad.jpeg",
    headline: "One Beat. One Step.",
    highlight: "One Happy You",
    description:
      "This is not about perfection. This is not about pushing harder. This is about moving, dancing, and feeling alive. Join a community transforming lives one dance step at a time.",
  },
];

const Hero = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <section id="home" className="relative w-full h-[100dvh] overflow-hidden bg-black">
      {/* Background Slideshow */}
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Image */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
            />
            {/* Modern Gradient Overlay - Darker at bottom for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-end pb-24 sm:justify-center sm:pb-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
                  {slides[currentSlide].headline}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 block sm:inline mt-2 sm:mt-0">
                    {slides[currentSlide].highlight}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-8 leading-relaxed font-medium drop-shadow-md">
                  {slides[currentSlide].description}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                  <Link
                    href="/trial-booking"
                    className="group relative px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(22,163,74,0.4)] hover:shadow-[0_0_30px_rgba(22,163,74,0.6)] hover:-translate-y-1 w-full sm:w-auto text-center overflow-hidden"
                  >
                    <span className="relative z-10">Start Trial</span>
                    <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-green-400/20" />
                  </Link>
                  
                  <button
                    onClick={openWhatsAppModal}
                    className="group px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold text-lg rounded-full transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
                  >
                    Contact Us
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-2"
      >
        <span className="text-white/60 text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
      </motion.div>
    </section>
  );
};

export default Hero;
