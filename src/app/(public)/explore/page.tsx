import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import ScrollUp from "@/components/Common/ScrollUp";
import HomeContact from "@/components/Contact/HomeContact";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import CommunityHighlights from "@/components/Community/CommunityHighlights";
import Video from "@/components/Video";
import ExploreClassesShowcase from "@/components/Explore/ExploreClassesShowcase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "One Step Fitness - one step to change your life",
  description: "Move, sweat, and smile with One Step Fitness. Group classes for all levels, from dance cardio to step workouts.",
};

export const dynamic = "force-dynamic";

export default function ExplorePage() {
  return (
    <>
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
