import PageHero from "@/components/Common/PageHero";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Zumbaton",
  description: "Zumbaton privacy policy. Learn how we collect, use, and protect your personal information.",
};

const PrivacyPage = () => {
  return (
    <>
      <PageHero
        title="Privacy Policy"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy" },
        ]}
        backgroundImage="/images/images/20251227_0814_Energetic Zumbathon Vibes_simple_compose_01kdfdy7cse3htgvxspp828dwf.png"
      />
      <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900">
        <div className="container px-3 sm:px-4 max-w-3xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString("en-SG", { year: "numeric", month: "long", day: "numeric" })}
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Introduction</h2>
            <p>
              Zumbaton (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, book classes, or interact with our services.
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. Information We Collect</h2>
            <p>
              We may collect personal information such as your name, email address, phone number, and payment details when you create an account, book classes, or contact us. We also collect usage data to improve our services.
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. How We Use Your Information</h2>
            <p>
              We use your information to process bookings, send confirmations and reminders, manage your account, process payments, and communicate with you about our classes and offers. We may also use anonymized data to improve our services.
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">4. Data Security</h2>
            <p>
              We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">5. Media and Likeness</h2>
            <p>
              When you participate in ZUMBATON activities, we may produce or use media (including your image, likeness, voice, performance, and visual works) that may be personally identifiable. Such media may be published on social media or elsewhere. By participating, you consent to this use unless you inform us otherwise in writing. See our Terms of Service for further details.
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">6. Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal data. You may also withdraw consent or object to certain processing. Contact us at{" "}
              <a href="mailto:hello@zumbaton.sg" className="text-green-600 dark:text-green-400 hover:underline">
                hello@zumbaton.sg
              </a>{" "}
              to exercise these rights.
            </p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">7. Contact Us</h2>
            <p>
              For questions about this Privacy Policy, contact us at{" "}
              <a href="mailto:hello@zumbaton.sg" className="text-green-600 dark:text-green-400 hover:underline">
                hello@zumbaton.sg
              </a>
              , or visit us at 2 Jalan Klapa, #2-A, Singapore 199314.
            </p>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default PrivacyPage;
