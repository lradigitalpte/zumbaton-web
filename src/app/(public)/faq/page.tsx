import PageHero from "@/components/Common/PageHero";
import { FAQSection, FAQMap } from "@/components/FAQ";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Zumbaton",
  description: "Find answers to frequently asked questions about Zumbaton memberships, classes, billing, and more.",
};

const FAQPage = () => {
  return (
    <>
      <PageHero 
        title="FAQ"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "FAQ" }
        ]}
        backgroundImage="/images/images/20251227_0814_Energetic Zumbathon Vibes_simple_compose_01kdfdy7cse3htgvxspp828dwf.png"
      />
      <FAQSection />
      <FAQMap />
    </>
  );
};

export default FAQPage;
