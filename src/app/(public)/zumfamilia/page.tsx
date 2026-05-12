"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Flame, Heart, Star, CheckCircle2 } from "lucide-react";
import { ClassesCTA } from "@/components/Classes";
import { zumFamiliaPackages } from "@/data/zumfamilia";
import { getClassBySlug } from "@/data/classes";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function ZumFamiliaPage() {
  const lilSteppers = getClassBySlug("lil-steppers");
  const heroRef = useRef(null);
  const lilSteppersRef = useRef(null);
  const pricingRef = useRef(null);
  const questionRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, amount: 0.2 });
  const lilSteppersInView = useInView(lilSteppersRef, { once: true, amount: 0.15 });
  const pricingInView = useInView(pricingRef, { once: true, amount: 0.15 });
  const questionInView = useInView(questionRef, { once: true, amount: 0.3 });

  return (
    <div className="bg-[#f6f4ee] dark:bg-black min-h-screen transition-colors duration-300">
      {/* EDITORIAL HERO SECTION */}
      <section 
        ref={heroRef}
        className="relative h-[80vh] md:h-[90vh] flex items-center overflow-hidden bg-black"
      >
        {/* Dual Image Background Layout */}
        <div className="absolute inset-0 -z-10 flex flex-col md:flex-row">
          <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden border-b md:border-b-0 md:border-r border-white/10">
            <Image 
              src="/images/hero/kids1.png"
              alt="Family Fitness Energy"
              fill
              className="object-cover scale-110 grayscale hover:grayscale-0 transition-all duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="relative w-full h-1/2 md:h-full md:w-1/2 overflow-hidden">
            <Image 
              src="/images/hero/kids.png"
              alt="Kids Dance Movement"
              fill
              className="object-cover scale-110 grayscale hover:grayscale-0 transition-all duration-1000"
              priority
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full border-[20px] border-white/5 pointer-events-none z-20"></div>
        </div>

        <div className="container relative z-30 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-lime-500 font-black text-sm md:text-base uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                <span className="w-12 h-[2px] bg-lime-500"></span>
                Family First Fitness
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black text-white uppercase italic tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl">
                KIDS & <br />
                <span className="text-lime-500">FAMILY</span>
              </h1>

              <div className="flex flex-col md:flex-row md:items-end gap-10">
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="#lil-steppers"
                    className="flex items-center gap-3 text-xs md:text-sm font-bold uppercase tracking-widest bg-lime-500 text-black px-8 py-4 self-start shadow-2xl hover:bg-white transition-colors"
                  >
                    Kids Classes
                  </Link>
                  <Link
                    href="#pricing"
                    className="flex items-center gap-3 text-xs md:text-sm font-bold uppercase tracking-widest bg-white text-black px-8 py-4 self-start shadow-2xl hover:bg-lime-500 transition-colors"
                  >
                    Family Packages
                  </Link>
                </div>
                
                <p className="max-w-md text-white font-bold text-sm md:text-base leading-relaxed border-l-4 border-lime-500 pl-8 uppercase tracking-wider">
                  Create unforgettable memories while getting fit! Specialized programs 
                  to keep children active and families bonded through rhythm.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-3 bg-lime-500 z-40"></div>
      </section>

      {/* LIL STEPPERS - EDITORIAL LAYOUT */}
      <section id="lil-steppers" ref={lilSteppersRef} className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden">
        <div className="container px-4 sm:px-6 lg:px-8">
          {lilSteppers && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              
              {/* Image Layout */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0">
                  <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={lilSteppersInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                    className="absolute inset-0 z-10 border border-black/10 dark:border-white/10"
                  >
                    <Image
                      src="/images/hero/kids.png"
                      alt="Lil Steppers"
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </motion.div>
                  <div className="absolute -top-6 -left-6 w-full h-full border-2 border-lime-500 -z-0 hidden md:block"></div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={lilSteppersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="absolute -bottom-10 -right-6 z-20 bg-black text-white p-8 md:p-10 rounded-none shadow-2xl max-w-[200px]"
                  >
                    <div className="text-4xl font-black text-lime-500 mb-2 italic tracking-tighter">RATED #1</div>
                    <div className="text-xs font-black uppercase tracking-[0.2em] leading-tight">
                      Kids Dance Fitness Program
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Content */}
              <div className="lg:col-span-6">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={lilSteppersInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="inline-block bg-lime-500 text-black px-4 py-1 text-xs font-black uppercase tracking-[0.3em] mb-8">
                    {lilSteppers.intensity}
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white leading-[0.9] uppercase italic tracking-tighter mb-8">
                    LIL <br />
                    <span className="text-lime-500 underline decoration-4 underline-offset-8">STEPPERS</span>
                  </h2>

                  <p className="text-base text-gray-600 dark:text-zinc-400 font-medium leading-relaxed mb-10 uppercase tracking-tight">
                    {lilSteppers.fullDescription}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border border-black/10 dark:border-white/10 mb-10">
                    <div className="p-8 border-b sm:border-b-0 sm:border-r border-black/10 dark:border-white/10 hover:bg-lime-500/5 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <Clock className="w-6 h-6 text-lime-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Duration</span>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tight uppercase">{lilSteppers.duration}</p>
                    </div>
                    <div className="p-8 hover:bg-lime-500/5 transition-colors">
                      <div className="flex items-center gap-4 mb-4">
                        <Flame className="w-6 h-6 text-lime-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-gray-400">Energy Burn</span>
                      </div>
                      <p className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tight uppercase">{lilSteppers.calories} cal</p>
                    </div>
                  </div>

                  <Link
                    href={`/classes/${lilSteppers.slug}`}
                    className="group relative inline-flex items-center gap-4 bg-black dark:bg-white text-white dark:text-black px-10 py-5 text-sm font-black uppercase tracking-[0.3em] transition-all hover:bg-lime-500 hover:text-black dark:hover:bg-lime-500 w-full sm:w-auto justify-center"
                  >
                    <span>View Schedule</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </Link>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ONE FAMILIA PRICING - BRUTALIST GRID */}
      <section id="pricing" ref={pricingRef} className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden border-t border-black/5 dark:border-white/5">
        <div className="container px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={pricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="mb-16 md:mb-24"
          >
            <div className="text-lime-600 dark:text-lime-400 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-6">
              Pricing Plans
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-8">
              ONE FAMILIA <br />
              <span className="text-lime-500">PACKAGES</span>
            </h2>
            <p className="max-w-2xl text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-medium uppercase tracking-tight">
              Flexible pricing for families of all sizes. Choose the package that fits your group and start your dance journey today.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-black/10 dark:border-white/10">
            {zumFamiliaPackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={pricingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative bg-white dark:bg-zinc-950 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 last:border-r-0 flex flex-col p-10 md:p-12 hover:bg-lime-500 transition-all duration-500"
              >
                <div className="mb-10">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-black transition-colors uppercase italic tracking-tight mb-6">
                    {pkg.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6 group-hover:text-black transition-colors">
                    <span className="text-5xl font-black text-gray-900 dark:text-white group-hover:text-black">
                      ${(pkg.priceCents / 100).toFixed(0)}
                    </span>
                    <span className="text-gray-500 dark:text-zinc-500 group-hover:text-black/50 font-black text-sm uppercase">/class</span>
                  </div>
                  <p className="text-gray-600 dark:text-zinc-400 group-hover:text-black/70 font-medium leading-relaxed uppercase tracking-tight text-sm">
                    {pkg.shortDescription}
                  </p>
                </div>

                <ul className="flex-1 space-y-4 mb-12">
                  {pkg.highlights.slice(0, 3).map((highlight, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-3 text-xs font-black uppercase tracking-widest text-gray-700 dark:text-zinc-300 group-hover:text-black transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-lime-500 group-hover:text-black shrink-0 mt-0.5" />
                      <span>{highlight.title}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/zumfamilia/${pkg.slug}`}
                  className="w-full py-5 text-center bg-black dark:bg-white text-white dark:text-black font-black group-hover:bg-white group-hover:text-black dark:group-hover:bg-black dark:group-hover:text-white transition-all uppercase tracking-[0.2em] text-xs"
                >
                  Select Package
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Quick Links - Editorial Style */}
          <motion.div 
            ref={questionRef}
            initial={{ opacity: 0, y: 10 }}
            animate={questionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="mt-24 md:mt-32 p-10 md:p-20 bg-lime-500 text-black flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1/3 h-full bg-black/5 -skew-x-12 translate-x-1/4"></div>
            
            <div className="text-center lg:text-left relative z-10 max-w-2xl">
              <h3 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter leading-[0.9]">
                QUESTIONS ABOUT <br />
                <span className="bg-black text-lime-500 px-4 py-1 inline-block">CLASSES?</span>
              </h3>
              <p className="text-black/70 text-lg md:text-xl font-bold uppercase tracking-tight">Our team is happy to help find the right fit for your family.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full lg:w-auto">
              <Link href="/contact" className="px-12 py-6 bg-black text-white font-black hover:bg-zinc-900 transition-all shadow-2xl uppercase tracking-[0.2em] text-sm text-center">Contact Us</Link>
              <Link href="/classes" className="px-12 py-6 bg-transparent border-2 border-black text-black font-black hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em] text-sm text-center">All Classes</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ClassesCTA />
    </div>
  );
}
