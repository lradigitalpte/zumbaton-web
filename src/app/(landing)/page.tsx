import { Metadata } from "next";
import HeroV2 from "@/components/DesignV2/HeroV2";
import FeaturesV2 from "@/components/DesignV2/FeaturesV2";
import ClassesV2 from "@/components/DesignV2/ClassesV2";
import InstructorsV2 from "@/components/DesignV2/InstructorsV2";
import TestimonialsV2 from "@/components/DesignV2/TestimonialsV2";
import CallToActionV2 from "@/components/DesignV2/CallToActionV2";
import ScrollUp from "@/components/Common/ScrollUp";
import Pricing from "@/components/Pricing";
import PricingStructuredData from "@/components/Pricing/PricingStructuredData";
import {
  buildPricingMetadataDescription,
  getPublicPackages,
} from "@/lib/packages-server";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [adultPackages, kidsPackages] = await Promise.all([
    getPublicPackages("adults"),
    getPublicPackages("kids"),
  ]);

  const pricingDescription = buildPricingMetadataDescription(
    adultPackages,
    kidsPackages
  );

  return {
    title: "One Step Fitness - Dance Happy, Get Fit Naturally",
    description: `Fun into fitness with One Step Fitness! ${pricingDescription}`,
  };
}

export default async function HomePage() {
  const [adultPackages, kidsPackages] = await Promise.all([
    getPublicPackages("adults"),
    getPublicPackages("kids"),
  ]);

  return (
    <main className="bg-white dark:bg-black min-h-screen text-gray-900 dark:text-white selection:bg-green-500 selection:text-black">
      <PricingStructuredData
        adultPackages={adultPackages}
        kidsPackages={kidsPackages}
      />
      <ScrollUp />
      <HeroV2 />
      <FeaturesV2 />
      <ClassesV2 />
      <InstructorsV2 />
      <TestimonialsV2 />
      <Pricing />
      <CallToActionV2 />
    </main>
  );
}
