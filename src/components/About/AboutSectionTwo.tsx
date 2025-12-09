"use client";

import Image from "next/image";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const AboutSectionTwo = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  // Parallax scroll tracking - background moves slower
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Background image moves slower (parallax effect)
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const headerRef = useRef(null);
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const feature1Ref = useRef(null);
  const feature2Ref = useRef(null);
  const feature3Ref = useRef(null);

  const headerInView = useInView(headerRef, { once: true, margin: "-50px" });
  const image1InView = useInView(image1Ref, { once: true, margin: "-50px" });
  const image2InView = useInView(image2Ref, { once: true, margin: "-50px" });
  const feature1InView = useInView(feature1Ref, { once: true, margin: "-50px" });
  const feature2InView = useInView(feature2Ref, { once: true, margin: "-50px" });
  const feature3InView = useInView(feature3Ref, { once: true, margin: "-50px" });

  return (
    <section ref={sectionRef} className="relative py-16 md:py-20 lg:py-28 overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070"
          alt="Zumba background"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </motion.div>

      {/* Content */}
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <div className="text-green-400 dark:text-green-500 font-semibold text-sm uppercase tracking-wide mb-3">
            Why Choose Us
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Build Strength, Endurance, and Confidence with Us
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Images */}
          <div className="relative">
            <motion.div
              ref={image1Ref}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={image1InView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden w-[90%]"
            >
              <div className="relative w-full aspect-[4/3]">
              <Image
                  src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200"
                  alt="Zumba Training Session"
                fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-green-600/60 to-transparent pointer-events-none"></div>
            </motion.div>

            <motion.div
              ref={image2Ref}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={image2InView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute right-0 bottom-0 w-[50%] -mb-12 z-10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="relative w-full aspect-square">
              <Image
                  src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800"
                  alt="Personal Coaching Session"
                fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
              <div className="absolute inset-0 bg-gradient-to-t from-lime-500/60 to-transparent pointer-events-none"></div>
            </motion.div>
          </div>

          {/* Right Side - Numbered Features */}
          <div>
            <motion.div
              ref={feature1Ref}
              initial={{ opacity: 0, y: 30 }}
              animate={feature1InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mb-8 pl-20"
            >
              <div className="absolute left-0 w-16 h-16 bg-green-600 dark:bg-green-500 text-white text-center text-3xl font-bold rounded-lg flex items-center justify-center">
                1
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-3 text-white">
                  Certified Zumba Instructors
                </h4>
                <p className="text-white/90 leading-relaxed">
                  Train with professionals who guide your every move — ensuring proper form, safety, and faster results for your fitness goals.
                </p>
              </div>
            </motion.div>

            <motion.div
              ref={feature2Ref}
              initial={{ opacity: 0, y: 30 }}
              animate={feature2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative mb-8 pl-20"
            >
              <div className="absolute left-0 w-16 h-16 bg-green-600 dark:bg-green-500 text-white text-center text-3xl font-bold rounded-lg flex items-center justify-center">
                2
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-3 text-white">
                  High-Energy Classes
                </h4>
                <p className="text-white/90 leading-relaxed">
                  Experience dynamic Zumba classes that combine Latin rhythms with easy-to-follow dance moves, making every workout effective, fun, and challenging.
                </p>
              </div>
            </motion.div>

            <motion.div
              ref={feature3Ref}
              initial={{ opacity: 0, y: 30 }}
              animate={feature3InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative pl-20"
            >
              <div className="absolute left-0 w-16 h-16 bg-green-600 dark:bg-green-500 text-white text-center text-3xl font-bold rounded-lg flex items-center justify-center">
                3
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-3 text-white">
                  Motivating Environment
                </h4>
                <p className="text-white/90 leading-relaxed">
                  Join a supportive community that inspires you to stay consistent, push your limits, and celebrate every milestone along the way.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSectionTwo;
