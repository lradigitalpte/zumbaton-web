import AboutHero from "@/components/About/AboutHero";
import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import MissionVision from "@/components/About/MissionVision";
import CoreValues from "@/components/About/CoreValues";
import AboutCTA from "@/components/About/AboutCTA";
import ExploreClassesShowcase from "@/components/Explore/ExploreClassesShowcase";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | One Step Fitness - one step to change your life",
  description: "Learn more about One Step Fitness and our mission to bring fitness and joy to your life.",
};

const AboutPage = () => {
  return (
    <>
      <AboutHero />
      <AboutSectionOne />
      <MissionVision />
      <AboutSectionTwo />
      <ExploreClassesShowcase />
      <CoreValues />
      <AboutCTA />
    </>
  );
};

export default AboutPage;
