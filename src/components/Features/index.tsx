"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
        <div className="container">
        {/* Header with animations */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="text-green-600 dark:text-green-500 font-semibold text-sm uppercase tracking-wide mb-3">
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            Why Choose Zumbaton?
          </h2>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience the perfect blend of fitness, fun, and community. Discover what makes Zumbaton the premier destination for dance fitness.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <SingleFeature feature={feature} />
            </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
};

export default Features;
