"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const coaches = [
  { name: "Laavania", image: "/images/coach-lavs.jfif" },
  { name: "Robert", image: "/images/robert.jfif" },
];

const InstructorsV2 = () => {
  return (
    <section className="py-24 bg-white dark:bg-black text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter uppercase italic leading-tight">
              Meet Your <br />
              <span className="text-lime-500 block mt-3">
                Coaches.
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-zinc-400 mb-10 leading-relaxed font-medium max-w-xl">
              We don't just teach classes; we build a movement. Our instructors bring high-energy vibes and professional expertise to every session, ensuring you leave feeling stronger and more alive.
            </p>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-4">
                {coaches.map((coach) => (
                  <div key={coach.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white dark:border-black bg-gray-300 dark:bg-zinc-800 relative overflow-hidden flex-shrink-0 ring-2 ring-lime-500 shadow-xl">
                    <Image
                      src={coach.image}
                      alt={coach.name}
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-black text-lg uppercase tracking-tight">Our Movement</span>
                <span className="text-sm text-gray-600 dark:text-zinc-500 font-bold uppercase tracking-widest">Real People. Real Results.</span>
              </div>
            </div>
          </motion.div>

          <div className="relative h-[600px] w-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="absolute inset-0 rounded-[40px] overflow-hidden shadow-2xl border-2 border-gray-200 dark:border-zinc-800"
            >
              <Image
                src="/images/hero/contact.jpeg"
                alt="One Step Fitness class"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-black via-black/20 dark:via-black/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 bg-black/70 backdrop-blur-md p-8 rounded-3xl border border-white/20">
                <h3 className="text-3xl font-black text-white uppercase italic tracking-tight">Join the Energy</h3>
                <p className="text-lime-400 font-black uppercase tracking-widest text-sm">One Step Fitness Community</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstructorsV2;
