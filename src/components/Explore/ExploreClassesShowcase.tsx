"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { zumbaClasses, type ZumbaClass, CLASS_ENERGY } from "@/data/classes";
import { highlightCoachInText } from "@/lib/highlightCoachInText";
import { LightningRating } from "@/components/Common/LightningRating";
import { HorizontalScrollCarousel } from "@/components/Common/HorizontalScrollCarousel";

const DEFAULT_CARD_DURATION = "60 min";

const STUDIO_VIBE: Record<string, string> = {
  "groove-stepper": "Synchronized stepper choreography with Robert & Micky.",
  "zumba-step": "High-energy step cardio that hits like a party. Pure energy.",
  "lil-steppers": "Games, friends, and confidence for young movers.",
  "thunderbolt-bodyweight-steppers": "Tabata on the step: bodyweight power with Coach Robert.",
  "thunderbolt-resistance-dance": "Bands + dance cardio Thunderbolt: full body, no steppers, Coach Fizah.",
  piloxing: "HIIT fusion of Pilates, boxing, and dance with Coach Fizah.",
};

type OutdoorClass = {
  slug: string;
  name: string;
  href: string;
  image: string;
  intensity: ZumbaClass["intensity"];
  vibe: string;
  energy: number;
};

const OUTDOOR: OutdoorClass[] = [
  {
    slug: "thunderbolt-tabata-outdoor",
    name: "Thunderbolt Tabata Full Body Workout",
    href: "/zt-fiesta",
    image: "/OSF%20IMAGES/OS2.jpg",
    intensity: "Level 5",
    vibe: "Outdoor Tabata at OCBC Arena, Kallang Gate 20.",
    energy: 4,
  },
];

function ClassCard({
  href,
  image,
  name,
  vibe,
  intensity,
  energy,
  durationLabel,
  imageClassName = "object-cover object-center",
}: {
  href: string;
  image: string;
  name: string;
  vibe: string;
  intensity: ZumbaClass["intensity"];
  energy: number;
  durationLabel?: string;
  imageClassName?: string;
}) {
  const duration = durationLabel ?? DEFAULT_CARD_DURATION;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.32, delay: 0 }}
      className="min-w-0 w-full"
    >
      <motion.div className="group relative flex h-full flex-col rounded-none border-2 border-gray-200 bg-white shadow-sm transition-colors duration-300 hover:border-lime-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-lime-500/50">
        <Link href={href} className="absolute inset-0 z-[1]" aria-label={`View details for ${name}`} />

        <motion.div className="pointer-events-none relative z-0 flex h-full flex-col overflow-hidden">
          <motion.div className="relative h-44 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 sm:h-52">
            <Image
              src={image}
              alt={name}
              fill
              className={`${imageClassName} transition-transform duration-500 group-hover:scale-[1.02]`}
              sizes="(max-width: 1024px) 80vw, 360px"
            />
            <motion.div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </motion.div>
          <motion.div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
            <motion.div className="flex flex-col gap-2">
              <h3 className="text-base font-black uppercase italic leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-lg">
                {name}
              </h3>
              <LightningRating filled={energy} size="sm" className="shrink-0" />
            </motion.div>
            <p className="line-clamp-3 text-sm font-medium leading-relaxed text-gray-600 dark:text-zinc-400">
              {highlightCoachInText(vibe)}
            </p>
            <motion.div className="mt-auto flex flex-wrap gap-2 pt-4">
              <span className="rounded-none border border-black/10 bg-[#f6f4ee] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                {intensity}
              </span>
              <span className="rounded-none border border-black/10 bg-[#f6f4ee] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
                {duration}
              </span>
            </motion.div>
            <motion.div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
              <motion.div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-600 dark:text-lime-400">Details</span>
                <Link
                  href="/trial-booking"
                  className="pointer-events-auto relative z-[2] text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 transition-colors hover:text-lime-500"
                >
                  Book Trial
                </Link>
              </motion.div>
              <span className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 group-hover:border-lime-500 group-hover:bg-lime-500 group-hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:group-hover:text-black">
                <ArrowRight className="h-4 w-4" />
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export default function ExploreClassesShowcase() {
  const studio = zumbaClasses;

  return (
    <section className="bg-white py-12 text-gray-900 dark:bg-black dark:text-white sm:py-24">
      <motion.div className="container mx-auto px-4 sm:px-6">
        <motion.div className="mb-10 rounded-none border border-gray-200 bg-[#fbfaf6] p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8 md:p-10">
          <motion.div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <motion.div className="max-w-3xl">
              <span className="mb-4 inline-flex rounded-none border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                The Lineup
              </span>
              <h2 className="text-3xl font-black uppercase italic leading-[0.95] tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Studio <span className="text-lime-500">& Outdoor Energy</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-lg font-medium leading-relaxed text-gray-600 dark:text-zinc-400">
                Raw energy, structured movement, and a community that hits different. Choose your session and let&apos;s move.
              </p>
            </motion.div>
            <motion.div className="grid max-w-xs grid-cols-2 gap-3 sm:max-w-sm">
              <motion.div className="rounded-none border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <motion.div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 sm:text-xs">Studio</motion.div>
                <motion.div className="mt-1 text-xl font-black sm:text-2xl">{studio.length}</motion.div>
              </motion.div>
              <motion.div className="rounded-none border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <motion.div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 sm:text-xs">Outdoor</motion.div>
                <motion.div className="mt-1 text-xl font-black sm:text-2xl">{OUTDOOR.length}</motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
          <Link
            href="/schedule"
            className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-lime-600 transition-colors hover:text-black dark:text-lime-400 dark:hover:text-white"
          >
            View schedule
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <HorizontalScrollCarousel
          id="studio-sessions-carousel"
          hint="Scroll the lineup"
          gap={24}
          label={
            <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Studio Sessions
            </h3>
          }
        >
          {studio.map((c) => (
            <div
              key={c.slug}
              data-carousel-card
              className="w-[min(78vw,300px)] min-w-[260px] flex-shrink-0 snap-start sm:w-[300px] md:w-[320px] @min-[900px]:w-[calc((100cqw-4.5rem)/3.5)]"
            >
              <ClassCard
                href={`/classes/${c.slug}`}
                image={c.slug === "lil-steppers" ? "/images/hero/kids1.png" : c.image}
                name={c.name}
                vibe={STUDIO_VIBE[c.slug] ?? c.shortDescription}
                intensity={c.intensity}
                energy={CLASS_ENERGY[c.slug] ?? 4}
                durationLabel={c.duration}
                imageClassName={
                  c.slug === "lil-steppers"
                    ? "object-cover object-[50%_20%]"
                    : "object-cover object-center"
                }
              />
            </div>
          ))}
        </HorizontalScrollCarousel>

        <HorizontalScrollCarousel
          id="outdoor-energy-carousel"
          hint="Scroll the lineup"
          gap={24}
          outerClassName="mt-14"
          label={
            <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
              Outdoor Energy
            </h3>
          }
        >
          {OUTDOOR.map((c) => (
            <div
              key={c.slug}
              data-carousel-card
              className="w-[min(78vw,300px)] min-w-[260px] flex-shrink-0 snap-start sm:w-[300px] md:w-[320px] @min-[900px]:w-[calc((100cqw-4.5rem)/3.5)]"
            >
              <ClassCard
                href={c.href}
                image={c.image}
                name={c.name}
                vibe={c.vibe}
                intensity={c.intensity}
                energy={CLASS_ENERGY[c.slug] ?? c.energy}
              />
            </div>
          ))}
        </HorizontalScrollCarousel>
      </motion.div>
    </section>
  );
}
