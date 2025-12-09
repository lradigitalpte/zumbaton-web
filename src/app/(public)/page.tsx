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
  title: "Zumbaton - Book Your Fitness Classes",
  description: "Book and manage your fitness classes with Zumbaton. Join our vibrant community and transform your fitness journey.",
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
