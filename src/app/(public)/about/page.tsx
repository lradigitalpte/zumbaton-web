import AboutHero from "@/components/About/AboutHero";
import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import MissionVision from "@/components/About/MissionVision";
import CoreValues from "@/components/About/CoreValues";
import AboutCTA from "@/components/About/AboutCTA";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Zumbaton",
  description: "Learn more about Zumbaton and our mission to bring fitness and joy to your life.",
};

const AboutPage = () => {
  return (
    <>
      <AboutHero />
      <AboutSectionOne />
      <MissionVision />
      <AboutSectionTwo />
      <CoreValues />
      <AboutCTA />
    </>
  );
};

export default AboutPage;
