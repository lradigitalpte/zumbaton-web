"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const coaches = [
  { name: "Coach Lavs", image: "/images/coach-lavs.jfif" },
  { name: "Robert", image: "/images/robert.jfif" },
];

const InstructorsV2 = () => {
  return (
    <section className="py-24 bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Meet Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-600">
                Coaches.
              </span>
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
              No strict rules. Just music, movement, and motivation. Our coaches bring the energy and the vibes to every class — your pace, your dance, your Zumbaton.
            </p>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-4">
                {coaches.map((coach) => (
                  <div key={coach.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-800 relative overflow-hidden flex-shrink-0 ring-2 ring-white dark:ring-black shadow-lg">
                    <Image
                      src={coach.image}
                      alt={coach.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-bold">Coaches</span>
                <span className="text-sm text-gray-500">Certified & Passionate</span>
              </div>
            </div>
          </motion.div>

          <div className="relative h-[600px] w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="absolute inset-0 rounded-[40px] overflow-hidden shadow-xl"
            >
              <Image
                src="/images/hero/contact.jpeg"
                alt="Zumbaton class"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 bg-white/10 dark:bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-gray-200/50 dark:border-white/20">
                <h3 className="text-2xl font-bold text-white">Coach Lavs</h3>
                <p className="text-green-400">Head Instructor</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorsV2;
