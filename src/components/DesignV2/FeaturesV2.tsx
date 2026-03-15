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
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            More Than Just <span className="text-green-600 dark:text-green-500">Dance.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl"
          >
            We're building a movement where fitness meets happiness. Discover what makes Zumbaton different.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative group overflow-hidden rounded-3xl h-[400px] ${feature.colSpan}`}
            >
              <Image
                src={feature.image}
                alt={feature.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8">
                <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-200 dark:text-gray-300 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
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
