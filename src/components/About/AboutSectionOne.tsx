"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

// CountUp hook for stats
const useCountUp = (end: number, duration: number = 3000) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView || hasAnimated) return;
    
    setHasAnimated(true);
    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(startValue + (end - startValue) * progress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animate();
  }, [isInView, end, duration, hasAnimated]);

  return { count, ref };
};

const AboutSectionOne = () => {
  const experienceRef = useRef(null);
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const headingRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);

  const experienceInView = useInView(experienceRef, { once: true, margin: "-50px" });
  const image1InView = useInView(image1Ref, { once: true, margin: "-50px" });
  const image2InView = useInView(image2Ref, { once: true, margin: "-50px" });
  const subtitleInView = useInView(subtitleRef, { once: true, margin: "-50px" });
  const headingInView = useInView(headingRef, { once: true, margin: "-50px" });
  const textInView = useInView(textRef, { once: true, margin: "-50px" });
  const buttonInView = useInView(buttonRef, { once: true, margin: "-50px" });

  return (
    <section className="relative z-20 -mt-16 sm:-mt-24 pt-16 sm:pt-24 py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark rounded-t-2xl sm:rounded-t-3xl shadow-xl">
      <div className="container px-3 sm:px-4">
        {/* Main About Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center mb-12 sm:mb-16 md:mb-20">
          {/* Left Side - Images with Experience Card */}
          <div className="relative">
            {/* Experience Card - Centered Overlay (fadeIn animation) */}
            <motion.div
              ref={experienceRef}
              initial={{ opacity: 0 }}
              animate={experienceInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3 sm:p-4 mt-2 sm:mt-3 bg-green-600 dark:bg-green-500 text-white rounded-lg sm:rounded-xl text-center shadow-2xl"
              >
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-0.5 sm:mb-1">5</h1>
              <div className="text-xs sm:text-base leading-tight">Years of Experience</div>
            </motion.div>

            {/* Image Grid - Full width images (matching PowerFlow w-100) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <motion.div
                ref={image1Ref}
                initial={{ opacity: 0, x: 50 }}
                animate={image1InView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative rounded-lg sm:rounded-xl overflow-hidden w-full"
              >
                <div className="relative w-full aspect-square">
                  <Image
                    src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200"
                    alt="Zumba class"
                    fill
                    className="object-cover w-full"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-green-600/50 to-transparent pointer-events-none"></div>
              </motion.div>
              <motion.div
                ref={image2Ref}
                initial={{ opacity: 0, x: 50 }}
                animate={image2InView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative rounded-lg sm:rounded-xl overflow-hidden w-full"
              >
                <div className="relative w-full aspect-square">
                <Image
                    src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1200"
                    alt="Zumba fitness"
                  fill
                    className="object-cover w-full"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
                <div className="absolute inset-0 bg-gradient-to-t from-lime-500/50 to-transparent pointer-events-none"></div>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="lg:pl-8 px-0">
            <motion.div
              ref={subtitleRef}
              initial={{ opacity: 0, y: 30 }}
              animate={subtitleInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0 }}
              className="text-green-600 dark:text-green-500 font-semibold text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3"
            >
              Welcome to Zumbaton
            </motion.div>
            <motion.h2
              ref={headingRef}
              initial={{ opacity: 0, y: 30 }}
              animate={headingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white leading-tight"
            >
              Push Beyond Limits And Unlock Your Strength
            </motion.h2>
            <motion.p
              ref={textRef}
              initial={{ opacity: 0 }}
              animate={textInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed"
            >
              Step into a fitness experience designed to challenge your body and sharpen your mind. With expert Zumba instructors, high-energy classes, and programs built for all levels, you'll gain the power, confidence, and results you've always wanted. Every dance moves you closer to becoming your strongest self.
            </motion.p>
            <motion.div
              ref={buttonRef}
              initial={{ opacity: 0 }}
              animate={buttonInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                href="/signup"
                className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white uppercase bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-all duration-300 rounded-none"
              >
                <span>Join Now</span>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Stats Section - Part of same section (matching PowerFlow) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
          <StatCard value={5000} label="Training Hours" delay={0} />
          <StatCard value={500} label="Active Members" delay={200} />
          <StatCard value={1000} label="Classes Taught" delay={400} />
          <StatCard value={20} label="Certified Instructors" delay={600} />
        </div>
      </div>
    </section>
  );
};

// Stat Card Component (matching PowerFlow de_count structure with fadeInRight)
const StatCard = ({ value, label, delay }: { value: number; label: string; delay: number }) => {
  const { count, ref } = useCountUp(value, 3000);
  const isInView = useInView(ref as React.RefObject<HTMLDivElement>, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial={{ opacity: 0, x: 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center px-2 sm:px-0"
    >
      <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-0.5 sm:mb-1 text-gray-900 dark:text-white">
        <span>{count.toLocaleString()}</span>
        <span className="text-green-600 dark:text-green-500">+</span>
      </h3>
      <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300">{label}</div>
    </motion.div>
  );
};

export default AboutSectionOne;
