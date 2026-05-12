"use client";

import { useAvailablePackages } from "@/hooks/usePackages";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { CheckCircle2 } from "lucide-react";
import LoadingIcon from "@/components/Common/LoadingIcon";

const PricingContent = () => {
  const router = useRouter();
  const { openWhatsAppModal } = useWhatsAppModal();
  const { data: adultPackages = [], isLoading: isLoadingAdults, error: errorAdults } = useAvailablePackages('adults');
  const { data: kidsPackages = [], isLoading: isLoadingKids, error: errorKids } = useAvailablePackages('kids');
  const isLoading = isLoadingAdults || isLoadingKids;
  
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
      maximumFractionDigits: 0,
    }).format(priceCents / 100);
  };

  const formatValidity = (days: number) => {
    if (days === 7) return "1 week";
    if (days === 30) return "1 month";
    if (days === 60) return "2 months";
    if (days === 90) return "3 months";
    return `${days} days`;
  };

  const goToSignupForPackages = () => {
    router.push("/signup?next=/packages");
  };

  return (
    <section ref={sectionRef} className="py-20 md:py-32 bg-[#f6f4ee] dark:bg-black overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8">
        
        {/* Adults Packages Section */}
        <div className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            className="mb-16 md:mb-24"
          >
            <div className="text-lime-600 dark:text-lime-400 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-6">
              Adults Packages
            </div>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-8">
              PACKAGES FOR <br />
              <span className="text-lime-500">EVERYONE</span>
            </h2>
            <p className="max-w-2xl text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-medium uppercase tracking-tight">
              Find a dance fitness class that feels like your own. Beginner-friendly, feel-good classes for all.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingIcon size="md" showLabel />
            </div>
          ) : errorAdults ? (
            <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-12 text-center">
              <p className="text-red-600 dark:text-red-400 font-black uppercase tracking-widest">Error loading packages. Please try again later.</p>
            </div>
          ) : adultPackages.length === 0 ? (
            <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-12 text-center">
              <p className="text-gray-600 dark:text-zinc-400 font-black uppercase tracking-widest">No adult packages available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-black/10 dark:border-white/10">
              {adultPackages.map((pkg, index) => {
                const isPopular = index === Math.floor(adultPackages.length / 2);
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`group relative flex flex-col p-10 md:p-12 transition-all duration-500 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 last:border-r-0 ${
                      isPopular
                        ? "bg-lime-500 text-black"
                        : "bg-white dark:bg-zinc-950 text-gray-900 dark:text-white hover:bg-lime-500/5"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 left-0 bg-black text-lime-500 text-[10px] font-black px-6 py-2 uppercase tracking-[0.2em] z-10">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="mb-10">
                      <h3 className={`text-2xl font-black uppercase italic tracking-tight mb-6 transition-colors ${isPopular ? "text-black" : "text-gray-900 dark:text-white"}`}>
                        {pkg.name}
                      </h3>
                      <div className={`flex items-baseline gap-1 mb-6 transition-colors ${isPopular ? "text-black" : "text-gray-900 dark:text-white"}`}>
                        <span className="text-5xl font-black italic tracking-tighter">
                          {formatPrice(pkg.price_cents, pkg.currency)}
                        </span>
                        <span className={`font-black text-sm uppercase ${isPopular ? "text-black/40" : "text-gray-400"}`}>
                          /pack
                        </span>
                      </div>
                      <p className={`font-medium leading-relaxed uppercase tracking-tight text-sm mb-4 ${isPopular ? "text-black/70" : "text-gray-600 dark:text-zinc-400"}`}>
                        {pkg.description || (pkg.is_unlimited ? "Unlimited class access" : `${pkg.token_count} class tokens`)}
                      </p>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${isPopular ? "text-black/40" : "text-gray-500 dark:text-zinc-500"}`}>
                        {pkg.is_unlimited ? 'Unlimited tokens' : `${pkg.token_count} ${pkg.token_count === 1 ? 'token' : 'tokens'}`} • Valid for {formatValidity(pkg.validity_days)}
                      </p>
                    </div>

                    <ul className="flex-1 space-y-4 mb-12">
                      {[
                        pkg.is_unlimited ? 'Unlimited class bookings' : `${pkg.token_count} class ${pkg.token_count === 1 ? 'token' : 'tokens'}`,
                        `Valid for ${formatValidity(pkg.validity_days)}`,
                        'All class types included',
                        'Easy online booking'
                      ].map((feature, fIdx) => (
                        <li key={fIdx} className={`flex items-start gap-3 text-xs font-black uppercase tracking-widest transition-colors ${isPopular ? "text-black" : "text-gray-700 dark:text-zinc-300"}`}>
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? "text-black" : "text-lime-500"}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={goToSignupForPackages}
                      className={`w-full py-5 text-center font-black transition-all uppercase tracking-[0.2em] text-xs ${
                        isPopular
                          ? "bg-black text-white hover:bg-zinc-900"
                          : "bg-black dark:bg-white text-white dark:text-black hover:bg-lime-500 hover:text-black dark:hover:bg-lime-500"
                      }`}
                    >
                      Purchase Package
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kids Packages Section */}
        {kidsPackages.length > 0 && (
          <div className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4 }}
              className="mb-16 md:mb-24"
            >
              <div className="text-lime-600 dark:text-lime-400 font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-6">
                Kids Packages
              </div>
              <h2 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-[0.85] mb-8">
                PACKAGES FOR <br />
                <span className="text-lime-500">KIDS</span>
              </h2>
              <p className="max-w-2xl text-gray-600 dark:text-zinc-400 text-lg md:text-xl font-medium uppercase tracking-tight">
                Must be accompanied by a parent/guardian. Ages 5-12 years.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border border-black/10 dark:border-white/10">
              {kidsPackages.map((pkg, index) => {
                const isPopular = index === Math.floor(kidsPackages.length / 2);
                return (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`group relative flex flex-col p-10 md:p-12 transition-all duration-500 border-b md:border-b-0 md:border-r border-black/10 dark:border-white/10 last:border-r-0 ${
                      isPopular
                        ? "bg-lime-500 text-black"
                        : "bg-white dark:bg-zinc-950 text-gray-900 dark:text-white hover:bg-lime-500/5"
                    }`}
                  >
                    {isPopular && (
                      <div className="absolute top-0 left-0 bg-black text-lime-500 text-[10px] font-black px-6 py-2 uppercase tracking-[0.2em] z-10">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="mb-10">
                      <h3 className={`text-2xl font-black uppercase italic tracking-tight mb-6 transition-colors ${isPopular ? "text-black" : "text-gray-900 dark:text-white"}`}>
                        {pkg.name}
                      </h3>
                      <div className={`flex items-baseline gap-1 mb-6 transition-colors ${isPopular ? "text-black" : "text-gray-900 dark:text-white"}`}>
                        <span className="text-5xl font-black italic tracking-tighter">
                          {formatPrice(pkg.price_cents, pkg.currency)}
                        </span>
                        <span className={`font-black text-sm uppercase ${isPopular ? "text-black/40" : "text-gray-400"}`}>
                          /pack
                        </span>
                      </div>
                      <p className={`font-medium leading-relaxed uppercase tracking-tight text-sm mb-4 ${isPopular ? "text-black/70" : "text-gray-600 dark:text-zinc-400"}`}>
                        {pkg.description || (pkg.is_unlimited ? "Unlimited class access" : `${pkg.token_count} class tokens`)}
                      </p>
                      {pkg.age_requirement && (
                        <p className={`text-[10px] font-black uppercase tracking-widest mb-4 italic ${isPopular ? "text-black/60" : "text-lime-600 dark:text-lime-400"}`}>
                          {pkg.age_requirement}
                        </p>
                      )}
                    </div>

                    <ul className="flex-1 space-y-4 mb-12">
                      {[
                        pkg.is_unlimited ? 'Unlimited class bookings' : `${pkg.token_count} class ${pkg.token_count === 1 ? 'token' : 'tokens'}`,
                        `Valid for ${formatValidity(pkg.validity_days)}`,
                        'Parent/guardian required',
                        'All class types included'
                      ].map((feature, fIdx) => (
                        <li key={fIdx} className={`flex items-start gap-3 text-xs font-black uppercase tracking-widest transition-colors ${isPopular ? "text-black" : "text-gray-700 dark:text-zinc-300"}`}>
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? "text-black" : "text-lime-500"}`} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={goToSignupForPackages}
                      className={`w-full py-5 text-center font-black transition-all uppercase tracking-[0.2em] text-xs ${
                        isPopular
                          ? "bg-black text-white hover:bg-zinc-900"
                          : "bg-black dark:bg-white text-white dark:text-black hover:bg-lime-500 hover:text-black dark:hover:bg-lime-500"
                      }`}
                    >
                      Purchase Package
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.4 }}
          className="p-10 md:p-20 bg-lime-500 text-black flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-1/3 h-full bg-black/5 -skew-x-12 translate-x-1/4"></div>
          
          <div className="text-center lg:text-left relative z-10 max-w-2xl">
            <h3 className="text-4xl md:text-6xl font-black mb-6 uppercase italic tracking-tighter leading-[0.9]">
              READY TO <br />
              <span className="bg-black text-lime-500 px-4 py-1 inline-block">START</span> DANCING?
            </h3>
            <p className="text-black/70 text-lg md:text-xl font-bold uppercase tracking-tight">
              Join our community and find your dance fitness class. One beat. One step. One happy you.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full lg:w-auto">
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="px-12 py-6 bg-black text-white font-black hover:bg-zinc-900 transition-all shadow-2xl uppercase tracking-[0.2em] text-sm text-center"
            >
              Sign Up Now
            </button>
            <Link
              href="/schedule"
              className="px-12 py-6 bg-transparent border-2 border-black text-black font-black hover:bg-black hover:text-white transition-all uppercase tracking-[0.2em] text-sm text-center"
            >
              View Schedule
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingContent;
