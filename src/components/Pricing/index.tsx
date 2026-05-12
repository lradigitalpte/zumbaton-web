"use client";
import Image from "next/image";
import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import PricingBox from "./PricingBox";
import { useWhatsAppModal } from "@/context/WhatsAppModalContext";

const Pricing = () => {
  const { openWhatsAppModal } = useWhatsAppModal();

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
        <div className="absolute inset-0 bg-white/60 dark:bg-black/80"></div>
        <div className="absolute inset-0 bg-white/10 dark:bg-black/20"></div>
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

        <div className="-mx-4 px-4 pb-8 sm:mx-0 sm:px-0">
          <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:gap-8 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
            <div className="w-[min(100%,280px)] shrink-0 snap-start sm:w-[min(100%,320px)] lg:w-full">
              <PricingBox
                packageName="Single session"
                price="$30"
                duration="pack"
                subtitle="Single session. valid for 1 Month."
              >
                <OfferList text="1 Class Token" status="active" />
                <OfferList text="Valid for 1 month" status="active" />
                <OfferList text="All class types included" status="active" />
                <OfferList text="Easy online booking" status="active" />
                <OfferList text="Priority booking" status="active" />
              </PricingBox>
            </div>

            <div className="w-[min(100%,280px)] shrink-0 snap-start sm:w-[min(100%,320px)] lg:w-full relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-none shadow-lg z-20">
                Most Popular
              </div>
              <PricingBox
                packageName="Unlimited Session Pack"
                price="$265"
                duration="pack"
                subtitle="Maximum value for the ultimate Stepperholics. Valid for a month."
              >
                <OfferList text="Unlimited Class Bookings" status="active" />
                <OfferList text="Valid for 1 month" status="active" />
                <OfferList text="All class types included" status="active" />
                <OfferList text="Easy online booking" status="active" />
                <OfferList text="Priority booking" status="active" />
                <OfferList text="1 guest pass included" status="active" />
              </PricingBox>
            </div>

            <div className="w-[min(100%,280px)] shrink-0 snap-start sm:w-[min(100%,320px)] lg:w-full">
              <PricingBox
                packageName="4 Session Pack"
                price="$99"
                duration="pack"
                subtitle="Great for regular dancers. Valid for 1 month."
              >
                <OfferList text="4 Class Tokens" status="active" />
                <OfferList text="Valid for 1 month" status="active" />
                <OfferList text="All class types included" status="active" />
                <OfferList text="Easy online booking" status="active" />
                <OfferList text="Priority booking" status="active" />
              </PricingBox>
            </div>
          </div>
        </div>

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

export default Pricing;
