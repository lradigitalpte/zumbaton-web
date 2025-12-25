import AboutSectionOne from "@/components/About/AboutSectionOne";
import AboutSectionTwo from "@/components/About/AboutSectionTwo";
import ScrollUp from "@/components/Common/ScrollUp";
import HomeContact from "@/components/Contact/HomeContact";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import Video from "@/components/Video";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zumbaton - Dance Happy, Get Fit Naturally",
  description: "Fun into fitness with Zumbaton! Not hardcore training — just joyful movement with good energy. Join our community transforming lives one Zumba step at a time.",
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <AboutSectionOne />
      <AboutSectionTwo />
      <Video />
      <Testimonials />
      <Pricing />
      <HomeContact />
    </>
  );
}
