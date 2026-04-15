"use client";

import Link from "next/link";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { ClassesHero, ClassesCTA } from "@/components/Classes";
import { zumFamiliaPackages } from "@/data/zumfamilia";

export default function ZumFamiliaPage() {
  return (
    <>
      <ClassesHero
        title="ZumFamilia"
        breadcrumbs={[
          { label: "Home", href: "/explore" },
          { label: "Classes", href: "/classes" },
          { label: "ZumFamilia" },
        ]}
      />

      <section className="py-12 md:py-24 bg-gradient-to-br from-gray-50 via-white to-green-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-green-950/20 relative overflow-hidden">
        {/* Decorative background blur objects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 dark:bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 dark:bg-gray-800/60 backdrop-blur-md shadow-sm border border-green-100 dark:border-gray-700 text-green-700 dark:text-green-400 text-sm font-bold tracking-wide">
              <Users className="w-5 h-5 text-green-500" />
              Child & Parent Bonding Class
            </span>
            <h2 className="mt-6 text-3xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 tracking-tight">
              Choose Your ZumFamilia Package
            </h2>
            <p className="mt-4 text-base md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed font-light">
              Pick a package below to view full details, select your preferred class date, and proceed to payment.
            </p>
          </div>

          <div className="mt-10 md:mt-14 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8">
            {zumFamiliaPackages.map((pkg) => (
              <article
                key={pkg.id}
                className="group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/50 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 p-5 md:p-8 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex-1">
                  <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1.5 rounded-full">
                    <Sparkles className="w-4 h-4" />
                    ZumFamilia Package
                  </p>
                  <h3 className="mt-4 md:mt-6 text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">{pkg.name}</h3>
                  <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400 min-h-[64px] md:min-h-[80px]">
                    {pkg.shortDescription}
                  </p>
                  <div className="mt-5 md:mt-8 flex items-end gap-2">
                    <p className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 leading-none">
                      ${(pkg.priceCents / 100).toFixed(2)}
                    </p>
                    <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">one-time</p>
                  </div>
                </div>
                <div className="relative z-10 mt-5 md:mt-8">
                  <Link
                    href={`/zumfamilia/${pkg.slug}`}
                    className="inline-flex items-center justify-center gap-2 w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3.5 md:py-4 text-base md:text-lg shadow-lg shadow-green-500/30 transition-all duration-300 transform group-hover:scale-[1.02]"
                  >
                    View Details & Book
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-20 rounded-[2.5rem] border border-white/50 dark:border-gray-700 bg-white/40 dark:bg-gray-800/40 backdrop-blur-2xl shadow-xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">
                Explore Other Class Pages
              </h3>
              <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
                Jump to other programs while deciding which option fits your family best.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 flex-shrink-0">
              <Link href="/classes/groove-stepper" className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">Groove Stepper</Link>
              <Link href="/classes/zumbaton" className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">ZUMBATON</Link>
              <Link href="/classes/zumbuddies" className="px-5 py-2.5 rounded-xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">ZUMBUDDIES</Link>
              <Link href="/zt-fiesta" className="px-5 py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-800 dark:text-green-300 font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">ZT Fiesta</Link>
              <Link href="/classes" className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold hover:opacity-90 transition-opacity">View All Classes</Link>
            </div>
          </div>
        </div>
      </section>

      <ClassesCTA />
    </>
  );
}
