"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";

interface Instructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  specialties: string[];
}

const instructors: Instructor[] = [
  {
    id: "1",
    name: "Coach Lavs (Laavania)",
    role: "Dance Fitness Instructor",
    bio: "Coach Lavs (Laavania) leads an active, wellness-driven lifestyle and believes fitness should be fun, empowering, and sustainable. With a performance background from Mediacorp Vasantham, her journey as a dance fitness instructor stems from her love for dance, music, and helping people move with confidence. She creates high-energy yet welcoming classes where participants can sweat, smile, and feel good in their bodies.",
    image: "/images/coach-lavs.jfif",
    specialties: ["High Energy", "Dance Choreography", "Beginner Friendly"],
  },
  {
    id: "2",
    name: "Robert",
    role: "Certified Dance Fitness Instructor",
    bio: "Robert is a 30-year-old certified dance fitness instructor, registered both in Singapore and internationally. He has been part of the dance fitness community for over a year and has had the opportunity to teach in the Philippines.\n\nNow continuing his journey in Singapore, Robert invites you to join him at One Step Fitness. Don't be fooled by his size or appearance—dance fitness is his forte and a true passion. To him, dance fitness is more than just a workout; it's about self-expression, embracing who you are, and moving freely without judgment—from others or even yourself.\n\nWhat Robert loves most about dance fitness is the sense of freedom, joy, and community it creates, and he is excited to share that experience with others. Join him at One Step Fitness, take that step forward, and move together.",
    image: "/images/robert.jfif",
    specialties: ["Certified Professional", "Self-Expression", "Community Building"],
  },
];

const InstructorsTabs = () => {
  const [activeTab, setActiveTab] = useState(instructors[0].id);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const activeInstructor = instructors.find((i) => i.id === activeTab) || instructors[0];

  return (
    <section 
      ref={sectionRef} 
      className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden min-h-[800px]"
    >
      <div className="container px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <div className="text-lime-600 dark:text-lime-400 font-black text-sm md:text-base uppercase tracking-[0.3em] mb-6">
            Meet Our Team
          </div>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85]">
            OUR <br />
            <span className="text-lime-500 underline decoration-4 underline-offset-8">INSTRUCTORS</span>
          </h2>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 mb-16 border-b border-black/10 dark:border-white/10 pb-8">
          {instructors.map((instructor) => (
            <button
              key={instructor.id}
              onClick={() => setActiveTab(instructor.id)}
              className={`relative px-8 py-4 text-sm md:text-base font-black uppercase tracking-widest transition-all duration-300 rounded-none ${
                activeTab === instructor.id
                  ? "bg-black text-white dark:bg-lime-500 dark:text-black"
                  : "bg-white text-black hover:bg-lime-500/10 dark:bg-zinc-900 dark:text-white"
              }`}
            >
              {instructor.name}
              {activeTab === instructor.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute -bottom-8 left-0 w-full h-1 bg-lime-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Instructor "Page" View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start"
          >
            {/* Image Section - 5 Columns */}
            <div className="lg:col-span-5 relative group">
              <div className="relative aspect-[4/5] overflow-hidden border border-black/10 dark:border-white/10 bg-zinc-200 dark:bg-zinc-900">
                {activeInstructor.image ? (
                  <Image
                    src={activeInstructor.image}
                    alt={activeInstructor.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    unoptimized={true}
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-400 uppercase font-black tracking-widest">
                    Coming Soon
                  </div>
                )}
                
                {/* Sharp architectural lines overlay */}
                <div className="absolute inset-0 border-[15px] border-white/5 pointer-events-none z-10"></div>
                
                {/* Floating Name Tag */}
                <div className="absolute -bottom-6 -right-6 bg-lime-500 text-black px-10 py-6 font-black uppercase italic text-3xl md:text-5xl shadow-2xl z-20 hidden md:block">
                  {activeInstructor.name.split(' ')[0]}
                </div>
              </div>
            </div>

            {/* Content Section - 7 Columns */}
            <div className="lg:col-span-7 pt-4">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-[2px] bg-lime-500"></span>
                <span className="text-lime-600 dark:text-lime-400 font-black text-sm uppercase tracking-[0.3em]">
                  {activeInstructor.role}
                </span>
              </div>
              
              <h3 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-10 leading-none">
                {activeInstructor.name}
              </h3>
              
              <div className="space-y-6 mb-12">
                {activeInstructor.bio.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-gray-600 dark:text-zinc-400 text-lg md:text-xl leading-relaxed font-medium">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Specialties / Tags */}
              <div className="flex flex-wrap gap-4 border-t border-black/10 dark:border-white/10 pt-10">
                {activeInstructor.specialties.map((specialty, idx) => (
                  <div 
                    key={idx}
                    className="bg-black dark:bg-zinc-900 text-white dark:text-lime-500 px-6 py-3 text-xs font-black uppercase tracking-[0.2em] border border-black/10 dark:border-white/10"
                  >
                    {specialty}
                  </div>
                ))}
              </div>

              {/* CTA for this Instructor */}
              <div className="mt-12">
                <button className="bg-lime-500 text-black px-10 py-5 font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 shadow-xl">
                  Book a Class with {activeInstructor.name.split(' ')[0]}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-lime-500/5 -skew-x-12 -z-10 pointer-events-none"></div>
    </section>
  );
};

export default InstructorsTabs;
