"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import WhatsAppLeadModal from "@/components/WhatsApp/WhatsAppLeadModal";


const AboutSectionOne = () => {
  const experienceRef = useRef(null);
  const image1Ref = useRef(null);
  const image2Ref = useRef(null);
  const subtitleRef = useRef(null);
  const headingRef = useRef(null);
  const textRef = useRef(null);
  const buttonRef = useRef(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);

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
            {/* Value Card - Centered Overlay (fadeIn animation) */}
            <motion.div
              ref={experienceRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={experienceInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-4 sm:p-5 mt-2 sm:mt-3 bg-green-600 dark:bg-green-500 text-white rounded-lg sm:rounded-xl text-center shadow-2xl max-w-[140px] sm:max-w-[180px]"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={experienceInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-2xl sm:text-3xl mb-1 sm:mb-2 font-bold"
              >
                <motion.span
                  animate={experienceInView ? { 
                    scale: [1, 1.1, 1],
                  } : {}}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 1.2
                  }}
                  className="inline-block"
                >
                  Step It Up!
                </motion.span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={experienceInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="text-xs sm:text-sm leading-tight font-semibold"
              >
                Your Dance Journey Starts Here
              </motion.div>
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
                    src="/images/landing3.jpg"
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
                    src="/images/images/image2z.jpg"
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
              Your Pace. Your Dance. Your Zumbaton.
            </motion.h2>
            <motion.p
              ref={textRef}
              initial={{ opacity: 0 }}
              animate={textInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed"
            >
              No strict rules. No intimidating workouts. Just music, movement, and motivation. Find your Zumba vibe with us — beginner-friendly, feel-good classes for all. Join a community where dance comes first and fitness follows naturally. Every step is a celebration, every beat brings joy.
            </motion.p>
            <motion.div
              ref={buttonRef}
              initial={{ opacity: 0 }}
              animate={buttonInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <button
                onClick={() => setShowWhatsAppModal(true)}
                className="inline-block px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white uppercase bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-all duration-300 rounded-none"
              >
                <span>Join Now</span>
              </button>
            </motion.div>
          </div>
        </div>

        {/* Values Section - Replacing misleading stats with value statements */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
          <ValueCard 
            icon={
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            }
            title="All Fitness Levels" 
            description="Beginner to advanced welcome" 
            delay={0} 
          />
          <ValueCard 
            icon={
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            title="Inclusive Community" 
            description="Everyone belongs here" 
            delay={200} 
          />
          <ValueCard 
            icon={
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="Dance First" 
            description="Fitness follows naturally" 
            delay={400} 
          />
          <ValueCard 
            icon={
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            }
            title="Expert Instructors" 
            description="Certified & passionate" 
            delay={600} 
          />
        </div>
      </div>

      {/* WhatsApp Lead Modal */}
      <WhatsAppLeadModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
      />
    </section>
  );
};

// Value Card Component - Replaces stats with value statements
const ValueCard = ({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay: delay / 1000 }}
      className="text-center px-2 sm:px-0"
    >
      <div className="flex justify-center mb-2 sm:mb-3">{icon}</div>
      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2 text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </motion.div>
  );
};

export default AboutSectionOne;
