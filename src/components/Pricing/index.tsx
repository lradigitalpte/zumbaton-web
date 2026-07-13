import { getPublicPackages } from "@/lib/packages-server";
import { getHomepagePreviewPackages } from "@/lib/packages-utils";
import PricingCarousel from "./PricingCarousel";

const Pricing = async () => {
  const adultPackages = await getPublicPackages("adults");

  return (
    <PricingCarousel
      initialAdultPackages={getHomepagePreviewPackages(adultPackages)}
    />
  );
};

export default Pricing;
