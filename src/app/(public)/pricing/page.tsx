import { Metadata } from "next";
import PricingHero from "@/components/Pricing/PricingHero";
import PricingContent from "@/components/Pricing/PricingContent";

export const metadata: Metadata = {
  title: "Pricing & Packages | Zumbaton",
  description: "Choose the perfect Zumbaton package for you. Flexible token packages for adults and kids. Find your dance fitness vibe with packages that fit your schedule.",
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

