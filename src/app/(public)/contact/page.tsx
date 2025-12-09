import PageHero from "@/components/Common/PageHero";
import { ContactLocations, ContactForm, ContactCTA } from "@/components/Contact";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Zumbaton",
  description: "Get in touch with Zumbaton. We're here to help you with any questions about our fitness classes and memberships.",
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
        backgroundImage="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=2070"
      />

      <ContactLocations />
      <ContactForm />
      <ContactCTA />
    </>
  );
};

export default ContactPage;
