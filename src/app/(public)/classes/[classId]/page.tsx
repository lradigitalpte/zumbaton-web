"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { zumbaClasses, getClassBySlug, ZumbaClass } from "@/data/classes";
import { ClassesHero } from "@/components/Classes";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.classId as string;
  const classData = getClassBySlug(classId);

  if (!classData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-dark">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Class Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The class you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/classes" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-semibold transition-colors">
            ← Back to Classes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ClassesHero 
        title={classData.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Classes", href: "/classes" },
          { label: classData.name }
        ]}
      />
      <ClassDetailContent classData={classData} />
      <ClassDetailCTA />
    </>
  );
}

const ClassDetailContent = ({ classData }: { classData: ZumbaClass }) => {
  const contentRef = useRef(null);
  const isInView = useInView(contentRef, { once: true, margin: "-50px" });

  return (
    <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-dark">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar - Class List */}
          <div className="lg:w-1/4">
            <div className="sticky top-24">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                All Classes
              </h4>
              <div className="flex flex-col gap-2">
                {zumbaClasses.map((c) => (
                  <Link
                    key={c.id}
                    href={`/classes/${c.slug}`}
                    className={`block p-4 rounded-lg transition-all duration-300 border ${
                      c.slug === classData.slug
                        ? "bg-green-600 dark:bg-green-600 text-white border-green-700 dark:border-green-500"
                        : "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{c.name}</span>
                      {c.slug === classData.slug && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="lg:w-3/4"
          >
            {/* Main Image */}
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
              <Image
                src={classData.image}
                alt={classData.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 75vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              
              {/* Quick Stats Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-4">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                  <p className="font-bold text-gray-900 dark:text-white">{classData.duration}</p>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Intensity</span>
                  <p className="font-bold text-gray-900 dark:text-white">{classData.intensity}</p>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Calories</span>
                  <p className="font-bold text-gray-900 dark:text-white">{classData.calories}</p>
                </div>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 dark:border-gray-700/50">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Instructor</span>
                  <p className="font-bold text-gray-900 dark:text-white">{classData.instructor}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                About {classData.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                {classData.fullDescription}
              </p>
            </div>

            {/* Program Highlights */}
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Program Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classData.highlights.map((highlight, index) => (
                  <HighlightCard key={index} highlight={highlight} index={index} />
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Class Schedule
              </h2>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {classData.schedule.map((slot, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{slot.day}</p>
                        <p className="text-green-600 dark:text-green-500">{slot.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-2 text-green-600 dark:text-green-500 font-semibold hover:text-green-700 dark:hover:text-green-400 transition-colors"
                  >
                    View Full Schedule
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

interface HighlightCardProps {
  highlight: {
    title: string;
    description: string;
  };
  index: number;
}

const HighlightCard = ({ highlight, index }: HighlightCardProps) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="flex gap-4"
    >
      <div className="shrink-0">
        <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
          {highlight.title}
        </h4>
        <p className="text-gray-600 dark:text-gray-400">
          {highlight.description}
        </p>
      </div>
    </motion.div>
  );
};

const ClassDetailCTA = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section 
      ref={sectionRef}
      className="bg-green-600 dark:bg-green-700 py-12 md:py-16"
    >
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left"
          >
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Ready to try this class?
            </h3>
            <p className="text-white/80 text-lg">
              Sign up now and experience the Zumba difference!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-green-600 bg-white hover:bg-gray-100 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl group"
            >
              <span>Join Now</span>
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <Link
              href="/classes"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white border-2 border-white hover:bg-white hover:text-green-600 transition-all duration-300 rounded-lg"
            >
              <span>View All Classes</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
