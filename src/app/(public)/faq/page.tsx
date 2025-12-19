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
        backgroundImage="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070"
      />
      <FAQSection />
      <FAQMap />
    </>
  );
};

export default FAQPage;
