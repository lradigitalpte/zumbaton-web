"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { zumbaClasses, getClassBySlug, ZumbaClass } from "@/data/classes";
import { ClassesHero } from "@/components/Classes";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { LightningRating } from "@/components/Common/LightningRating";

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
          { label: "Home", href: "/explore" },
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
    <section className="py-10 md:py-12 lg:py-16 bg-white dark:bg-gray-dark">
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
            {/* Main Image - Zumbuddies uses kids1, positioned so people (not walls) are in frame */}
            <div className="relative h-56 md:h-80 rounded-xl overflow-hidden mb-8 bg-gray-200 dark:bg-gray-700">
              <Image
                src={classData.slug === "lil-steppers" ? "/images/hero/kids1.png" : classData.image}
                alt={classData.name}
                fill
                className={classData.slug === "lil-steppers" ? "object-cover object-[50%_35%]" : "object-cover object-center"}
                sizes="(max-width: 1024px) 100vw, 75vw"
                priority
                unoptimized={classData.slug === "lil-steppers"}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              
              {/* Quick Stats Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-4">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-5 py-3 rounded-lg border border-white/20 dark:border-gray-700/50 flex items-center gap-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 block mb-1">
                      {classData.energy >= 4 ? "Difficulty" : "Intensity"}
                    </span>
                    <div className="flex items-center gap-3">
                      <LightningRating filled={classData.energy} size="md" />
                      <span className="font-black uppercase italic tracking-tighter text-gray-900 dark:text-white text-lg">
                        Level {classData.energy} / 5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About {classData.name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                {classData.fullDescription}
              </p>
            </div>

            {/* Program Highlights */}
            <div className="mb-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
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
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Class Schedule
              </h2>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <Link
                    href="/schedule"
                    className="inline-flex items-center gap-2 text-green-600 dark:text-green-500 font-semibold hover:text-green-700 dark:hover:text-green-400 transition-colors text-lg"
                  >
                    View Class Schedule
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Check our schedule page for availability and booking</p>
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
        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      className="bg-green-600 dark:bg-green-700 py-10 md:py-12"
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
                Sign up now and experience the dance fitness difference!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/trial-booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-green-600 bg-white hover:bg-gray-100 transition-all duration-300 rounded-lg shadow-lg hover:shadow-xl group"
            >
              <span>Book Trial Class</span>
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-bold text-white border-2 border-white hover:bg-white hover:text-green-600 transition-all duration-300 rounded-lg"
            >
              <span>WhatsApp Us</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
