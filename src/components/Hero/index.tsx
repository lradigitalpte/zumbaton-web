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
      "One step to change your life. Experience the joy of movement with high-energy dance fitness designed for everyone.",
  },
  {
    id: 2,
    image: "/images/hero/hero2.jpeg",
    headline: "Join the",
    highlight: "Energy",
    description:
      "Break a sweat with an encouraging community. Smart movement, great music, and real results one class at a time.",
  },
  {
    id: 3,
    image: "/images/hero/notbad.jpeg",
    headline: "Fitness Meets",
    highlight: "Happiness",
    description:
      "From Zumba Step to ThunderBolt workouts, every session is built to keep you energized, confident, and coming back for more.",
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
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">
                  {slides[currentSlide].headline}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 via-yellow-300 to-yellow-500 block sm:inline mt-2 sm:mt-0 uppercase italic">
                    {slides[currentSlide].highlight}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto mb-10 leading-relaxed font-bold drop-shadow-md">
                  {slides[currentSlide].description}
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto px-4 sm:px-0">
                  <Link
                    href="/trial-booking"
                    className="group relative px-10 py-5 bg-lime-500 hover:bg-lime-400 text-black font-black text-lg rounded-full transition-all duration-300 shadow-[0_10px_30px_rgba(132,204,22,0.4)] hover:shadow-[0_15px_40px_rgba(132,204,22,0.6)] hover:-translate-y-1 w-full sm:w-auto text-center overflow-hidden"
                  >
                    <span className="relative z-10">START YOUR JOURNEY</span>
                    <div className="absolute inset-0 h-full w-full scale-0 rounded-full transition-all duration-300 group-hover:scale-100 group-hover:bg-white/20" />
                  </Link>
                  
                  <button
                    onClick={openWhatsAppModal}
                    className="group px-10 py-5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-lg rounded-full transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto text-center"
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
        <div className="w-[2px] h-12 bg-gradient-to-b from-transparent via-lime-500 to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
