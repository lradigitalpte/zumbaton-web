"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const classes = [
  {
    title: "Groove Stepper",
    description: "Step up your game with rhythmic cardio.",
    color: "from-purple-600 to-blue-600",
  },
  {
    title: "Zumbaton",
    description: "Our signature high-energy dance workout.",
    color: "from-green-600 to-emerald-600",
  },
  {
    title: "Zumbuddies",
    description: "Fun and movement for the little ones.",
    color: "from-orange-500 to-yellow-500",
  },
];

const ClassesV2 = () => {
  return (
    <section className="py-24 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-6xl font-bold mb-4">Our Classes</h2>
            <p className="text-gray-500 dark:text-gray-400 text-xl">Find your rhythm.</p>
          </div>
          <Link
            href="/schedule"
            className="flex items-center gap-2 text-green-600 dark:text-green-500 hover:text-green-500 dark:hover:text-green-400 transition-colors text-lg font-medium"
          >
            View Full Schedule <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {classes.map((cls, index) => (
            <Link key={index} href="/schedule" className="block h-full">
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-1 rounded-3xl bg-gray-200/80 dark:bg-gradient-to-br dark:from-white/10 dark:to-white/5 border border-gray-200 dark:border-transparent hover:border-green-400/50 dark:hover:from-green-500/50 dark:hover:to-emerald-500/50 transition-all duration-500 h-full block cursor-pointer"
              >
                <div className="bg-white dark:bg-zinc-900 h-full rounded-[22px] p-8 flex flex-col justify-between relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${cls.color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} />
                  
                  <div>
                    <h3 className="text-3xl font-bold mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {cls.title}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                      {cls.description}
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/10 flex justify-end items-center">
                    <span className="text-sm font-medium text-green-600 dark:text-green-400 group-hover:underline">
                      View schedule
                    </span>
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white dark:group-hover:text-black transition-all ml-3">
                      <ArrowRight className="w-5 h-5" />
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
