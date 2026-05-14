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
    <section className="bg-[#f6f4ee] py-12 text-gray-900 dark:bg-black dark:text-white sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="mb-5 inline-flex border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                The Edge
              </span>
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.36, ease: "easeOut" }}
                className="text-3xl font-black uppercase italic leading-[0.85] tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl"
              >
                More Than Just <span className="mt-2 block text-lime-500">Movement.</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.36, delay: 0.08, ease: "easeOut" }}
                className="mt-4 text-base font-medium leading-relaxed text-gray-600 sm:mt-6 sm:text-lg md:text-xl dark:text-zinc-400"
              >
                We&apos;re building a movement where fitness meets happiness. No distractions, just smart movement and a community that has your back.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.36, delay: 0.12, ease: "easeOut" }}
              className="grid grid-cols-2 gap-3 sm:gap-4 md:max-w-sm"
            >
              <div className="border border-black/10 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-2xl font-black text-lime-600 dark:text-lime-400">5</div>
                <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-zinc-400">Structured Sessions</div>
              </div>
              <div className="border border-black/10 bg-white px-4 py-3.5 dark:border-white/10 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-2xl font-black text-lime-600 dark:text-lime-400">100%</div>
                <div className="mt-1 text-sm font-semibold text-gray-600 dark:text-zinc-400">Pure Energy</div>
              </div>
            </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.36, delay: index * 0.06, ease: "easeOut" }}
              className={`group relative h-[280px] overflow-hidden border border-black/10 sm:h-[340px] md:h-[420px] dark:border-white/10 ${feature.colSpan}`}
            >
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-[filter,transform] duration-300 md:grayscale md:group-hover:grayscale-0 md:group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/30 md:bg-black/40" />
              <div className="absolute left-0 right-0 top-0 p-4 sm:p-8">
                <span className="inline-flex border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-white/90">
                  Signature Edge
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-10">
                <h3 className="mb-2 text-xl font-black text-white transition-colors duration-300 group-hover:text-lime-300 sm:mb-3 sm:text-3xl">
                  {feature.title}
                </h3>
                <p className="max-w-md translate-y-0 text-sm leading-relaxed text-white/90 opacity-100 sm:text-lg sm:opacity-90 sm:transition-opacity sm:duration-300 sm:group-hover:opacity-100">
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
