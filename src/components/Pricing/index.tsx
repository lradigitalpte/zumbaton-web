"use client";
import Image from "next/image";
import Link from "next/link";
import SectionTitle from "../Common/SectionTitle";
import OfferList from "./OfferList";
import PricingBox from "./PricingBox";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const Pricing = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Background moves slower (parallax)
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  return (
    <section ref={sectionRef} id="pricing" className="relative text-gray-900 dark:text-white py-20 md:py-28 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y: backgroundY }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070"
          alt="Zumba pricing background"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-white/80 dark:bg-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/80 to-white/90 dark:from-black/90 dark:via-black/80 dark:to-black/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent dark:from-black/50 dark:to-transparent"></div>
      </motion.div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <div className="text-green-600 dark:text-green-400 font-semibold text-sm uppercase tracking-wide mb-3">
            Pricing Plans
          </div>
          <SectionTitle
            title="Choose the Perfect Plan That Truly Fits You"
            paragraph="Flexible token packages for every lifestyle. Pick a pack, join the rhythm, and use tokens whenever you want."
            center
            width="720px"
          />
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          <PricingBox
            packageName="Starter Pack"
            price="45"
            duration="pack"
            subtitle="Perfect for trying out our classes and finding your rhythm."
          >
            <OfferList text="5 Class Tokens" status="active" />
            <OfferList text="Valid for 30 days" status="active" />
            <OfferList text="All class types included" status="active" />
            <OfferList text="Easy online booking" status="active" />
            <OfferList text="Priority booking" status="inactive" />
            <OfferList text="Guest passes" status="inactive" />
          </PricingBox>

          <div className="relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 dark:bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Most Popular
            </div>
            <PricingBox
              packageName="Fitness Enthusiast"
              price="80"
              duration="pack"
              subtitle="Our most popular package for regular dancers who love variety."
            >
              <OfferList text="10 Class Tokens" status="active" />
              <OfferList text="Valid for 60 days" status="active" />
              <OfferList text="All class types included" status="active" />
              <OfferList text="Easy online booking" status="active" />
              <OfferList text="Priority booking" status="active" />
              <OfferList text="1 guest pass included" status="active" />
            </PricingBox>
          </div>

          <PricingBox
            packageName="Unlimited Energy"
            price="140"
            duration="pack"
            subtitle="Best value for dedicated fitness lovers who dance multiple times per week."
          >
            <OfferList text="20 Class Tokens" status="active" />
            <OfferList text="Valid for 90 days" status="active" />
            <OfferList text="All class types included" status="active" />
            <OfferList text="Easy online booking" status="active" />
            <OfferList text="Priority booking" status="active" />
            <OfferList text="2 guest passes + free merchandise" status="active" />
          </PricingBox>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-700 dark:text-white/80 mb-4 text-base">
            Ready to start your fitness journey?{" "}
            <Link href="/signup" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              Sign up now
            </Link>{" "}
            or{" "}
            <Link href="/classes" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
              browse our classes
            </Link>
            .
          </p>
      </div>
      </div>
    </section>
  );
};

export default Pricing;
