"use client";

import { Feature } from "@/types/feature";
import { motion } from "framer-motion";

const SingleFeature = ({ feature }: { feature: Feature }) => {
  const { icon, title, paragraph } = feature;
  
  return (
    <div className="w-full h-full group">
      <motion.div
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-dark border border-gray-200 dark:border-gray-700 rounded-xl p-8 h-full flex flex-col hover:shadow-xl hover:border-green-500 dark:hover:border-green-500 transition-all duration-300"
      >
        {/* Icon */}
        <div className="bg-green-600/10 dark:bg-green-500/10 text-green-600 dark:text-green-500 mb-6 flex h-16 w-16 items-center justify-center rounded-lg group-hover:bg-green-600 dark:group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
          <div className="text-3xl">{icon}</div>
        </div>

        {/* Title */}
        <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed flex-grow">
          {paragraph}
        </p>
      </motion.div>
    </div>
  );
};

export default SingleFeature;
