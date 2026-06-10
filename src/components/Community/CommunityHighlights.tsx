"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const highlights = [
  {
    icon: (
      <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    title: "Effective Workout Routines",
    description: "Workouts designed for all fitness levels and stages.",
  },
  {
    icon: (
      <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "For Every Fitness Level",
    description: "Workouts tailored to different people and their specific goals.",
  },
  {
    icon: (
      <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-[#f6f4ee] py-12 text-gray-900 dark:bg-black dark:text-white sm:py-16 md:py-20 lg:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 hidden dark:block">
        <Image
          src="/images/image00059.jpeg"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center sm:mb-14">
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.3 }}
              className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-lime-600 dark:text-lime-400"
            >
              Why it works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.32 }}
              className="mb-4 text-3xl font-black uppercase italic tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Structured Fitness for Everyone
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.32, delay: 0.05 }}
              className="mx-auto max-w-2xl text-base text-gray-600 dark:text-white/85 sm:text-lg md:text-xl"
            >
              Effective workout routines for different levels and schedules.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
            {highlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.32, delay: index * 0.05 }}
                className="border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-lime-500/50 hover:shadow-lg dark:border-white/15 dark:bg-zinc-950 dark:hover:border-lime-500/60 sm:p-8"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 text-lime-600 dark:text-lime-400 sm:mb-6">
                    {highlight.icon}
                  </div>
                  <h3 className="mb-3 text-lg font-black uppercase italic tracking-tight sm:text-xl">
                    {highlight.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-300 sm:text-base">
                    {highlight.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.32, delay: 0.08 }}
            className="mt-10 text-center sm:mt-14"
          >
            <p className="mb-4 text-lg font-semibold sm:text-xl md:text-2xl">
              Ready to step it up?
            </p>
            <a
              href="/schedule"
              className="inline-block bg-lime-500 px-8 py-4 text-sm font-black uppercase tracking-wider text-black shadow-lg transition-all duration-300 hover:bg-lime-400 hover:shadow-lime-500/25 sm:text-base"
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
