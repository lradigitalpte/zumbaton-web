"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: "/images/hero/hero.jpeg",
    title: "Step Into",
    highlight: "The Rhythm",
    description: "High-energy sessions that hit different. Clear, structured, and pure energy.",
  },
  {
    id: 2,
    image: "/images/hero/hero2.jpeg",
    title: "Level Up",
    highlight: "Your Energy",
    description: "Join the tribe. No judgment, just consistent movement and a community that moves with you.",
  },
  {
    id: 3,
    image: "/images/hero/notbad.jpeg",
    title: "Experience",
    highlight: "Pure Joy",
    description: "Feel the momentum. Stronger every session with music that keeps you coming back.",
  },
];

const HeroV2 = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const active = slides[currentSlide];

  return (
    <section ref={containerRef} className="relative min-h-svh w-full overflow-hidden bg-black md:h-dvh">
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={active.image}
              alt={`${active.title} ${active.highlight}, One Step Fitness hero`}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/55" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative z-10 md:hidden">
        <div className="container mx-auto px-4 pb-10 pt-24">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.36, ease: "easeOut" }}
                className="w-full"
              >
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-lime-400">
                  One Step Fitness
                </p>

                <div className="border border-white/12 bg-black/30 p-4 backdrop-blur-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lime-300/90">
                    Real Energy. Real Progress.
                  </p>

                  <h1 className="mt-3 text-[2rem] font-black uppercase italic leading-[0.92] tracking-[-0.06em] text-white">
                    <span className="block text-white/95">{slides[currentSlide].title}</span>
                    <span className="block text-lime-400">{slides[currentSlide].highlight}</span>
                  </h1>

                  <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-white/80">
                    {slides[currentSlide].description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-semibold text-white/78">
                    <div className="border border-white/10 bg-white/6 px-3 py-2.5">Beginner friendly</div>
                    <div className="border border-white/10 bg-white/6 px-3 py-2.5">High-energy coaching</div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href="/trial-booking"
                      className="inline-flex items-center justify-center bg-lime-500 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-lime-400"
                    >
                      Book Trial
                    </Link>
                    <button
                      type="button"
                      onClick={openWhatsAppModal}
                      className="border border-white/18 bg-white/8 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/12"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.36 }}
              className="mt-5 flex items-center gap-3"
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 ${
                    currentSlide === index ? "h-2 w-10 bg-lime-400" : "h-2 w-2 bg-white/35 hover:bg-white/55"
                  }`}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-10 hidden md:flex md:h-full md:items-center">
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.36, ease: "easeOut" }}
              className="relative max-w-6xl"
            >
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.3em] text-lime-400">One Step Fitness</p>

              <h1 className="mb-6 max-w-5xl text-3xl font-black uppercase italic leading-[0.85] tracking-tighter text-white sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="block text-white/95">{slides[currentSlide].title}</span>
                <span className="block text-lime-400">{slides[currentSlide].highlight}</span>
              </h1>

              <div className="max-w-2xl border border-white/12 bg-black/20 p-6 backdrop-blur-md">
                <p className="text-base font-medium leading-relaxed text-white/82 sm:text-lg md:text-xl">
                  {slides[currentSlide].description}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold text-white/80">
                  <div className="border border-white/10 bg-white/6 px-3 py-2">All levels welcome</div>
                  <div className="border border-white/10 bg-white/6 px-3 py-2">Community-first coaching</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.36 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/trial-booking"
              className="group inline-flex items-center justify-center bg-lime-500 px-8 py-4 text-center text-lg font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-lime-400"
            >
              Book Trial
            </Link>
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="border border-white/18 bg-white/8 px-8 py-4 text-center text-lg font-black uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-colors hover:border-white/30 hover:bg-white/12"
            >
              WhatsApp
            </button>
            <Link
              href="/schedule"
              className="border border-white/18 bg-transparent px-8 py-4 text-center text-lg font-bold uppercase tracking-[0.2em] text-white transition-colors hover:border-lime-400 hover:text-lime-300"
            >
              Schedule
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.36 }}
            className="mt-10 flex items-center gap-3"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${
                  currentSlide === index ? "h-2 w-12 bg-lime-400" : "h-2 w-2 bg-white/35 hover:bg-white/55"
                }`}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.36 }}
        className="absolute bottom-10 right-10 hidden md:flex flex-col items-center gap-4"
      >
        <div className="translate-x-2 rotate-90 origin-right text-[11px] font-semibold uppercase tracking-[0.3em] text-white/55">
          Scroll
        </div>
        <div className="h-24 w-px bg-white/30" />
      </motion.div>
    </section>
  );
};

export default HeroV2;
