"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

  const slides = [
    {
      id: 1,
    type: "image",
    image: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070",
    headline: "Transform Your Body with",
    highlight: "Zumbaton",
    description:
      "World-class Zumba training with expert instructors. Achieve your fitness goals through high-energy dance classes.",
    },
    {
      id: 2,
      type: "image",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070",
    headline: "Dance Your Way to",
    highlight: "Fitness & Fun",
    description:
      "Join our vibrant community. From beginners to pros, everyone is welcome to experience the joy of movement.",
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
      }, 5000); // 5 seconds
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
      {/* Background Images with smooth crossfade - no white flash */}
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
              className="absolute inset-0 w-full h-full bg-fixed-mobile md:bg-fixed"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                willChange: 'opacity',
                transform: 'translateZ(0)' // Force GPU acceleration
              }}
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
              <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          ))}
        </div>

        {/* Content */}
        <div className="container relative z-10 py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center px-4 relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
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
              className={`absolute inset-0 flex flex-col items-center justify-center ${
                currentSlide === index ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight px-4">
                {slide.headline}{" "}
                <span className="text-green-400 dark:text-green-500">{slide.highlight}</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center w-full px-4">
                <Link
                  href="/signup"
                  className="btn-hero-primary px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-sm sm:text-base md:text-lg font-bold text-white uppercase bg-green-600 rounded-none shadow-lg relative overflow-hidden inline-block w-full sm:w-auto text-center"
                >
                  <span className="relative z-10">Start Now</span>
                </Link>
                <Link
                  href="/about"
                  className="btn-hero-secondary px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-3.5 text-sm sm:text-base md:text-lg font-bold text-white uppercase border-2 border-white/40 rounded-none shadow-lg relative overflow-hidden inline-block w-full sm:w-auto text-center"
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
