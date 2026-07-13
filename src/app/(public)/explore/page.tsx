import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import ScrollUp from "@/components/Common/ScrollUp";
import HomeContact from "@/components/Contact/HomeContact";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import CommunityHighlights from "@/components/Community/CommunityHighlights";
import Video from "@/components/Video";
import ExploreClassesShowcase from "@/components/Explore/ExploreClassesShowcase";
import PricingStructuredData from "@/components/Pricing/PricingStructuredData";
import {
  buildPricingMetadataDescription,
  getPublicPackages,
} from "@/lib/packages-server";
import { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [adultPackages, kidsPackages] = await Promise.all([
    getPublicPackages("adults"),
    getPublicPackages("kids"),
  ]);

  return {
    title: "One Step Fitness - one step to change your life",
    description: buildPricingMetadataDescription(adultPackages, kidsPackages),
  };
}

export default async function ExplorePage() {
  const [adultPackages, kidsPackages] = await Promise.all([
    getPublicPackages("adults"),
    getPublicPackages("kids"),
  ]);

  return (
    <>
      <PricingStructuredData
        adultPackages={adultPackages}
        kidsPackages={kidsPackages}
      />
      <ScrollUp />
      <Hero />
      <AboutSectionOne />
      <AboutSectionTwo />
      <ExploreClassesShowcase />
      <Video />
      <CommunityHighlights />
      <Pricing />
      <HomeContact />
    </>
  );
}
