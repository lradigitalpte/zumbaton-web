import PageHero from "@/components/Common/PageHero";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Zumbaton",
  description: "Zumbaton terms and conditions. Membership, bookings, safety, and liability for aerobics and step aerobics classes.",
};

const TermsPage = () => {
  return (
    <>
      <PageHero
        title="Terms of Service"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms of Service" },
        ]}
        backgroundImage="/images/hero/hero.jpeg"
      />
      <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900">
        <div className="container px-3 sm:px-4 max-w-3xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString("en-SG", { year: "numeric", month: "long", day: "numeric" })}
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Acceptance of Terms</h2>
            <p>
              These terms and conditions govern your rights and obligations as a ZUMBATON member. By using our website, booking platform, or attending our aerobics and step aerobics classes, you agree to be bound by these Terms. Please read and understand them before signing any membership agreement. Each member who agrees is individually and severally bound. If you do not agree, please do not use our services.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. Membership</h2>
            <p>
              Membership is personal to you and is non-transferable and non-refundable. You may not loan, sell, or otherwise permit your membership or package to be used by any third party. A fine may be charged for any breach based on sessions misused. ZUMBATON management may assign the benefit of any agreement to another person at any time with notice to you.
            </p>
            <p>
              If you are under 16 years of age, you confirm that you have the express permission of your parent or guardian to join ZUMBATON and use our facilities and services. All references to &quot;you&quot; in these Terms include you and/or your parent or guardian on your behalf. If you are aged between 5 and 15, the consent of a parent or guardian is required upon joining, and a parent or guardian must be present during classes.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. Bookings and Cancellations</h2>
            <p>
              Class booking is available daily from 08:00 to 22:00 via our website. Cancellation of a class after booking must be made at least 24 hours before the class date. A booked class with a &quot;NO SHOW&quot; will be forfeited (no token refund). If you cancel in time, the token will be returned to your account.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">4. Freezing, Suspension, Cancellation and Termination</h2>
            <p>
              You may cancel or terminate your membership for medical reasons if a doctor provides certification that your participation in ZUMBATON step aerobics activities would impair your health. In the event of death or disability, liability for membership terminates as at the date of death or disability.
            </p>
            <p>
              If our facilities become temporarily unavailable (e.g. fire, flood, loss of lease), we may freeze your membership for the period they were unavailable. ZUMBATON management retains the sole and absolute right to cancel, freeze, and/or suspend the membership of any person for any reason. If cancellation or suspension is due to a breach of these Terms, our Membership Policies, or Safety Notices, or due to damage caused by you, the balance of your financial obligations under your agreement shall become immediately due and payable.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">5. Physical Condition and Assumption of Risk</h2>
            <p>
              You warrant that you are in good physical and mental condition and that you know of no medical or other reason why you are not capable of engaging in active or passive exercise, or why such exercise would be detrimental to your health, safety, comfort, or physical condition. You agree to exercise responsibly and with due care for your own medical, health, and mental condition at all times.
            </p>
            <p>
              You understand and acknowledge the risk of injury arising from ZUMBATON activities. You willingly assume all risks associated with the exercise choreography. ZUMBATON is independently owned and operated. You release, indemnify, and hold harmless ZUMBATON&apos;s employees, owners, and partners in respect of any and all injury, disability, death, loss, or damage to person and/or property that may arise from or in connection with your use of the studio or otherwise related to your membership. This release is intended to be as broad and inclusive as permitted by applicable law. If any portion is held invalid, the balance remains in full force and effect.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">6. Medical Expenses</h2>
            <p>
              You will be liable for your own medical expenses in cases where there is personal injury during classes. You acknowledge that you fully take responsibility for all risk of injuries arising from aerobics and step aerobics classes and do not hold the trainers or management liable for any injury arising from the classes.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">7. Attire and Safety</h2>
            <p>
              You must wear covered shoes (excluding boots) for all ZUMBATON sessions, whether indoors or outdoors. We highly recommend active sportswear and bringing bottled water for hydration and water breaks.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">8. Media Consent</h2>
            <p>
              By participating in ZUMBATON activities, you consent to participate in the production of media (including image, likeness, voice, performance, and visual works) that may be personally identifiable and published on social media or elsewhere. You agree to such use unless you inform us otherwise in writing.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">9. Conduct</h2>
            <p>
              We expect all participants to behave respectfully towards instructors, staff, and other members. ZUMBATON reserves the right to refuse service or revoke membership in case of misconduct or breach of these Terms.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">10. Contact</h2>
            <p>
              For questions about these Terms, contact us at{" "}
              <a href="mailto:hello@zumbaton.sg" className="text-green-600 dark:text-green-400 hover:underline">
                hello@zumbaton.sg
              </a>
              , or visit us at 2 Jalan Klapa, #2-A, Singapore 199314. An e-copy of the terms and conditions may be sent to your email; any letter of acceptance supplements the agreement.
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

export default TermsPage;
