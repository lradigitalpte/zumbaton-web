"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRef } from "react";

const AboutSectionTwo = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-32 bg-[#f6f4ee] dark:bg-zinc-950 overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Side - Text Content */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.12 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-lime-600 dark:text-lime-400 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-6">
                Why Choose Us
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-12">
                COMMUNITY. <br />
                MUSIC. <br />
                <span className="text-lime-500">MOVEMENT.</span>
              </h2>

              <div className="space-y-5 sm:space-y-6">
                <FeatureItem 
                  number="01"
                  title="The Squad"
                  desc="The best in the game. Our coaches bring raw energy and expertise to every session, pushing you to your peak."
                />
                <FeatureItem 
                  number="02"
                  title="Sessions for All"
                  desc="From Zumba Step to Thunderbolt, we have a session for every stage. Pure movement, no judgment."
                />
                <FeatureItem 
                  number="03"
                  title="The Tribe"
                  desc="Join a community that hits different. We move together, progress together, and celebrate every win."
                />
              </div>
            </motion.div>
          </div>

          {/* Right Side - Visual Composition */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-square w-full max-w-2xl ml-auto">
              {/* Background Block */}
              <div className="absolute top-12 right-12 w-full h-full bg-lime-500/10 border border-lime-500/20"></div>
              
              {/* Top Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute top-0 left-0 w-[85%] aspect-[4/3] z-10 border-4 border-white dark:border-zinc-900 shadow-2xl overflow-hidden"
              >
                <Image
                  src="/images/image00040.jpeg"
                  alt="Training Session"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>

              {/* Overlapping Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.12 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute bottom-0 right-0 w-[60%] aspect-square z-20 border-4 border-lime-500 shadow-2xl overflow-hidden"
              >
                <Image
                  src="/images/image00065.jpeg"
                  alt="Personal Coaching"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />
              </motion.div>

              {/* Vertical Text */}
              <div className="absolute -left-12 top-1/2 -rotate-90 origin-center hidden xl:block">
                <span className="text-6xl font-black text-black/5 dark:text-white/5 uppercase tracking-[0.5em] whitespace-nowrap">
                  ONE STEP FITNESS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureItem = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="group flex gap-6 border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900 sm:gap-8 sm:p-6">
    <div className="text-lime-500 font-black text-2xl italic tracking-tighter shrink-0">{number}</div>
    <div>
      <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-3">
        {title}
      </h4>
      <p className="text-gray-600 dark:text-zinc-400 font-medium leading-relaxed">
        {desc}
      </p>
    </div>
  </div>
);

export default AboutSectionTwo;
