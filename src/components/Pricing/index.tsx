"use client";
import Image from "next/image";
import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import PricingBox from "./PricingBox";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useMemo } from "react";
import { useAvailablePackages } from "@/hooks/usePackages";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const Pricing = () => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Background moves slower (parallax)
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  // Fetch adult packages (for landing page, we show adults only)
  const { data: allPackages = [], isLoading } = useAvailablePackages('adults');

  // Get first 3 packages for featured display
  const featuredPackages = useMemo(() => {
    return allPackages.slice(0, 3);
  }, [allPackages]);

  const formatPrice = (priceCents: number, currency: string) => {
    return new Intl.NumberFormat("en-SG", {
      style: "currency",
      currency: currency || "SGD",
      minimumFractionDigits: 0,
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

  return (
    <section ref={sectionRef} id="pricing" className="relative text-gray-900 dark:text-white py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/images/image00065.jpeg"
          alt="Dance fitness pricing background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/80 dark:bg-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90 dark:from-black/90 dark:via-black/80 dark:to-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-black/50 dark:to-transparent"></div>
      </motion.div>

      {/* Content */}
      <div className="container relative z-10 px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm uppercase tracking-wide mb-2 sm:mb-3">
            Pricing Plans
          </div>
          <SectionTitle
            title="Choose the Perfect Plan That Truly Fits You"
            paragraph="Flexible token packages for every lifestyle. Pick a pack, join the rhythm, and dance whenever you want. Your pace. Your dance. Your Zumbaton."
            center
            width="720px"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : featuredPackages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No packages available at the moment. Check back soon!</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:gap-8 lg:gap-x-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredPackages.map((pkg, index) => {
              const isPopular = index === Math.floor(featuredPackages.length / 2);
              const priceFormatted = formatPrice(pkg.price_cents, pkg.currency);
              
              return (
                <div key={pkg.id} className={isPopular ? "relative" : ""}>
                  {isPopular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 dark:bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
              Most Popular
            </div>
                  )}
            <PricingBox
                    packageName={pkg.name}
                    price={priceFormatted}
              duration="pack"
              subtitle={pkg.description || `${pkg.token_count} class tokens - Perfect for finding your dance fitness vibe.`}
            >
                    <OfferList text={`${pkg.token_count} Class ${pkg.token_count === 1 ? 'Token' : 'Tokens'}`} status="active" />
                    <OfferList text={`Valid for ${formatValidity(pkg.validity_days)}`} status="active" />
              <OfferList text="All class types included" status="active" />
              <OfferList text="Easy online booking" status="active" />
                    <OfferList text="Priority booking" status={isPopular ? "active" : "inactive"} />
                    <OfferList text={isPopular ? "1 guest pass included" : "Guest passes"} status={isPopular ? "active" : "inactive"} />
            </PricingBox>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 sm:mt-12 text-center px-3 sm:px-0">
          <p className="text-gray-700 dark:text-white/80 mb-3 sm:mb-4 text-sm sm:text-base">
            Ready to start dancing?{" "}
            <Link href="/pricing" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              View all packages
            </Link>{" "}
            or{" "}
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="text-green-600 dark:text-green-400 hover:underline font-semibold bg-transparent border-none cursor-pointer p-0"
            >
              sign up now
            </button>
            .
          </p>
      </div>
      </div>
    </section>
  );
};

export default Pricing;
