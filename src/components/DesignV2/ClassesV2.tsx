"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const classes = [
  {
    title: "Groove Stepper",
    description: "Step up your game with rhythmic cardio.",
    accent: "bg-lime-500",
    slug: "groove-stepper",
  },
  {
    title: "Zumba Step",
    description: "Our signature high-energy dance workout.",
    accent: "bg-yellow-400",
    slug: "zumbaton",
  },
  {
    title: "ThunderBolt Full Body Workout",
    description: "High-intensity Tabata intervals for maximum burn.",
    accent: "bg-lime-400",
    slug: "thunderbolt-full-body-workout",
  },
];

const ClassesV2 = () => {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 md:mb-20 rounded-[28px] border border-gray-200 bg-[#fbfaf6] p-5 sm:p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="mb-5 inline-flex rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                Adult Programs
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-5 tracking-tighter uppercase italic leading-[0.95]">Our <span className="text-lime-500">Classes</span></h2>
              <p className="text-base sm:text-lg md:text-2xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">Structured step sessions, party-energy cardio, and powerful full-body conditioning for adults who want consistency with fun.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-4 w-full md:w-auto">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Formats</div>
                <div className="mt-1 text-2xl font-black">3</div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">Intensity</div>
                <div className="mt-1 text-2xl font-black">Mixed</div>
              </div>
            </div>
          </div>
          <Link
            href="/schedule"
            className="mt-8 inline-flex items-center gap-3 text-lime-600 dark:text-lime-400 hover:text-black dark:hover:text-white transition-colors text-sm sm:text-base font-black uppercase tracking-[0.2em]"
          >
            View Full Schedule <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {classes.map((cls, index) => (
            <Link key={index} href={`/classes/${cls.slug}`} className="block h-full group">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative h-full rounded-[28px] border border-gray-200 bg-white transition-all duration-500 hover:-translate-y-1 hover:border-lime-300 hover:shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-lime-500/40"
              >
                <div className="flex h-full flex-col justify-between p-5 sm:p-7 md:p-9">
                  <div>
                    <div className={`mb-5 inline-flex rounded-full px-3 py-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.24em] text-black ${cls.accent}`}>
                      Featured Class
                    </div>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-3 sm:mb-4 text-gray-900 dark:text-white group-hover:text-lime-500 transition-colors duration-300 uppercase italic tracking-tight leading-tight">
                      {cls.title}
                    </h3>
                    <p className="text-gray-700 dark:text-zinc-400 leading-relaxed text-sm sm:text-base md:text-lg transition-colors duration-300 font-medium">
                      {cls.description}
                    </p>
                  </div>

                  <div className="mt-8 sm:mt-12 flex items-center justify-between border-t border-gray-200 pt-5 sm:pt-6 dark:border-zinc-800">
                    <span className="text-xs sm:text-sm font-black text-lime-600 dark:text-lime-500 uppercase tracking-[0.16em] sm:tracking-[0.2em] transition-colors duration-300">
                      View Details
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 group-hover:border-lime-400 group-hover:bg-lime-500 group-hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:group-hover:border-lime-400 dark:group-hover:bg-lime-500 dark:group-hover:text-black">
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClassesV2;
