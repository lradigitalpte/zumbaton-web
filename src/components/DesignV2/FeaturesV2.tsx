"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    title: "Inclusive Community",
    description: "No judgment. Just pure energy and support.",
    image: "/images/image00059.jpeg",
    colSpan: "md:col-span-2",
  },
  {
    title: "Expert Coaches",
    description: "Learn from the best in the industry.",
    image: "/images/image00065.jpeg",
    colSpan: "md:col-span-1",
  },
  {
    title: "Any Fitness Level",
    description: "From beginner to pro, we have a spot for you.",
    image: "/images/hero/hero2.jpeg",
    colSpan: "md:col-span-1",
  },
  {
    title: "Fun First",
    description: "Workouts that feel like a party.",
    image: "/images/hero/notbad.jpeg",
    colSpan: "md:col-span-2",
  },
];

const FeaturesV2 = () => {
  return (
    <section className="py-16 sm:py-24 bg-[#f6f4ee] dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="mb-5 inline-flex rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              Why One Step Works
            </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase italic tracking-tighter leading-[0.95]"
          >
              More Than Just <span className="text-lime-500 block mt-2">Dance.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
              className="mt-4 sm:mt-6 text-base sm:text-lg md:text-2xl text-gray-600 dark:text-zinc-400 font-medium leading-relaxed"
          >
              We are building a movement where fitness meets happiness. Discover what makes One Step Fitness different.
          </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:max-w-sm"
          >
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
              <div className="text-2xl font-black text-lime-600 dark:text-lime-400">4</div>
              <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-zinc-400">Core programs</div>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
              <div className="text-2xl font-black text-lime-600 dark:text-lime-400">100%</div>
              <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-zinc-400">Community energy</div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className={`relative group overflow-hidden rounded-[24px] h-[280px] sm:h-[340px] md:h-[420px] border border-black/5 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${feature.colSpan}`}
            >
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute left-0 right-0 top-0 p-4 sm:p-8">
                <span className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
                  Signature Edge
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10">
                <h3 className="text-xl sm:text-3xl font-black mb-2 sm:mb-3 text-white group-hover:text-lime-300 transition-colors duration-300">{feature.title}</h3>
                <p className="max-w-md text-white/85 text-sm sm:text-lg leading-relaxed transform translate-y-3 opacity-100 sm:opacity-0 group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-500">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesV2;
