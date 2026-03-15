"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const MissionVision = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Parallax scroll tracking - fixed parallax effect
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  const headerRef = useRef(null);
  const missionRef = useRef(null);
  const visionRef = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-50px" });
  const missionInView = useInView(missionRef, { once: true, margin: "-50px" });
  const visionInView = useInView(visionRef, { once: true, margin: "-50px" });

  return (
    <section ref={sectionRef} className="relative py-20 md:py-28 lg:py-36 overflow-hidden">
      {/* Background Image with Parallax - using CSS background for better performance */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -top-[20%] -bottom-[20%] -z-10"
      >
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/images/image00059.jpeg')",
          }}
        />
        <div className="absolute inset-0 bg-black/75"></div>
      </motion.div>

      {/* Gradient edges like PowerFlow */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-gray-dark to-transparent z-[1]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-dark to-transparent z-[1]"></div>

      {/* Content */}
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Our Mission & Vision
          </h2>
        </motion.div>

        {/* Mission & Vision Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Mission Card */}
          <motion.div
            ref={missionRef}
            initial={{ opacity: 0, x: -50 }}
            animate={missionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-8 md:p-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white">Our Mission</h4>
            </div>
            <p className="text-white/90 leading-relaxed text-lg">
              Zumbaton exists to make fitness fun, inclusive, and empowering through high-energy dance-based workouts. 
              We aim to create a supportive community where people of all fitness levels can move with confidence, 
              improve their physical and mental well-being, and enjoy every step of their fitness journey.
            </p>
          </motion.div>

          {/* Vision Card */}
          <motion.div
            ref={visionRef}
            initial={{ opacity: 0, x: 50 }}
            animate={visionInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 md:p-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 h-full"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-lime-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-white">Our Vision</h4>
            </div>
            <p className="text-white/90 leading-relaxed text-lg">
              To become a leading dance-fitness community that inspires people to move freely, live actively, and embrace a healthier lifestyle 
              — not just as a workout, but as a way of life. Zumbaton envisions a world where fitness is joyful, accessible, 
              and driven by connection, rhythm, and self-expression.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
