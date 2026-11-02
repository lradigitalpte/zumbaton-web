import PageHero from "@/components/Common/PageHero";
import { ContactLocations, ContactForm, ContactCTA } from "@/components/Contact";
import { SITE_IMAGES } from "@/data/site-images";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | One Step Fitness",
  description: "Get in touch with One Step Fitness. We're here to help you with any questions about our fitness classes and memberships.",
};

const ContactPage = () => {
  return (
    <>
      <PageHero 
        title="Contact Us"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Contact Us" }
        ]}
        backgroundImage={SITE_IMAGES.communityGroupFive}
      />

      <ContactLocations />
      <ContactForm />
      <ContactCTA />
    </>
  );
};

export default ContactPage;
