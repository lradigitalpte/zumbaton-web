"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Clock, Flame, ArrowRight, ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { zumbaClasses, getClassBySlug, ZumbaClass, CLASS_ENERGY } from "@/data/classes";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { LightningRating } from "@/components/Common/LightningRating";
import { highlightCoachInText } from "@/lib/highlightCoachInText";

const NAV_EXCLUDED = new Set(["zumbuddies"]);

export default function ClassDetailPage() {
  const params = useParams();
  const classId = params.classId as string;
  const classData = getClassBySlug(classId);

  if (!classData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f4ee] dark:bg-black">
        <div className="border border-black/10 bg-white p-10 text-center dark:border-white/10 dark:bg-zinc-950">
          <h1 className="mb-4 text-4xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
            Class Not Found
          </h1>
          <Link
            href="/classes"
            className="text-sm font-black uppercase tracking-widest text-lime-600 dark:text-lime-400"
          >
            ← All classes
          </Link>
        </div>
      </div>
    );
  }

  const imageSrc =
    classData.slug === "lil-steppers" ? "/images/hero/kids1.png" : classData.image;
  const detailImages =
    classData.galleryImages && classData.galleryImages.length > 0
      ? classData.galleryImages
      : [imageSrc];
  const imageFit = classData.imageObjectFit ?? "cover";
  const energy = CLASS_ENERGY[classData.slug] ?? classData.energy;
  const navClasses = zumbaClasses.filter((c) => !NAV_EXCLUDED.has(c.slug));
  const allParagraphs = classData.fullDescription.split(/\n\n+/).filter(Boolean);
  const lastPara = allParagraphs[allParagraphs.length - 1];
  const tagline =
    allParagraphs.length > 1 && lastPara.length <= 64 && !lastPara.includes("Coach")
      ? lastPara
      : null;
  const aboutParagraphs = tagline ? allParagraphs.slice(0, -1) : allParagraphs;
  const titleParts = classData.name.includes(" ")
    ? { lead: classData.name.split(" ")[0], rest: classData.name.split(" ").slice(1).join(" ") }
    : { lead: classData.name, rest: "" };

  return (
    <>
      <section className="bg-[#f6f4ee] pt-24 dark:bg-black sm:pt-28">
        <div className="container px-4 sm:px-6 lg:px-8">
          <Link
            href="/classes"
            className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.25em] text-zinc-600 transition-colors hover:text-lime-600 dark:text-zinc-400 dark:hover:text-lime-400"
          >
            <ChevronLeft className="h-4 w-4" />
            All classes
          </Link>

          <div className="overflow-hidden border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
            <div className="grid lg:grid-cols-2 lg:min-h-[min(78vh,680px)]">
              <ClassDetailGallery
                images={detailImages}
                alt={classData.name}
                imageFit={imageFit}
              />

              <div className="flex flex-col justify-center border-t border-black/10 p-8 dark:border-white/10 sm:p-10 lg:border-l lg:border-t-0 lg:p-12 xl:p-14">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-lime-600 dark:text-lime-400">
                  {classData.instructor}
                </p>
                <h1 className="mb-5 text-4xl font-black uppercase italic leading-[0.9] tracking-tighter text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                  {titleParts.rest ? (
                    <>
                      {titleParts.lead}{" "}
                      <span className="text-lime-600 dark:text-lime-400">{titleParts.rest}</span>
                    </>
                  ) : (
                    titleParts.lead
                  )}
                </h1>
                <p className="mb-8 max-w-lg text-base leading-relaxed text-zinc-600 dark:text-zinc-300">
                  {highlightCoachInText(classData.shortDescription)}
                </p>

                <div className="mb-8 flex flex-wrap gap-2">
                  <MetaChip>{classData.intensity}</MetaChip>
                  <MetaChip icon={<Clock className="h-3.5 w-3.5" />}>{classData.duration}</MetaChip>
                  <MetaChip icon={<Flame className="h-3.5 w-3.5" />}>{classData.calories} cal</MetaChip>
                  <MetaChip>
                    <LightningRating filled={energy} size="sm" />
                    <span className="ml-1.5">{energy}/5</span>
                  </MetaChip>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/trial-booking"
                    className="inline-flex items-center justify-center gap-2 bg-lime-500 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    Book trial
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/schedule"
                    className="inline-flex items-center justify-center gap-2 border-2 border-black px-6 py-3.5 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    View schedule
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mt-8 px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navClasses.map((c) => (
              <Link
                key={c.id}
                href={`/classes/${c.slug}`}
                className={`shrink-0 whitespace-nowrap px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                  c.slug === classData.slug
                    ? "bg-black text-white dark:bg-lime-500 dark:text-black"
                    : "bg-white text-gray-800 hover:bg-lime-500 hover:text-black dark:bg-zinc-900 dark:text-white"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ClassDetailBody classData={classData} aboutParagraphs={aboutParagraphs} tagline={tagline} />
      <ClassDetailCTA />
    </>
  );
}

function ClassDetailGallery({
  images,
  alt,
  imageFit,
}: {
  images: string[];
  alt: string;
  imageFit: "cover" | "contain";
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = images.length;
  const safeIndex = count > 0 ? activeIndex % count : 0;
  const objectClass =
    imageFit === "contain"
      ? "object-contain object-center p-3 sm:p-5 lg:p-6"
      : "object-cover object-center";

  const goPrev = () => setActiveIndex((i) => (i - 1 + count) % count);
  const goNext = () => setActiveIndex((i) => (i + 1) % count);

  if (count === 0) return null;

  return (
    <div className="relative min-h-[52vh] bg-[#ebe8e0] dark:bg-zinc-900 sm:min-h-[56vh] lg:min-h-0">
      <Image
        key={images[safeIndex]}
        src={images[safeIndex]}
        alt={safeIndex === 0 ? alt : `${alt} — photo ${safeIndex + 1}`}
        fill
        priority={safeIndex === 0}
        className={objectClass}
        sizes="(max-width: 1024px) 100vw, 50vw"
      />

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-black/10 bg-white/95 text-black shadow-md transition-colors hover:bg-lime-500 dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-lime-500 dark:hover:text-black sm:left-4"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center border border-black/10 bg-white/95 text-black shadow-md transition-colors hover:bg-lime-500 dark:border-white/20 dark:bg-black/80 dark:text-white dark:hover:bg-lime-500 dark:hover:text-black sm:right-4"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {images.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={() => setActiveIndex(i)}
                className={`h-2.5 transition-all ${
                  i === safeIndex ? "w-8 bg-lime-500" : "w-2.5 bg-black/30 dark:bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function MetaChip({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-black/10 bg-[#f6f4ee] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-gray-900 dark:border-white/10 dark:bg-zinc-900 dark:text-white">
      {icon}
      {children}
    </span>
  );
}

function ClassDetailBody({
  classData,
  aboutParagraphs,
  tagline,
}: {
  classData: ZumbaClass;
  aboutParagraphs: string[];
  tagline: string | null;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <section ref={ref} className="bg-[#f6f4ee] py-14 dark:bg-black md:py-20">
      <div className="container px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-5xl space-y-10 md:space-y-12"
        >
          <div className="border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
            <div className="border-b border-black/10 px-6 py-5 dark:border-white/10 md:px-10 md:py-6">
              <SectionLabel>About the class</SectionLabel>
              <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white md:text-3xl">
                {classData.name}
              </h2>
            </div>
            <div className="space-y-5 px-6 py-8 text-base leading-relaxed text-zinc-700 dark:text-zinc-300 md:px-10 md:py-10 md:text-lg">
              {aboutParagraphs.map((para, i) => (
                <p key={i}>{highlightCoachInText(para)}</p>
              ))}
            </div>
            {tagline ? (
              <div className="border-t border-lime-500 bg-black px-6 py-8 text-center md:px-10 md:py-10">
                <p className="text-lg font-black uppercase italic tracking-[0.2em] text-lime-400 sm:text-xl md:text-2xl md:tracking-[0.25em]">
                  {tagline}
                </p>
              </div>
            ) : null}
          </div>

          <div>
            <div className="mb-6 md:mb-8">
              <SectionLabel>Benefits</SectionLabel>
              <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white md:text-3xl">
                What you&apos;ll gain
              </h2>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5">
              {classData.highlights.map((h, index) => (
                <li
                  key={h.title}
                  className="flex flex-col border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-zinc-950 md:p-7"
                >
                  <span className="mb-4 inline-flex h-9 w-9 items-center justify-center bg-lime-500 text-xs font-black text-black">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-gray-900 dark:text-white">
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{h.description}</p>
                </li>
              ))}
            </ul>
          </div>

          {classData.schedule.length > 0 ? (
            <div className="overflow-hidden border border-black/10 bg-white dark:border-white/10 dark:bg-zinc-950">
              <div className="flex flex-col gap-6 border-b border-black/10 bg-[#ebe8e0] p-6 dark:border-white/10 dark:bg-zinc-900 md:flex-row md:items-center md:justify-between md:p-8 lg:p-10">
                <div className="max-w-xl">
                  <SectionLabel>Studio rhythm</SectionLabel>
                  <h2 className="mt-2 text-2xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white md:text-3xl">
                    When we run
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    These are our usual weekly slots for {classData.name}. Availability can change — check the live
                    schedule to book your spot.
                  </p>
                </div>
                <Link
                  href="/schedule"
                  className="inline-flex shrink-0 items-center justify-center gap-2 bg-black px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-lime-500 hover:text-black dark:bg-lime-500 dark:text-black dark:hover:bg-white"
                >
                  <CalendarDays className="h-4 w-4" />
                  Book on schedule
                </Link>
              </div>
              <ul className="grid divide-y divide-black/10 dark:divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {classData.schedule.map((slot) => (
                  <li
                    key={`${slot.day}-${slot.time}`}
                    className="group flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-[#f6f4ee] dark:hover:bg-zinc-900 md:p-8"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-lime-600 dark:text-lime-400">
                        {slot.day}
                      </p>
                      <p className="mt-2 text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white md:text-4xl">
                        {slot.time.replace(" ", "\u00a0")}
                      </p>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                      60 min · Studio
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-black uppercase tracking-[0.35em] text-lime-600 dark:text-lime-400">{children}</p>
  );
}

const ClassDetailCTA = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-50px" });

  return (
    <section ref={sectionRef} className="border-t-2 border-lime-500 bg-black py-12 md:py-14">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center md:text-left"
          >
            <h3 className="mb-2 text-2xl font-black uppercase italic tracking-tighter text-white md:text-3xl">
              Ready to move?
            </h3>
            <p className="max-w-md text-sm text-zinc-400 md:text-base">
              Book a trial or WhatsApp us — we&apos;ll get you into the right class.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/trial-booking"
              className="inline-flex items-center justify-center gap-2 bg-lime-500 px-8 py-4 text-sm font-black uppercase tracking-widest text-black hover:bg-white"
            >
              Book trial
            </Link>
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="inline-flex items-center justify-center border-2 border-white/40 px-8 py-4 text-sm font-black uppercase tracking-widest text-white hover:border-lime-500 hover:text-lime-500"
            >
              WhatsApp
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
