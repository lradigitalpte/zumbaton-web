"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const slides = [
  {
    id: 1,
    image: "/images/hero/hero.jpeg",
    headline: "Move with",
    highlight: "Passion",
    description:
      "Effective workout routines for all fitness levels. Experience smart movement with our high-energy classes.",
  },
  {
    id: 2,
    image: "/images/hero/hero2.jpeg",
    headline: "Join the",
    highlight: "Energy",
    description:
      "Join our community for effective workouts and real results. Routines designed for every fitness stage.",
  },
  {
    id: 3,
    image: "/images/hero/notbad.jpeg",
    headline: "Fitness Meets",
    highlight: "Happiness",
    description:
      "A variety of classes from Zumba Step to ThunderBolt. Effective workouts tailored to different people and goals.",
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
            {/* Modern Solid Overlay - Darker at top for menu visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/40 to-black/70" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center pt-32 sm:pt-40 lg:pt-48 pb-12">
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
                <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-4 md:mb-6 drop-shadow-2xl leading-[0.9]">
                  {slides[currentSlide].headline}{" "}
                  <span className="text-lime-400 block sm:inline mt-2 sm:mt-0 uppercase italic">
                    {slides[currentSlide].highlight}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-[10px] sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-6 md:mb-10 leading-relaxed font-bold drop-shadow-md uppercase tracking-wide">
                  {slides[currentSlide].description}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto px-10 sm:px-0">
                  <Link
                    href="/trial-booking"
                    className="group relative px-6 py-3 md:px-10 md:py-5 bg-lime-500 hover:bg-lime-400 text-black font-black text-sm md:text-lg rounded-none transition-all duration-300 shadow-[0_10px_30px_rgba(132,204,22,0.4)] hover:shadow-[0_15px_40px_rgba(132,204,22,0.6)] hover:-translate-y-1 w-full sm:w-auto text-center overflow-hidden"
                  >
                    <span className="relative z-10">START YOUR JOURNEY</span>
                    <div className="absolute inset-0 h-full w-full scale-0 rounded-none transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20" />
                  </Link>
                  
                  <button
                    onClick={openWhatsAppModal}
                    className="group px-6 py-3 md:px-10 md:py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-sm md:text-lg rounded-none transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
                  >
                    CONTACT US
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
        <span className="text-white/60 text-xs uppercase tracking-[0.3em] font-black">Scroll</span>
        <div className="w-[2px] h-12 bg-lime-500/50" />
      </motion.div>
    </section>
  );
};

export default Hero;
