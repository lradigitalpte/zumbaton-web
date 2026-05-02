"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: "/images/hero/hero.jpeg",
    title: "Move With",
    highlight: "Passion",
    description: "Fitness isn't a chore. It's a celebration of what your body can do.",
  },
  {
    id: 2,
    image: "/images/hero/hero2.jpeg",
    title: "Dance With",
    highlight: "Energy",
    description: "Join a community that lifts you up while you break a sweat.",
  },
  {
    id: 3,
    image: "/images/hero/notbad.jpeg",
    title: "Live With",
    highlight: "Joy",
    description: "Every beat is a new opportunity to feel alive.",
  },
];

const HeroV2 = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 200]); // Parallax effect

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Background Slides */}
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slides[currentSlide].image}
              alt="Hero Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/90" />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-32 sm:justify-center sm:pb-0 container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-lime-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute top-20 right-0 w-64 h-64 bg-yellow-400/10 rounded-full blur-[100px] pointer-events-none" />

              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-yellow-400 tracking-tighter leading-[0.9] mb-6 uppercase italic">
                {slides[currentSlide].title}
                <span className="block text-lime-500">
                  {slides[currentSlide].highlight}
                </span>
              </h1>
              <p className="text-lg sm:text-2xl text-zinc-400 max-w-xl font-bold leading-relaxed mb-10 border-l-4 border-lime-500 pl-6 drop-shadow-lg">
                {slides[currentSlide].description}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-wrap gap-3 sm:gap-4"
          >
            <Link
              href="/trial-booking"
              className="group relative px-6 py-3.5 sm:px-8 sm:py-4 bg-lime-500 text-black font-black text-base sm:text-lg rounded-full overflow-hidden transition-transform hover:scale-[1.02] active:scale-[0.98] w-full xs:w-auto text-center shadow-[0_0_20px_rgba(132,204,22,0.3)]"
            >
              <span className="relative z-10 group-hover:text-black transition-colors">Start Your Journey</span>
              <div className="absolute inset-0 bg-yellow-400 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            </Link>
            <button
              onClick={openWhatsAppModal}
              className="px-6 py-3.5 sm:px-8 sm:py-4 border-2 border-lime-500/50 text-white font-black text-base sm:text-lg rounded-full hover:bg-lime-500/10 backdrop-blur-sm transition-all hover:border-lime-500 w-full xs:w-auto text-center"
            >
              Contact Us
            </button>
            <Link
              href="/explore"
              className="px-6 py-3.5 sm:px-8 sm:py-4 border-2 border-white/20 text-white font-bold text-base sm:text-lg rounded-full hover:bg-white/10 backdrop-blur-sm transition-all hover:border-white w-full xs:w-auto text-center"
            >
              Home
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 right-10 hidden md:flex flex-col items-center gap-4"
      >
        <div className="text-xs font-mono text-white/50 rotate-90 origin-right translate-x-2">SCROLL</div>
        <div className="w-[1px] h-24 bg-gradient-to-b from-white/10 to-white/50" />
      </motion.div>
    </section>
  );
};

export default HeroV2;
