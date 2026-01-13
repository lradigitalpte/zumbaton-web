"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Instructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
}

// Instructor data
const instructors: Instructor[] = [
  {
    id: "1",
    name: "Coach Lavs (Laavania)",
    role: "Zumba Instructor",
    bio: "Coach Lavs (Laavania) leads an active, wellness-driven lifestyle and believes fitness should be fun, empowering, and sustainable. With a performance background from Mediacorp Vasantham, her journey as a Zumba instructor stems from her love for dance, music, and helping people move with confidence. She creates high-energy yet welcoming classes where participants can sweat, smile, and feel good in their bodies.",
    image: "/images/coach-lavs.jfif",
  },
  {
    id: "2",
    name: "Robert",
    role: "Certified Zumba Instructor",
    bio: "Hi everyone, my name is Robert. I'm 30 years old and a certified Zumba instructor, registered both in Singapore and internationally. I've been part of the Zumba community for over a year and have had the opportunity to teach in the Philippines. Now, I'm excited to continue this journey in Singapore and invite you to join me at Zumbaton. Don't be fooled by my size or how I look—Zumba is my forte and something I truly love. More than just dance, Zumba is about expressing yourself, being unapologetically you, and moving without judgment—whether from others or even yourself. What I love most about Zumba is the sense of freedom, joy, and community it brings, and I can't wait to share that experience with you. So come join us at Zumbaton, take that step forward, and let's move together. Peace ✌️",
    image: "/images/robert.jfif",
  },
];

const InstructorsTabs = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextInstructor = () => {
    setCurrentIndex((prev) => (prev + 1) % instructors.length);
  };

  const prevInstructor = () => {
    setCurrentIndex((prev) => (prev - 1 + instructors.length) % instructors.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="relative z-20 -mt-16 sm:-mt-24 pt-16 sm:pt-24 py-12 sm:py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark rounded-t-2xl sm:rounded-t-3xl shadow-xl">
      <div className="container px-3 sm:px-4">
        {/* Header */}
        <div className="flex flex-col items-center mb-12 sm:mb-16">
          <div className="text-green-600 dark:text-green-500 font-semibold text-sm uppercase tracking-wide mb-3">
            Meet Our Team
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Our Instructors
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-center">
            Our passionate instructors bring years of experience and infectious energy to every class
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Slider Wrapper */}
          <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 md:p-12 lg:p-16"
              >
                {/* Image Section */}
                <div className="relative h-64 sm:h-80 lg:h-full min-h-[400px] rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600">
                  {instructors[currentIndex].image ? (
                    <Image
                      src={instructors[currentIndex].image!}
                      alt={instructors[currentIndex].name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      unoptimized={true}
                      onError={(e) => {
                        console.error('Image load error:', instructors[currentIndex].image);
                        // Fallback to placeholder
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">?</span>
                        </div>
                        <p className="text-white/80 font-medium">Coming Soon</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>

                {/* Content Section */}
                <div className="flex flex-col justify-center">
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold rounded-full mb-5">
                      {instructors[currentIndex].role}
                    </span>
                    <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                      {instructors[currentIndex].name}
                    </h3>
                  </div>
                  
                  <div className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed">
                    {instructors[currentIndex].bio.split('\n\n').map((paragraph, idx) => (
                      paragraph.trim() && (
                        <p key={idx} className="mb-5 last:mb-0 text-justify">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {instructors.length > 1 && (
              <>
                <button
                  onClick={prevInstructor}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110"
                  aria-label="Previous instructor"
                >
                  <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>
                <button
                  onClick={nextInstructor}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:scale-110"
                  aria-label="Next instructor"
                >
                  <ChevronRight className="w-6 h-6 text-gray-900 dark:text-white" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {instructors.length > 1 && (
            <div className="flex justify-center gap-3 mt-8">
              {instructors.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? "w-10 h-3 bg-green-600 dark:bg-green-500"
                      : "w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                  aria-label={`Go to instructor ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InstructorsTabs;
