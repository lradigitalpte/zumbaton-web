"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

interface Instructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
  specialties: string[];
  certifications?: string[];
}

function instructorBookName(name: string): string {
  const paren = name.match(/\(([^)]+)\)/);
  if (paren) return paren[1];
  const parts = name.split(" ");
  if (parts[0].toLowerCase() === "coach" && parts[1]) return parts[1];
  return parts[0];
}

const instructors: Instructor[] = [
  {
    id: "1",
    name: "Coach Lavs (Laavania)",
    role: "Dance Fitness Instructor",
    bio: "Coach Lavs (Laavania) leads an active, wellness-driven lifestyle and believes fitness should be fun, empowering, and sustainable. With a performance background from Mediacorp Vasantham, her journey as a dance fitness instructor stems from her love for dance, music, and helping people move with confidence. She creates high-energy yet welcoming classes where participants can sweat, smile, and feel good in their bodies.",
    image: "/images/coach-lavs.jfif",
    specialties: ["Groove Stepper", "Lil Steppers", "One Familia"],
  },
  {
    id: "2",
    name: "Robert",
    role: "Certified Dance Fitness Instructor",
    bio: "Robert is a 30-year-old certified dance fitness instructor, registered both in Singapore and internationally. He has been part of the dance fitness community for over a year and has had the opportunity to teach in the Philippines.\n\nNow continuing his journey in Singapore, Robert invites you to join him at One Step Fitness. Don't be fooled by his size or appearance. Dance fitness is his forte and a true passion. To him, dance fitness is more than just a workout; it's about self-expression, embracing who you are, and moving freely without judgment from others or even yourself.\n\nWhat Robert loves most about dance fitness is the sense of freedom, joy, and community it creates, and he is excited to share that experience with others. Join him at One Step Fitness, take that step forward, and move together.",
    image: "/images/robert.jfif",
    specialties: ["Zumba Step", "Thunderbolt (Bodyweight & Steppers)"],
    certifications: ["/images/zumba.png"],
  },
  {
    id: "3",
    name: "Fizah",
    role: "Piloxing & Zumba Lift Instructor",
    bio: "Fizah leads Piloxing, an athletic blend of Pilates, boxing, and dance for cardio, core strength, and stress relief, and Zumba Lift, where Latin-inspired dance cardio meets structured resistance using bands and light weights.\n\nShe also coaches our Thunderbolt resistance format (bands-focused, no steppers), alongside our step-and-bodyweight Thunderbolt sessions. Her sessions are clear, challenging, and built so you leave feeling stronger, whether you are new to resistance work or ready to level up.",
    image: "/270cfec9-3815-422d-9a53-86de85420b99.jpeg",
    specialties: ["Piloxing", "Zumba Lift", "Thunderbolt (Resistance)"],
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
      className="relative min-h-[800px] overflow-x-clip bg-[#f6f4ee] py-20 dark:bg-black md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-[10%] top-0 h-full w-[55%] max-w-[min(520px,85vw)] bg-lime-500/5 -skew-x-12" />
      </div>

      <div className="container relative z-10 mx-auto max-w-full min-w-0 px-4 sm:px-6 lg:px-8">
        
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
        <div className="mb-16 flex flex-col gap-3 border-b border-black/10 pb-8 dark:border-white/10 sm:flex-row sm:flex-wrap sm:gap-4">
          {instructors.map((instructor) => (
            <button
              key={instructor.id}
              type="button"
              onClick={() => setActiveTab(instructor.id)}
              className={`relative max-w-full whitespace-normal rounded-none px-4 py-3 text-left text-xs font-black uppercase tracking-widest transition-all duration-300 sm:px-8 sm:py-4 sm:text-sm md:text-base ${
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
            className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-20"
          >
            {/* Image Section - 5 Columns */}
            <div className="relative min-w-0 group lg:col-span-5">
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
                  {instructorBookName(activeInstructor.name)}
                </div>
              </div>
            </div>

            {/* Content Section - 7 Columns */}
            <div className="min-w-0 pt-4 lg:col-span-7">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-12 h-[2px] bg-lime-500"></span>
                <span className="text-lime-600 dark:text-lime-400 font-black text-sm uppercase tracking-[0.3em]">
                  {activeInstructor.role}
                </span>
              </div>
              
              <h3 className="mb-10 break-words text-4xl font-black uppercase italic leading-none tracking-tighter text-gray-900 dark:text-white sm:text-5xl md:text-7xl">
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

              {/* Certifications */}
              {activeInstructor.certifications && activeInstructor.certifications.length > 0 && (
                <div className="mt-10 space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-600 dark:text-lime-400">
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-6">
                    {activeInstructor.certifications.map((cert, idx) => (
                      <div key={idx} className="relative w-32 h-32 border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 p-2 shadow-xl">
                        <Image
                          src={cert}
                          alt="Certification"
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA for this Instructor */}
              <div className="mt-12 max-w-full">
                <Link
                  href="/trial-booking"
                  className="inline-flex w-full max-w-full items-center justify-center whitespace-normal bg-lime-500 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-black shadow-xl transition-all duration-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black sm:w-auto sm:px-10 sm:py-5 sm:text-base"
                >
                  Book a Class with {instructorBookName(activeInstructor.name)}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default InstructorsTabs;
