"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { Sparkles } from "lucide-react";

  const slides = [
    {
      id: 1,
      type: "image",
      image: "/images/landing2.png",
      headline: "Fun into Fitness with",
      highlight: "Zumbaton",
      description:
        "Not world-class training. No pushing beyond your limits. Fitness is a happy side effect! Move at your pace. Smile through every step.",
    },
    {
      id: 2,
      type: "image",
      image: "/images/images/vecteezy_ai-generated-hip-hop-dancing-class-advertisment-background_37246263.jpg",
      headline: "Dance First",
      highlight: "Fitness Follows",
      description:
        "No pressure, no stress. Not hardcore training. Just joyful movement with good energy. One Zumba step at a time, we're building a healthier, happier community.",
    },
    {
      id: 3,
      type: "image",
      image: "/images/images/hero3z.jpg",
      headline: "One Beat. One Step.",
      highlight: "One Happy You",
      description:
        "This is not about perfection. This is not about pushing harder. This is about moving, dancing, and feeling alive. Join a community transforming lives one Zumba step at a time.",
    },
  ];

const Hero = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [earlyBirdData, setEarlyBirdData] = useState<{ remaining: number; isAvailable: boolean } | null>(null);

  // Fetch early bird availability for CTA button
  useEffect(() => {
    const fetchEarlyBirdAvailability = async () => {
      try {
        const response = await fetch('/api/promos/availability');
        const result = await response.json();
        if (result.success) {
          setEarlyBirdData({
            remaining: result.data.remaining,
            isAvailable: result.data.isAvailable
          });
        }
      } catch (error) {
        console.error('Failed to fetch early bird availability:', error);
      }
    };
    fetchEarlyBirdAvailability();
  }, []);

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
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
              <div className="absolute inset-0 w-full h-full bg-gradient-to-t from-black/40 to-transparent" />
            </motion.div>
          ))}
        </div>


        {/* Content */}
        <div className="container relative z-10 pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16 lg:pb-32">
        <div className="max-w-4xl mx-auto text-center px-2 xs:px-3 sm:px-4 relative min-h-[350px] sm:min-h-[450px] md:min-h-[550px] lg:min-h-[600px]">
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
              className={`absolute inset-0 flex flex-col items-center justify-center px-2 xs:px-3 sm:px-4 ${
                currentSlide === index ? "pointer-events-auto" : "pointer-events-none"
              }`}
            >
              <h1 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-5 lg:mb-7 leading-tight px-1">
                {slide.headline}{" "}
                <span className="text-green-400 dark:text-green-500">{slide.highlight}</span>
              </h1>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl mb-2 sm:mb-3 md:mb-5 lg:mb-7 text-white/90 max-w-[95%] xs:max-w-[90%] sm:max-w-3xl mx-auto leading-relaxed break-words">
                {slide.description}
              </p>
              <p className="text-xs xs:text-sm sm:text-base md:text-lg font-bold text-green-400 dark:text-green-500 mb-5 sm:mb-7 md:mb-10 lg:mb-12 uppercase tracking-wider">
                Step it up!
              </p>
              {/* Early Bird CTA */}
              {earlyBirdData?.isAvailable && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-2 sm:mb-3 md:mb-4 w-full px-2"
                >
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-1 bg-gradient-to-r from-green-600 to-green-500 text-white px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-[10px] xs:text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-green-400 w-full sm:w-auto"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap">
                      Early Bird Special - Limited Time Offer!
                    </span>
                  </Link>
                </motion.div>
              )}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 justify-center items-center w-full max-w-md sm:max-w-none px-2">
                <Link
                  href="/trial-booking"
                  className="btn-hero-primary px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-2.5 md:px-8 md:py-3 lg:px-10 lg:py-3.5 text-xs xs:text-sm sm:text-base md:text-lg font-bold text-white uppercase bg-green-600 hover:bg-green-700 transition-colors rounded-none shadow-lg relative overflow-hidden inline-block w-full sm:w-auto text-center"
                >
                  <span className="relative z-10">Start Trial</span>
                </Link>
                <button
                  type="button"
                  onClick={openWhatsAppModal}
                  className="btn-hero-secondary px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-2.5 md:px-8 md:py-3 lg:px-10 lg:py-3.5 text-xs xs:text-sm sm:text-base md:text-lg font-bold text-white uppercase border-2 border-white/40 hover:border-white/60 hover:bg-white/10 transition-colors rounded-none shadow-lg relative overflow-hidden inline-block w-full sm:w-auto text-center"
                >
                  <span className="relative z-10">Contact Us</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        </div>
      </section>
  );
};

export default Hero;
