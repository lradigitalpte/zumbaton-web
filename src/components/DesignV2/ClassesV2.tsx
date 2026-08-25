"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LightningRating } from "@/components/Common/LightningRating";
import { HorizontalScrollCarousel } from "@/components/Common/HorizontalScrollCarousel";
import { CLASS_ENERGY } from "@/data/classes";

const classes = [
  {
    title: "Groove Stepper Synchronized Dance",
    description: "Synchronized stepper choreography with Robert & Micky. Move as one.",
    accent: "bg-lime-500",
    slug: "groove-stepper",
  },
  {
    title: "Zumba Step",
    description: "High-energy step cardio that hits like a party. Pure energy.",
    accent: "bg-lime-400",
    slug: "zumba-step",
  },
  {
    title: "Thunderbolt · Bodyweight",
    description: "Tabata-style power on the step. Raw intensity with Coach Robert.",
    accent: "bg-lime-500",
    slug: "thunderbolt-bodyweight-steppers",
  },
  {
    title: "Thunderbolt · Resistance",
    description: "Bands and dance-led cardio. No steppers, just results with Coach Fizah.",
    accent: "bg-lime-400",
    slug: "thunderbolt-resistance-dance",
  },
  {
    title: "Piloxing",
    description: "HIIT fusion of Pilates, boxing, and dance. Find your power.",
    accent: "bg-lime-500",
    slug: "piloxing",
  },
];

const ClassesV2 = () => {
  return (
    <section className="overflow-hidden bg-white py-16 text-gray-900 dark:bg-black dark:text-white sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 border border-black/10 bg-[#f6f4ee] p-5 shadow-none dark:border-white/10 dark:bg-zinc-950 sm:p-8 md:mb-20 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="mb-5 inline-flex border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                The Lineup
              </span>
              <h2 className="mb-4 text-4xl font-black uppercase italic leading-[0.85] tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl">
                Zumba Step <span className="text-lime-500">& Studio.</span>
              </h2>
              <p className="text-base font-medium leading-relaxed text-zinc-600 sm:text-lg md:text-2xl dark:text-zinc-400">
                High-energy step, party energy, and structured conditioning. No fluff, just the best 1-hour sessions in town.
              </p>
            </div>

            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 md:w-auto">
              <div className="border border-black/10 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Sessions
                </div>
                <div className="mt-1 text-2xl font-black">5</div>
              </div>
              <div className="border border-black/10 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Intensity
                </div>
                <div className="mt-1 text-2xl font-black">High</div>
              </div>
            </div>
          </div>
          <Link
            href="/schedule"
            className="mt-8 inline-flex items-center gap-3 text-sm font-black uppercase tracking-[0.2em] text-lime-600 transition-colors hover:text-black dark:text-lime-400 dark:hover:text-white sm:text-base"
          >
            View Full Schedule <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <HorizontalScrollCarousel
          id="home-classes-carousel"
          gap={24}
          hint="Browse all sessions"
          trackClassName="flex gap-6 overflow-x-auto overflow-y-hidden px-1 pb-12 pt-3 scrollbar-hide snap-x snap-mandatory scroll-px-1"
          label={
            <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Featured sessions
            </p>
          }
        >
            {classes.map((cls, index) => (
              <div
                key={index}
                data-carousel-card
                className="w-[min(78vw,300px)] min-w-[260px] flex-shrink-0 snap-start sm:w-[300px] md:w-[320px] @min-[900px]:w-[calc((100cqw-4.5rem)/3.5)]"
              >
                <div className="group relative h-full border-2 border-black/10 bg-white transition-colors duration-300 hover:border-lime-500 dark:border-white/10 dark:bg-zinc-950 dark:hover:border-lime-500/60">
                  <Link
                    href={`/classes/${cls.slug}`}
                    className="absolute inset-0 z-[1]"
                    aria-label={`View details for ${cls.title}`}
                  />

                  <div className="pointer-events-none relative z-0 flex h-full flex-col justify-between p-8 sm:p-10">
                    <div>
                      <div
                        className={`mb-6 inline-flex px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-black sm:text-[11px] shadow-sm ${cls.accent}`}
                      >
                        Featured Class
                      </div>
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                        <h3 className="min-w-0 flex-1 text-2xl font-black uppercase italic leading-[0.9] tracking-tighter text-gray-900 transition-colors duration-300 group-hover:text-lime-500 dark:text-white sm:text-4xl">
                          {cls.title}
                        </h3>
                        <LightningRating filled={CLASS_ENERGY[cls.slug] ?? 4} size="md" className="shrink-0" />
                      </div>
                      <p className="line-clamp-3 text-base font-medium leading-relaxed text-gray-700 transition-colors duration-300 dark:text-zinc-400 sm:text-lg">
                        {cls.description}
                      </p>
                    </div>

                    <div className="mt-10 flex items-center justify-between border-t-2 border-black/5 pt-8 dark:border-white/5 sm:mt-12">
                      <div className="flex items-center gap-6">
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-lime-600 transition-colors duration-300 dark:text-lime-500 sm:text-sm">
                          View Details
                        </span>
                        <Link
                          href="/trial-booking"
                          className="pointer-events-auto relative z-[2] text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 transition-colors hover:text-lime-500"
                        >
                          Book Trial
                        </Link>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center border-2 border-black/10 bg-[#f6f4ee] text-gray-900 transition-all duration-300 group-hover:border-lime-500 group-hover:bg-lime-500 group-hover:text-black dark:border-white/10 dark:bg-zinc-900 dark:text-white dark:group-hover:border-lime-400 dark:group-hover:bg-lime-500 dark:group-hover:text-black">
                        <ArrowRight className="h-6 w-6 transform transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </HorizontalScrollCarousel>
      </div>
    </section>
  );
};

export default ClassesV2;
