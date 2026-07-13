import { Metadata } from "next";
import PricingHero from "@/components/Pricing/PricingHero";
import PricingContent from "@/components/Pricing/PricingContent";
import PricingStructuredData from "@/components/Pricing/PricingStructuredData";
import {
  buildPricingMetadataDescription,
  getPublicPackages,
} from "@/lib/packages-server";

// Revalidate every 5 minutes so crawlers get fresh pricing without hitting the DB on every request.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [adultPackages, kidsPackages] = await Promise.all([
    getPublicPackages("adults"),
    getPublicPackages("kids"),
  ]);

  return {
    title: "Pricing & Packages | One Step Fitness",
    description: buildPricingMetadataDescription(adultPackages, kidsPackages),
  };
}

const PricingPage = async () => {
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
      <PricingHero />
      <PricingContent
        initialAdultPackages={adultPackages}
        initialKidsPackages={kidsPackages}
      />
    </>
  );
};

export default PricingPage;
