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
    <section className="py-24 bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-20 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black mb-8 uppercase italic tracking-tighter leading-tight"
          >
            More Than Just <span className="text-lime-500 block mt-2">Dance.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-zinc-400 max-w-3xl font-medium leading-relaxed"
          >
            We are building a movement where fitness meets happiness. Discover what makes One Step Fitness different.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.12 }}
              className={`relative group overflow-hidden rounded-2xl h-[420px] shadow-lg hover:shadow-2xl transition-shadow duration-300 ${feature.colSpan}`}
            >
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10">
                <h3 className="text-2xl sm:text-3xl font-black mb-3 text-white group-hover:text-lime-400 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-200 text-base sm:text-lg leading-relaxed transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
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
