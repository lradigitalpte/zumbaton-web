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
    description: "Step into a class that feels energizing, clear, and easy to follow.",
  },
  {
    id: 2,
    image: "/images/hero/hero2.jpeg",
    title: "Dance With",
    highlight: "Energy",
    description: "Train with a welcoming group that keeps the pace strong and motivating.",
  },
  {
    id: 3,
    image: "/images/hero/notbad.jpeg",
    title: "Live With",
    highlight: "Joy",
    description: "Feel stronger every session with music, structure, and real momentum.",
  },
];

const HeroV2 = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const [currentSlide, setCurrentSlide] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 160]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-svh w-full overflow-hidden bg-black md:h-dvh">
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
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="relative z-10 md:hidden">
        <div className="container mx-auto px-4 pb-10 pt-24">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -24, filter: "blur(10px)" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full"
              >
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
                  <span className="inline-block h-2 w-2 rounded-full bg-lime-400" />
                  One Step Fitness
                </div>

                <div className="rounded-[28px] border border-white/12 bg-black/30 p-4 backdrop-blur-md">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lime-300/90">
                    Adult step fitness
                  </p>

                  <h1 className="mt-3 text-[2rem] font-black uppercase italic leading-[0.92] tracking-[-0.06em] text-white">
                    <span className="block text-white/95">{slides[currentSlide].title}</span>
                    <span className="block text-lime-400">{slides[currentSlide].highlight}</span>
                  </h1>

                  <p className="mt-3 max-w-sm text-sm font-medium leading-6 text-white/80">
                    {slides[currentSlide].description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] font-semibold text-white/78">
                    <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-2.5">Beginner friendly</div>
                    <div className="rounded-xl border border-white/10 bg-white/6 px-3 py-2.5">High-energy coaching</div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Link
                      href="/trial-booking"
                      className="inline-flex items-center justify-center rounded-full bg-lime-500 px-4 py-3 text-center text-sm font-black text-black shadow-[0_12px_30px_rgba(132,204,22,0.25)] transition-all hover:bg-lime-400"
                    >
                      Book Trial
                    </Link>
                    <button
                      onClick={openWhatsAppModal}
                      className="rounded-full border border-white/18 bg-white/8 px-4 py-3 text-center text-sm font-black text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/12"
                    >
                      WhatsApp
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="mt-5 flex items-center gap-3"
            >
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  onClick={() => setCurrentSlide(index)}
                  className={`transition-all duration-300 ${currentSlide === index ? "h-2.5 w-10 rounded-full bg-lime-400" : "h-2.5 w-2.5 rounded-full bg-white/35 hover:bg-white/55"}`}
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
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -40, filter: "blur(10px)" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative max-w-6xl"
            >
              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
                <span className="inline-block h-2 w-2 rounded-full bg-lime-400" />
                One Step Fitness Singapore
              </div>

              <h1 className="mb-6 max-w-5xl text-7xl font-black uppercase italic leading-[0.9] tracking-[-0.06em] text-white md:text-8xl lg:text-[7rem]">
                <span className="block text-white/95">{slides[currentSlide].title}</span>
                <span className="block text-lime-400">{slides[currentSlide].highlight}</span>
              </h1>

              <div className="max-w-3xl rounded-4xl border border-white/12 bg-black/20 p-8 backdrop-blur-md">
                <p className="text-2xl font-medium leading-relaxed text-white/82">
                  {slides[currentSlide].description}
                </p>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm font-semibold text-white/80">
                  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">All levels welcome</div>
                  <div className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3">Community-first coaching</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              href="/trial-booking"
              className="group inline-flex items-center justify-center rounded-full bg-lime-500 px-8 py-4 text-center text-lg font-black text-black shadow-[0_12px_30px_rgba(132,204,22,0.25)] transition-all hover:scale-[1.02] hover:bg-lime-400 active:scale-[0.98]"
            >
              Book Trial
            </Link>
            <button
              onClick={openWhatsAppModal}
              className="rounded-full border border-white/18 bg-white/8 px-8 py-4 text-center text-lg font-black text-white backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/12"
            >
              WhatsApp
            </button>
            <Link
              href="/schedule"
              className="rounded-full border border-white/18 bg-transparent px-8 py-4 text-center text-lg font-bold text-white transition-all hover:border-lime-400 hover:text-lime-300"
            >
              Schedule
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="mt-10 flex items-center gap-3"
          >
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 ${currentSlide === index ? "h-2.5 w-12 rounded-full bg-lime-400" : "h-2.5 w-2.5 rounded-full bg-white/35 hover:bg-white/55"}`}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 right-10 hidden md:flex flex-col items-center gap-4"
      >
        <div className="text-[11px] font-semibold tracking-[0.25em] text-white/55 rotate-90 origin-right translate-x-2">SCROLL</div>
        <div className="h-24 w-px bg-white/30" />
      </motion.div>
    </section>
  );
};

export default HeroV2;
