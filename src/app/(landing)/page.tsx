import { Metadata } from "next";
import HeroV2 from "@/components/DesignV2/HeroV2";
import FeaturesV2 from "@/components/DesignV2/FeaturesV2";
import ClassesV2 from "@/components/DesignV2/ClassesV2";
import InstructorsV2 from "@/components/DesignV2/InstructorsV2";
import TestimonialsV2 from "@/components/DesignV2/TestimonialsV2";
import CallToActionV2 from "@/components/DesignV2/CallToActionV2";
import ScrollUp from "@/components/Common/ScrollUp";

export const metadata: Metadata = {
  title: "Zumbaton - Dance Happy, Get Fit Naturally",
  description: "Fun into fitness with Zumbaton! Not hardcore training — just joyful movement with good energy. Join our community transforming lives one dance step at a time.",
};

export default function HomePage() {
  return (
    <main className="bg-white dark:bg-black min-h-screen text-gray-900 dark:text-white selection:bg-green-500 selection:text-black">
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
