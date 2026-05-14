import { Metadata } from "next";
import HeroV2 from "@/components/DesignV2/HeroV2";
import FeaturesV2 from "@/components/DesignV2/FeaturesV2";
import ClassesV2 from "@/components/DesignV2/ClassesV2";
import InstructorsV2 from "@/components/DesignV2/InstructorsV2";
import TestimonialsV2 from "@/components/DesignV2/TestimonialsV2";
import CallToActionV2 from "@/components/DesignV2/CallToActionV2";
import ScrollUp from "@/components/Common/ScrollUp";

export const metadata: Metadata = {
  title: "One Step Fitness - Modern Fitness Experience",
  description: "Experience the new era of fitness with One Step Fitness. Move, sweat, and smile.",
};

export default function DesignV2Page() {
  return (
    <main className="min-h-screen bg-[#f6f4ee] text-gray-900 selection:bg-lime-500 selection:text-black dark:bg-black dark:text-white">
      <ScrollUp />
      <HeroV2 />
      <FeaturesV2 />
      <ClassesV2 />
      <InstructorsV2 />
      <TestimonialsV2 />
      <CallToActionV2 />
    </main>
  );
}
