"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const classes = [
  {
    title: "Groove Stepper",
    description: "Step up your game with rhythmic cardio.",
    accent: "bg-lime-500",
  },
  {
    title: "One Step Fitness",
    description: "Our signature high-energy dance workout.",
    accent: "bg-yellow-400",
  },
  {
    title: "Lil Steppers",
    description: "Fun and movement for the little ones.",
    accent: "bg-lime-400",
  },
];

const ClassesV2 = () => {
  return (
    <section className="py-24 bg-black text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic">Our Classes</h2>
            <p className="text-zinc-400 text-xl font-medium">Find your rhythm.</p>
          </div>
          <Link
            href="/schedule"
            className="flex items-center gap-2 text-lime-500 hover:text-yellow-400 transition-colors text-lg font-black uppercase tracking-wider"
          >
            View Full Schedule <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classes.map((cls, index) => (
            <Link key={index} href="/schedule" className="block h-full group">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative p-[1px] rounded-3xl bg-zinc-800 group-hover:bg-lime-500 transition-all duration-500 h-full"
              >
                <div className="bg-zinc-900 h-full rounded-[23px] p-10 flex flex-col justify-between relative overflow-hidden transition-colors group-hover:bg-zinc-800/50">
                  <div className={`absolute top-0 right-0 w-24 h-1 ${cls.accent}`} />
                  
                  <div>
                    <h3 className="text-3xl font-black mb-4 group-hover:text-lime-400 transition-colors uppercase italic tracking-tight">
                      {cls.title}
                    </h3>
                    <p className="text-zinc-400 leading-relaxed text-lg group-hover:text-zinc-200 transition-colors">
                      {cls.description}
                    </p>
                  </div>

                  <div className="mt-12 pt-8 border-t border-zinc-800 flex justify-end items-center">
                    <span className="text-sm font-black text-lime-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">
                      View schedule
                    </span>
                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-black transition-all ml-4">
                      <ArrowRight className="w-6 h-6" />
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
