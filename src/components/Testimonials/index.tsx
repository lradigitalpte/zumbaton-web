"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const testimonials = [
  {
    id: 1,
    quote: "I found a Zumba class that feels like my own! No pressure, just pure dance joy. I smile through every step.",
    author: "Anna L.",
    location: "Paris",
  },
  {
    id: 2,
    quote: "Dance first, fitness follows — that's exactly what I needed. The community here is transforming my life one Zumba step at a time.",
    author: "Michael H.",
    location: "Toronto",
  },
  {
    id: 3,
    quote: "Not hardcore training, just joyful movement with good energy. Every class leaves me feeling happy and alive.",
    author: "Nadia R.",
    location: "Dubai",
  },
  {
    id: 4,
    quote: "One beat, one step, one happy me! This is not about perfection — it's about moving, dancing, and feeling alive.",
    author: "Tom S.",
    location: "Los Angeles",
  },
  {
    id: 5,
    quote: "Beginner-friendly, feel-good classes for all. I move at my pace and love every moment. No stress, just fun!",
    author: "Elise K.",
    location: "Amsterdam",
  },
  {
    id: 6,
    quote: "Fitness is a happy side effect! I dance happy and get fit naturally. Not fitness pressure — fitness pleasure.",
    author: "David M.",
    location: "Singapore",
  },
];

const StarIcon = () => (
  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Background moves slower (parallax)
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative text-white py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/images/image00065.jpeg"
          alt="Zumba background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </motion.div>

      {/* Content */}
      <div className="container relative z-10 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="owl-carousel">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`transition-all duration-700 ${
                  currentIndex === index
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4 absolute inset-0"
                }`}
              >
                {currentIndex === index && (
                  <>
                    {/* Stars */}
                    <div className="flex justify-center gap-0.5 sm:gap-1 mb-4 sm:mb-6">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>

                    {/* Quote */}
                    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 leading-relaxed px-3 sm:px-0">
                      {testimonial.quote}
                    </h3>

                    {/* Author */}
                    <div className="text-sm sm:text-base md:text-lg text-white/80">
                      {testimonial.author}, {testimonial.location}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 sm:gap-2 mt-6 sm:mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? "w-6 sm:w-8 bg-green-500"
                    : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
          ))}
        </div>
      </div>
      </div>
    </section>
  );
};

export default Testimonials;
