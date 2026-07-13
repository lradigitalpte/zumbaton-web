import { getPublicPackages } from "@/lib/packages-server";
import PricingCarousel from "./PricingCarousel";

const Pricing = async () => {
  const adultPackages = await getPublicPackages("adults");

  return <PricingCarousel initialAdultPackages={adultPackages} />;
};

export default Pricing;
