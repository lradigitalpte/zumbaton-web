"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

  const slides = [
    {
      id: 1,
      type: "image",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070",
      headline: "Fun into Fitness with",
      highlight: "Zumbaton",
      description:
        "Not world-class training. No pushing beyond your limits. Fitness is a happy side effect! Move at your pace. Smile through every step.",
    },
    {
      id: 2,
      type: "image",
      image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070",
      headline: "Dance First",
      highlight: "Fitness Follows",
      description:
        "No pressure, no stress. Not hardcore training. Just joyful movement with good energy. One Zumba step at a time, we're building a healthier, happier community.",
    },
    {
      id: 3,
      type: "image",
      image: "https://images.unsplash.com/photo-1534367507873-d2d7e24c797f?q=80&w=2070",
      headline: "One Beat. One Step.",
      highlight: "One Happy You",
      description:
        "This is not about perfection. This is not about pushing harder. This is about moving, dancing, and feeling alive. Join a community transforming lives one Zumba step at a time.",
    },
  ];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance slides with pause on hover
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Only start timer if not paused
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 8000); // 8 seconds - slower transition
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused]);

  const handleMouseEnter = () => {
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  return (
      <section
        id="home"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative text-white overflow-hidden min-h-screen sm:max-h-screen flex items-center bg-black"
      >
      {/* Background Images/Video with smooth crossfade - no white flash */}
        <div className="absolute inset-0 w-full h-full">
          {slides.map((slide, index) => (
            <motion.div
              key={`bg-${slide.id}`}
              initial={{ opacity: index === 0 ? 1 : 0 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0,
              }}
              transition={{ 
                opacity: { duration: 2, ease: "easeInOut" },
              }}
              className="absolute inset-0 w-full h-full bg-fixed-mobile md:bg-fixed overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  willChange: 'transform',
                }}
                initial={{ scale: 1 }}
                animate={{
                  scale: currentSlide === index ? [1, 1.2] : 1,
                }}
                transition={{
                  scale: {
                    duration: 8,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "reverse" as const,
                  },
                }}
              />
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
              <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="container relative z-10 py-8 sm:py-12 md:py-16 lg:py-32">
        <div className="max-w-4xl mx-auto text-center px-3 sm:px-4 relative min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[600px]">
          {slides.map((slide, index) => (
            <motion.div
              key={`content-${slide.id}`}
              initial={{ opacity: index === 0 ? 1 : 0, y: index === 0 ? 0 : 30 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0,
                y: currentSlide === index ? 0 : 30
              }}
              transition={{ 
                opacity: { duration: 1, delay: 0.3, ease: "easeOut" },
                y: { duration: 1, delay: 0.3, ease: "easeOut" }
              }}
              className={`absolute inset-0 flex flex-col items-center justify-center px-3 sm:px-4 ${
                currentSlide === index ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-5 md:mb-7 lg:mb-8 leading-tight">
                {slide.headline}{" "}
                <span className="text-green-400 dark:text-green-500">{slide.highlight}</span>
              </h1>
              <p className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl mb-3 sm:mb-5 md:mb-7 lg:mb-8 text-white/90 max-w-3xl mx-auto leading-relaxed">
                {slide.description}
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-green-400 dark:text-green-500 mb-5 sm:mb-7 md:mb-10 lg:mb-12 uppercase tracking-wider">
                Step it up!
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 justify-center items-center w-full max-w-md sm:max-w-none">
                <Link
                  href="/signup"
                  className="btn-hero-primary px-5 py-2 xs:px-6 xs:py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-xs xs:text-sm sm:text-base md:text-lg font-bold text-white uppercase bg-green-600 hover:bg-green-700 transition-colors rounded-none shadow-lg relative overflow-hidden inline-block w-full sm:w-auto text-center"
                >
                  <span className="relative z-10">Start Now</span>
                </Link>
                <Link
                  href="/about"
                  className="btn-hero-secondary px-5 py-2 xs:px-6 xs:py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-xs xs:text-sm sm:text-base md:text-lg font-bold text-white uppercase border-2 border-white/40 hover:border-white/60 hover:bg-white/10 transition-colors rounded-none shadow-lg relative overflow-hidden inline-block w-full sm:w-auto text-center"
                >
                  <span className="relative z-10">View More</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>
  );
};

export default Hero;
