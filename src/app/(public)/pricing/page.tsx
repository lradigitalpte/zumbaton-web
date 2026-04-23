import { Metadata } from "next";
import PricingHero from "@/components/Pricing/PricingHero";
import PricingContent from "@/components/Pricing/PricingContent";

export const metadata: Metadata = {
  title: "Pricing & Packages | One Step Fitness",
  description: "Choose the right One Step Fitness package for your goals. Flexible plans for adults and kids with 1-month validity options.",
};

const PricingPage = () => {
  return (
    <>
      <PricingHero />
      <PricingContent />
    </>
  );
};

export default PricingPage;

