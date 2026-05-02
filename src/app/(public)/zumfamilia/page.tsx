"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Users, Sparkles, Clock, Flame, Heart, PlayCircle, Star, CheckCircle2 } from "lucide-react";
import { ClassesCTA } from "@/components/Classes";
import { zumFamiliaPackages } from "@/data/zumfamilia";
import { getClassBySlug } from "@/data/classes";
import { motion } from "framer-motion";

export default function ZumFamiliaPage() {
  const lilSteppers = getClassBySlug("lil-steppers");

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* SPLIT HERO SECTION */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 overflow-hidden bg-black">
        <div className="container relative z-10 mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Left Side: Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="w-full lg:w-1/2 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-lime-500 text-xs font-black uppercase tracking-widest mb-6">
                <Heart className="w-3.5 h-3.5" />
                Family First Fitness
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter uppercase italic">
                Kids & Family <br className="hidden md:block" />
                <span className="text-lime-500">Dance Fitness</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Create unforgettable memories while getting fit! Our specialized programs are designed to keep children active and families bonded through the power of rhythm.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  href="#lil-steppers"
                  className="px-8 py-4 bg-lime-500 hover:bg-yellow-400 text-black font-black rounded-xl transition-all hover:-translate-y-1 uppercase tracking-wider"
                >
                  Explore Kids Classes
                </Link>
                <Link
                  href="#pricing"
                  className="px-8 py-4 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white font-black rounded-xl transition-all uppercase tracking-wider"
                >
                  View Family Packages
                </Link>
              </div>
            </motion.div>

            {/* Right Side: Design/Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full lg:w-1/2 relative"
            >
              <div className="relative aspect-square md:aspect-video lg:aspect-square max-w-lg mx-auto">
                {/* Decorative Circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-dashed border-zinc-800 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border border-dashed border-zinc-900 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                
                {/* Main Hero Image */}
                <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-zinc-800 z-10">
                  <Image
                    src="/images/hero/kids1.png"
                    alt="Kids dancing"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Floating Elements */}
                <div 
                  className="absolute -top-6 -right-6 md:top-0 md:-right-10 bg-zinc-900 p-5 rounded-2xl shadow-2xl z-20 flex items-center gap-4 border border-zinc-800"
                >
                  <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-black shadow-lg">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Rated #1</p>
                    <p className="text-base font-black text-white uppercase italic">Kids Fitness</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LIL STEPPERS SECTION */}
      <section id="lil-steppers" className="py-20 md:py-32 bg-zinc-950">
        <div className="container mx-auto px-4 max-w-6xl">
          {lilSteppers && (
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border-2 border-zinc-800">
                  <div className="aspect-[4/3] relative">
                    <Image
                      src="/images/hero/kids.png"
                      alt="Lil Steppers"
                      fill
                      className="object-cover object-[50%_20%] group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <div className="absolute top-8 left-8">
                    <span className="px-6 py-2 bg-lime-500 text-black text-xs font-black rounded-full uppercase tracking-widest shadow-xl">
                      {lilSteppers.intensity}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="w-full lg:w-1/2"
              >
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tighter leading-tight">
                  Lil Steppers <br className="hidden sm:block" />
                  <span className="text-lime-500">Dance Fitness</span>
                </h2>
                <p className="text-lg text-zinc-400 mb-10 leading-relaxed font-medium">
                  {lilSteppers.fullDescription}
                </p>

                {/* MOBILE OPTIMIZED GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-lime-500 shrink-0">
                      <Clock className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Duration</p>
                      <p className="text-xl font-black text-white italic uppercase">{lilSteppers.duration}</p>
                    </div>
                  </div>
                  <div className="p-6 bg-zinc-900 rounded-3xl border border-zinc-800 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-yellow-400 shrink-0">
                      <Flame className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Energy Burn</p>
                      <p className="text-xl font-black text-white italic uppercase">{lilSteppers.calories} cal</p>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/classes/${lilSteppers.slug}`}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-white text-black font-black rounded-2xl hover:bg-lime-500 transition-all w-full sm:w-auto justify-center uppercase tracking-wider"
                >
                  View Full Schedule
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* ONE FAMILIA PRICING SECTION */}
      <section id="pricing" className="py-20 md:py-32 bg-black">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
          >
            <h2 className="text-4xl md:text-8xl font-black text-white mb-6 uppercase italic tracking-tighter leading-[0.9]">
              One Familia <span className="text-lime-500">Packages</span>
            </h2>
            <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">
              Flexible pricing for families of all sizes. Choose the package that fits your group and start your dance journey today.
            </p>
          </motion.div>

          {/* PRICING GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {zumFamiliaPackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex"
              >
                <div className="group relative w-full p-10 bg-zinc-900 rounded-[2.5rem] border-2 border-zinc-800 flex flex-col hover:border-lime-500 transition-all duration-500">
                  <div className="mb-8">
                    <h3 className="text-2xl font-black text-white mb-6 group-hover:text-lime-400 transition-colors uppercase italic tracking-tight">
                      {pkg.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-5xl font-black text-white">
                        ${(pkg.priceCents / 100).toFixed(0)}
                      </span>
                      <span className="text-zinc-500 font-black text-sm uppercase">/class</span>
                    </div>
                    <p className="text-base text-zinc-400 leading-relaxed font-medium">
                      {pkg.shortDescription}
                    </p>
                  </div>

                  <ul className="flex-1 space-y-5 mb-10">
                    {pkg.highlights.slice(0, 3).map((highlight, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-3 text-sm font-bold text-zinc-300">
                        <CheckCircle2 className="w-5 h-5 text-lime-500 shrink-0 mt-0.5" />
                        <span>{highlight.title}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/zumfamilia/${pkg.slug}`}
                    className="w-full py-5 text-center bg-zinc-800 border border-zinc-700 rounded-2xl text-white font-black hover:bg-lime-500 hover:text-black transition-all uppercase tracking-wider text-sm"
                  >
                    Select Package
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Links Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 md:mt-40 p-10 md:p-16 bg-lime-500 rounded-[3rem] text-black flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32" />
            
            <div className="text-center lg:text-left relative z-10">
              <h3 className="text-3xl md:text-5xl font-black mb-4 uppercase italic tracking-tighter leading-none">Questions about classes?</h3>
              <p className="text-black/70 text-lg font-bold">Our team is happy to help find the right fit for your family.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 relative z-10 w-full lg:w-auto">
              <Link href="/contact" className="px-10 py-5 bg-black text-white font-black rounded-2xl hover:bg-zinc-800 transition-all shadow-xl uppercase tracking-wider w-full sm:w-auto text-center">Contact Us</Link>
              <Link href="/classes" className="px-10 py-5 bg-transparent border-2 border-black text-black font-black rounded-2xl hover:bg-black hover:text-white transition-all uppercase tracking-wider w-full sm:w-auto text-center">All Classes</Link>
            </div>
          </motion.div>
        </div>
      </section>

      <ClassesCTA />
    </div>
  );
}
