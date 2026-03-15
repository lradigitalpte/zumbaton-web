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
    <section ref={sectionRef} className="relative py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/images/image00065.jpeg"
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
      <div className="container relative z-10 px-3 sm:px-4">
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="text-green-400 dark:text-green-500 font-semibold text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">
            Why Choose Us
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Community. Music. Movement.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-start lg:items-center">
          {/* Left Side - Images */}
          <div className="relative hidden lg:block">
            <motion.div
              ref={image1Ref}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={image1InView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-2xl overflow-hidden w-[90%]"
            >
              <div className="relative w-full aspect-[4/3]">
              <Image
                  src="/images/image00040.jpeg"
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
                  src="/images/image00065.jpeg"
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
              className="relative mb-6 sm:mb-8 pl-16 sm:pl-20"
            >
              <div className="absolute left-0 w-12 sm:w-16 h-12 sm:h-16 bg-green-600 dark:bg-green-500 text-white text-center text-2xl sm:text-3xl font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white">
                  Friendly, Supportive Instructors
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed">
                  Dance with instructors who make every class feel like your own. No certified pressure — just pure dance joy. Move at your pace, smile through every step.
                </p>
              </div>
            </motion.div>

            <motion.div
              ref={feature2Ref}
              initial={{ opacity: 0, y: 30 }}
              animate={feature2InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative mb-6 sm:mb-8 pl-16 sm:pl-20"
            >
              <div className="absolute left-0 w-12 sm:w-16 h-12 sm:h-16 bg-green-600 dark:bg-green-500 text-white text-center text-2xl sm:text-3xl font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white">
                  Feel-Good Classes for Everyone
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed">
                  Find a Zumba class that feels like your own. We have Zumba step classes for everyone. Not about pushing limits — just joyful movement with good energy.
                </p>
              </div>
            </motion.div>

            <motion.div
              ref={feature3Ref}
              initial={{ opacity: 0, y: 30 }}
              animate={feature3InView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative pl-16 sm:pl-20"
            >
              <div className="absolute left-0 w-12 sm:w-16 h-12 sm:h-16 bg-green-600 dark:bg-green-500 text-white text-center text-2xl sm:text-3xl font-bold rounded-lg flex items-center justify-center flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-white">
                  A Community That Transforms Lives
                </h4>
                <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed">
                  Join a vibrant community transforming lives one Zumba step at a time. Dance happy, get fit naturally. Not fitness pressure — fitness pleasure.
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
