"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const values = [
  {
    title: "Passion",
    description: "Every move and every success fuels our dedication to your fitness journey.",
  },
  {
    title: "Community",
    description: "A supportive environment where motivation thrives and members grow stronger together.",
  },
  {
    title: "Energy",
    description: "High-energy sessions with great music and smart movement to keep you focused.",
  },
  {
    title: "Excellence",
    description: "We provide high-quality instruction and structured routines for the best results.",
  },
];

const CoreValues = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-black relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-lime-500/5 -skew-x-12 translate-x-1/4"></div>

      <div className="container px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 md:mb-24 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl"
          >
            <div className="text-lime-500 font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-6">
              The DNA of One Step
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-[0.85]">
              OUR CORE <br />
              <span className="text-lime-500">VALUES</span>
            </h2>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="max-w-xs text-white/40 text-sm font-bold uppercase tracking-widest leading-relaxed border-l border-white/10 pl-6"
          >
            These principles guide every class, every instructor, and every member of our community.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-white/10">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group p-10 md:p-12 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 hover:bg-lime-500 transition-all duration-500"
            >
              <div className="text-lime-500 group-hover:text-black font-black text-4xl mb-8 transition-colors italic tracking-tighter">
                {String(index + 1).padStart(2, '0')}
              </div>
              <h3 className="text-2xl font-black text-white group-hover:text-black uppercase italic tracking-tight mb-6 transition-colors">
                {value.title}
              </h3>
              <p className="text-white/50 group-hover:text-black/70 font-medium leading-relaxed transition-colors">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreValues;
