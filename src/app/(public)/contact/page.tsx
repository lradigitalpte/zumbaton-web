import PageHero from "@/components/Common/PageHero";
import { ContactLocations, ContactForm, ContactCTA } from "@/components/Contact";

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
        backgroundImage="/images/hero/contact.jpeg"
      />

      <ContactLocations />
      <ContactForm />
      <ContactCTA />
    </>
  );
};

export default ContactPage;
