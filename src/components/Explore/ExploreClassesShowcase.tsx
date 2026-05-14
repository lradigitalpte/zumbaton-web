"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { zumbaClasses, type ZumbaClass, CLASS_ENERGY } from "@/data/classes";
import { highlightCoachInText } from "@/lib/highlightCoachInText";
import { LightningRating } from "@/components/Common/LightningRating";

const DEFAULT_CARD_DURATION = "60 min";

const STUDIO_VIBE: Record<string, string> = {
  "groove-stepper": "Structured step choreography with serious groove.",
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
    slug: "zumfiesta",
    name: "ZumFiesta",
    href: "/zt-fiesta",
    image: "/images/fiesta/Screen7.png",
    intensity: "All Levels",
    vibe: "West-side outdoor sessions: fresh air, big energy.",
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
}: {
  href: string;
  image: string;
  name: string;
  vibe: string;
  intensity: ZumbaClass["intensity"];
  energy: number;
  durationLabel?: string;
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
      <div className="group relative flex h-full flex-col overflow-hidden rounded-none border-2 border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-lime-500 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-lime-500/50">
        {/* Main Clickable Area */}
        <Link href={href} className="absolute inset-0 z-0" aria-label={`View details for ${name}`} />
        
        <div className="relative h-36 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 sm:h-44">
          <Image src={image} alt={name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 1024px) 300px, 25vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-black uppercase italic leading-tight tracking-tighter text-gray-900 dark:text-white sm:text-lg">
              {name}
            </h3>
            <LightningRating filled={energy} size="sm" />
          </div>
          <p className="line-clamp-3 text-sm font-medium leading-relaxed text-gray-600 dark:text-zinc-400">
            {highlightCoachInText(vibe)}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <span className="rounded-none border border-black/10 bg-[#f6f4ee] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
              {intensity}
            </span>
            <span className="rounded-none border border-black/10 bg-[#f6f4ee] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
              {duration}
            </span>
          </div>
          <div className="relative z-10 mt-4 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-600 dark:text-lime-400">Details</span>
              <Link 
                href="/trial-booking" 
                className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 hover:text-lime-500 transition-colors"
              >
                Book Trial
              </Link>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-none border-2 border-gray-200 bg-gray-50 text-gray-900 transition-all duration-300 group-hover:border-lime-500 group-hover:bg-lime-500 group-hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:group-hover:text-black">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export default function ExploreClassesShowcase() {
  const studio = zumbaClasses;

  return (
    <section className="bg-white py-12 text-gray-900 dark:bg-black dark:text-white sm:py-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 rounded-none border border-gray-200 bg-[#fbfaf6] p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <span className="mb-4 inline-flex rounded-none border border-gray-300 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-700 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                The Lineup
              </span>
              <h2 className="text-3xl font-black uppercase italic leading-[0.95] tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Studio <span className="text-lime-500">& Outdoor Energy</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-lg font-medium leading-relaxed text-gray-600 dark:text-zinc-400">
                Raw energy, structured movement, and a community that hits different. Choose your session and let&apos;s move.
              </p>
            </div>
            <div className="grid max-w-xs grid-cols-2 gap-3 sm:max-w-sm">
              <div className="rounded-none border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 sm:text-xs">Studio</div>
                <div className="mt-1 text-xl font-black sm:text-2xl">{studio.length}</div>
              </div>
              <div className="rounded-none border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-5 sm:py-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 sm:text-xs">Outdoor</div>
                <div className="mt-1 text-xl font-black sm:text-2xl">{OUTDOOR.length}</div>
              </div>
            </div>
          </div>
          <Link
            href="/schedule"
            className="mt-8 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-lime-600 transition-colors hover:text-black dark:text-lime-400 dark:hover:text-white"
          >
            View schedule
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Studio Sessions
          </h3>
          <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 sm:flex">
            <span>Swipe to explore</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </div>
        <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
            {studio.map((c) => (
              <div key={c.slug} className="w-[240px] flex-shrink-0 snap-start sm:w-[280px]">
                <ClassCard
                  href={`/classes/${c.slug}`}
                  image={c.image}
                  name={c.name}
                  vibe={STUDIO_VIBE[c.slug] ?? c.shortDescription}
                  intensity={c.intensity}
                  energy={CLASS_ENERGY[c.slug] ?? 4}
                  durationLabel={c.duration}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 mb-4 flex items-center justify-between gap-4">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Outdoor Energy
          </h3>
          {OUTDOOR.length > 1 && (
            <div className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 sm:flex">
              <span>Swipe to explore</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          )}
        </div>
        <div className="relative -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory">
            {OUTDOOR.map((c) => (
              <div key={c.slug} className="w-[240px] flex-shrink-0 snap-start sm:w-[280px]">
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
          </div>
        </div>
      </div>
    </section>
  );
}
