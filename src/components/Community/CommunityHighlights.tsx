"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const highlights = [
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    title: "Effective Workout Routines",
    description: "Workouts designed for all fitness levels and stages.",
  },
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "For Every Fitness Level",
    description: "Workouts tailored to different people and their specific goals.",
  },
  {
    icon: (
      <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Results-Driven Training",
    description: "Structured routines that deliver real results through movement.",
  },
];

const CommunityHighlights = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative text-white py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden bg-black">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/image00059.jpeg"
          alt="Dance fitness community background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-3 sm:px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.32 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 uppercase italic tracking-tighter"
            >
              Structured Fitness for Everyone
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.32, delay: 0.05 }}
              className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
            >
              Effective workout routines for different levels and schedules.
            </motion.p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.32, delay: 0 }}
                className="bg-white/10 backdrop-blur-md rounded-none p-6 sm:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 sm:mb-6 text-lime-400">
                    {highlight.icon}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 uppercase italic tracking-tight">
                    {highlight.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/80 leading-relaxed">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.32, delay: 0.08 }}
            className="text-center mt-12 sm:mt-16"
          >
            <p className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">
              Ready to step it up?
            </p>
            <a
              href="/schedule"
              className="inline-block bg-lime-500 hover:bg-lime-400 text-black font-black px-8 py-4 rounded-none transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-lime-500/25 uppercase tracking-wider"
            >
              View Class Schedule
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CommunityHighlights;

