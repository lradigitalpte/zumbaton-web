"use client";

import Image from "next/image";
import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import PricingBox from "./PricingBox";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";
import { HorizontalScrollCarousel } from "@/components/Common/HorizontalScrollCarousel";
import { useAvailablePackages } from "@/hooks/usePackages";
import type { Package } from "@/lib/packages-queries";
import {
  formatPackagePrice,
  getPackageFeatures,
  getPackageSubtitle,
} from "@/lib/packages-utils";
import LoadingIcon from "@/components/Common/LoadingIcon";

interface PricingCarouselProps {
  initialAdultPackages?: Package[];
}

const PricingCarousel = ({ initialAdultPackages = [] }: PricingCarouselProps) => {
  const { openWhatsAppModal } = useWhatsAppModal();
  const {
    data: adultPackages = initialAdultPackages,
    isLoading,
    error,
  } = useAvailablePackages("adults", initialAdultPackages);

  const showLoading = isLoading && adultPackages.length === 0;

  return (
    <section id="pricing" className="relative text-gray-900 dark:text-white py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden bg-[#f6f4ee] dark:bg-black">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/images/image00065.jpeg"
          alt="Dance fitness pricing background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/60 dark:bg-black/80" />
        <div className="absolute inset-0 bg-white/10 dark:bg-black/20" />
      </div>

      <div className="container relative z-10 px-3 sm:px-4">
        <div className="text-center mb-8 sm:mb-12">
          <div className="text-lime-600 dark:text-lime-400 font-bold text-xs sm:text-sm uppercase tracking-[0.2em] mb-2 sm:mb-3">
            Pricing Plans
          </div>
          <SectionTitle
            title="Fitness Packages"
            paragraph="Select a session pack that fits your schedule. We offer different workout options for all fitness stages."
            center
            width="720px"
          />
        </div>

        {showLoading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingIcon size="md" showLabel />
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-12 text-center">
            <p className="text-red-600 dark:text-red-400 font-black uppercase tracking-widest">
              Error loading packages. Please try again later.
            </p>
          </div>
        ) : adultPackages.length === 0 ? (
          <div className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 p-12 text-center">
            <p className="text-gray-600 dark:text-zinc-400 font-black uppercase tracking-widest">
              No packages available at the moment
            </p>
          </div>
        ) : (
          <HorizontalScrollCarousel
            id="pricing-packages-carousel"
            hint="Compare packages"
            outerClassName="-mx-4 px-4 pb-8 sm:mx-0 sm:px-0"
            trackClassName="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:pb-0"
            label={
              <p className="text-sm font-black uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400 lg:sr-only">
                Session packs
              </p>
            }
          >
            {adultPackages.map((pkg, index) => {
              const isPopular = index === Math.floor(adultPackages.length / 2);

              return (
                <div
                  key={pkg.id}
                  data-carousel-card
                  className={`relative w-[min(100%,280px)] shrink-0 snap-start sm:w-[min(100%,320px)] lg:w-full ${
                    isPopular ? "" : ""
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-none shadow-lg z-20">
                      Most Popular
                    </div>
                  )}
                  <PricingBox
                    packageName={pkg.name}
                    price={formatPackagePrice(pkg.price_cents, pkg.currency)}
                    duration="pack"
                    subtitle={getPackageSubtitle(pkg)}
                  >
                    {getPackageFeatures(pkg).map((feature) => (
                      <OfferList key={feature} text={feature} status="active" />
                    ))}
                  </PricingBox>
                </div>
              );
            })}
          </HorizontalScrollCarousel>
        )}

        <div className="mt-10 sm:mt-12 text-center px-3 sm:px-0">
          <p className="text-gray-700 dark:text-zinc-400 mb-3 sm:mb-4 text-sm sm:text-base font-medium">
            Ready to start dancing?{" "}
            <Link href="/pricing" className="text-lime-600 dark:text-lime-400 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-wider">
              View all packages
            </Link>{" "}
            or{" "}
            <button
              type="button"
              onClick={openWhatsAppModal}
              className="text-lime-600 dark:text-lime-400 hover:text-black dark:hover:text-white transition-colors font-black uppercase tracking-wider bg-transparent border-none cursor-pointer p-0"
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

export default PricingCarousel;
