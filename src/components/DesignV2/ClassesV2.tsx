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
    <section className="py-24 bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
          <div>
            <h2 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic leading-tight">Our <span className="text-lime-500">Classes</span></h2>
            <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 font-semibold">Find your rhythm and join the movement.</p>
          </div>
          <Link
            href="/schedule"
            className="group flex items-center gap-3 text-lime-500 hover:text-yellow-400 transition-colors text-lg font-black uppercase tracking-wider hover:gap-4 duration-300"
          >
            View Full Schedule <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classes.map((cls, index) => (
            <Link key={index} href={`/classes/${cls.slug}`} className="block h-full group">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-[2px] rounded-2xl bg-lime-500 dark:bg-lime-600 transition-all duration-500 h-full"
              >
                <div className="bg-gray-50 dark:bg-zinc-900 h-full rounded-[18px] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden transition-colors hover:bg-gray-100 dark:hover:bg-zinc-800">
                  <div className={`absolute top-0 right-0 w-24 h-1 ${cls.accent}`} />
                  
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black mb-4 text-gray-900 dark:text-white group-hover:text-lime-500 transition-colors duration-300 uppercase italic tracking-tight leading-tight">
                      {cls.title}
                    </h3>
                    <p className="text-gray-700 dark:text-zinc-400 leading-relaxed text-base md:text-lg group-hover:text-gray-800 dark:group-hover:text-zinc-300 transition-colors duration-300 font-medium">
                      {cls.description}
                    </p>
                  </div>

                    <div className="mt-12 pt-8 border-t border-gray-300 dark:border-zinc-800 flex justify-end items-center">
                    <span className="text-sm font-black text-lime-600 dark:text-lime-500 uppercase tracking-widest group-hover:text-yellow-500 transition-colors duration-300">
                      View Details
                    </span>
                    <div className="w-10 h-10 rounded-full bg-lime-500 dark:bg-lime-600 flex items-center justify-center group-hover:bg-yellow-400 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300 text-black">
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
