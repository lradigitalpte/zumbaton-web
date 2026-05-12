"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { zumbaClasses, type ZumbaClass } from "@/data/classes";

const DISPLAY_DURATION = "60 min";

const STUDIO_VIBE: Record<string, string> = {
  "groove-stepper": "Structured step choreography with serious groove.",
  zumbaton: "High-energy step cardio that still feels like a party.",
  "lil-steppers": "Games, friends, and confidence for young movers.",
  "thunderbolt-full-body-workout": "Tabata-style intervals — powerful and efficient.",
};

const STUDIO_ENERGY: Record<string, number> = {
  "groove-stepper": 4,
  zumbaton: 5,
  "lil-steppers": 3,
  "thunderbolt-full-body-workout": 5,
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
    vibe: "West-side outdoor sessions — fresh air, big energy.",
    energy: 4,
  },
];

function LightningRating({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${filled} of ${total} energy`}
    >
      {Array.from({ length: total }, (_, i) => {
        const on = i < filled;
        return (
          <Zap
            key={i}
            className={
              on
                ? "h-[14px] w-[14px] shrink-0 fill-yellow-400 text-yellow-400 sm:h-5 sm:w-5"
                : "h-[14px] w-[14px] shrink-0 fill-none stroke-[2.2] stroke-zinc-300 text-zinc-200 sm:h-5 sm:w-5 dark:stroke-white/50 dark:text-white/30"
            }
            aria-hidden
          />
        );
      })}
    </div>
  );
}

function ClassCard({
  href,
  image,
  name,
  vibe,
  intensity,
  energy,
}: {
  href: string;
  image: string;
  name: string;
  vibe: string;
  intensity: ZumbaClass["intensity"];
  energy: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.32, delay: 0 }}
      className="w-[min(100%,280px)] shrink-0 snap-start sm:w-[min(100%,300px)] lg:w-full lg:min-w-0 lg:shrink"
    >
      <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-none border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-lime-400/80 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-lime-500/50">
        <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900 sm:h-44">
          <Image src={image} alt={name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 280px, 25vw" />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-black uppercase italic leading-tight tracking-tight text-gray-900 dark:text-white sm:text-lg">
              {name}
            </h3>
            <LightningRating filled={energy} />
          </div>
          <p className="line-clamp-3 text-sm font-medium leading-relaxed text-gray-600 dark:text-zinc-400">{vibe}</p>
          <div className="mt-auto flex flex-wrap gap-2">
            <span className="rounded-none border border-gray-200 bg-[#f6f4ee] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 sm:text-[11px]">
              {intensity}
            </span>
            <span className="rounded-none border border-gray-200 bg-[#f6f4ee] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 sm:text-[11px]">
              {DISPLAY_DURATION}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-3 dark:border-zinc-800">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 sm:text-xs">Details</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-none border border-gray-200 bg-gray-50 text-gray-900 transition-colors group-hover:border-lime-400 group-hover:bg-lime-500 group-hover:text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:group-hover:text-black">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
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
                Class lineup
              </span>
              <h2 className="text-3xl font-black uppercase italic leading-[0.95] tracking-tighter sm:text-4xl md:text-6xl lg:text-7xl">
                Studio <span className="text-lime-500">&amp; outdoor</span>
              </h2>
              <p className="mt-4 max-w-2xl text-sm md:text-xl font-medium leading-relaxed text-gray-600 dark:text-zinc-400">
                Effective workout routines for all fitness levels. Select a format, check the difficulty and duration, and join a class.
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
            Studio classes
          </h3>
        </div>
        <div className="-mx-4 px-4 pb-2 sm:mx-0 sm:px-0">
          <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory lg:grid lg:grid-cols-2 lg:gap-6 lg:overflow-visible lg:pb-0 xl:grid-cols-4 [&::-webkit-scrollbar]:hidden">
            {studio.map((c) => (
              <ClassCard
                key={c.slug}
                href={`/classes/${c.slug}`}
                image={c.image}
                name={c.name}
                vibe={STUDIO_VIBE[c.slug] ?? c.shortDescription}
                intensity={c.intensity}
                energy={STUDIO_ENERGY[c.slug] ?? 4}
              />
            ))}
          </div>
        </div>

        <div className="mt-14 mb-4">
          <h3 className="text-xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Outdoor classes
          </h3>
        </div>
        <div className="-mx-4 px-4 pb-2 sm:mx-0 sm:px-0">
          {OUTDOOR.length === 1 ? (
            <div className="flex justify-center lg:justify-start">
              <div className="w-full max-w-md lg:max-w-sm">
                <ClassCard
                  href={OUTDOOR[0].href}
                  image={OUTDOOR[0].image}
                  name={OUTDOOR[0].name}
                  vibe={OUTDOOR[0].vibe}
                  intensity={OUTDOOR[0].intensity}
                  energy={OUTDOOR[0].energy}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto overflow-y-visible pb-4 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory sm:max-w-md lg:max-w-none lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {OUTDOOR.map((c) => (
                <ClassCard
                  key={c.slug}
                  href={c.href}
                  image={c.image}
                  name={c.name}
                  vibe={c.vibe}
                  intensity={c.intensity}
                  energy={c.energy}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
