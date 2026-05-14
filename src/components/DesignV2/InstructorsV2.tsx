"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type CoachAvatar = { name: string; image?: string };

const coaches: CoachAvatar[] = [
  { name: "Laavania", image: "/images/coach-lavs.jfif" },
  { name: "Robert", image: "/images/robert.jfif" },
  { name: "Fizah" },
];

const InstructorsV2 = () => {
  return (
    <section className="bg-[#f6f4ee] py-16 text-gray-900 dark:bg-black dark:text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.36, ease: "easeOut" }}
          >
            <span className="mb-5 inline-flex border border-black/10 bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.3em] text-gray-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200">
              The Squad
            </span>
            <h2 className="mt-6 text-3xl font-black uppercase italic leading-[0.85] tracking-tighter md:text-4xl lg:text-5xl lg:leading-[0.85]">
              The <br />
              <span className="mt-3 block text-lime-500">Squad.</span>
            </h2>
            <p className="mb-10 mt-8 max-w-xl text-lg font-medium leading-relaxed text-gray-600 dark:text-zinc-400 md:text-xl">
              We don&apos;t just teach; we build a movement. Our instructors bring raw energy and
              professional expertise to every session. You leave feeling stronger, every single time.
            </p>
            <div className="mb-10 grid max-w-lg grid-cols-2 gap-4">
              <div className="border border-black/10 bg-white px-5 py-4 dark:border-white/10 dark:bg-zinc-900">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Coaches
                </div>
                <div className="mt-1 text-2xl font-black">3</div>
              </div>
              <div className="border border-black/10 bg-white px-5 py-4 dark:border-white/10 dark:bg-zinc-900">
                <div className="text-sm font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                  Energy
                </div>
                <div className="mt-1 text-2xl font-black">High</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {coaches.map((coach) => (
                  <div
                    key={coach.name}
                    className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-gray-300 ring-2 ring-lime-500 dark:border-black dark:bg-zinc-800 sm:h-16 sm:w-16"
                  >
                    {coach.image ? (
                      <Image
                        src={coach.image}
                        alt={coach.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                      />
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center bg-zinc-700 text-sm font-black uppercase tracking-tight text-white sm:text-base"
                        aria-label={`${coach.name}, photo coming soon`}
                      >
                        {coach.name.slice(0, 1)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-lg font-black uppercase tracking-tight">Our Movement</span>
                <span className="text-sm font-black uppercase tracking-[0.3em] text-gray-600 dark:text-zinc-500">
                  Real People. Real Progress.
                </span>
              </div>
            </div>
          </motion.div>

          <div className="relative h-[600px] w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.36, ease: "easeOut" }}
              className="absolute inset-0 overflow-hidden border border-black/10 shadow-none dark:border-white/10"
            >
              <Image src="/images/hero/contact.jpeg" alt="One Step Fitness class in session" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute left-8 top-8 border border-white/20 bg-black/50 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-white">
                High-Energy Guidance
              </div>
              <div className="absolute bottom-8 left-8 right-8 border border-white/20 bg-white/95 p-8 dark:bg-black/80 dark:backdrop-blur-md">
                <h3 className="text-3xl font-black uppercase italic tracking-tight text-gray-900 dark:text-white">
                  Join the Energy
                </h3>
                <p className="mt-2 text-sm font-black uppercase tracking-[0.3em] text-lime-600 dark:text-lime-400">
                  One Step Fitness Community
                </p>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-700 dark:text-white/80">
                  Expect coaching that is technical when needed, encouraging all the time, and built around helping
                  members show up consistently.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorsV2;
