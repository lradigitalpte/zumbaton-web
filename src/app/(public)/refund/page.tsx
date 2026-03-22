import PageHero from "@/components/Common/PageHero";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | Zumbaton",
  description: "Zumbaton refund policy. Package non-refundability, medical exceptions, and class cancellation rules.",
};

const RefundPage = () => {
  return (
    <>
      <PageHero
        title="Refund Policy"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Refund Policy" },
        ]}
        backgroundImage="/images/hero/hero.jpeg"
      />
      <section className="py-16 md:py-20 lg:py-28 bg-white dark:bg-gray-900">
        <div className="container px-3 sm:px-4 max-w-3xl mx-auto">
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString("en-SG", { year: "numeric", month: "long", day: "numeric" })}
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">1. Package Subscriptions</h2>
            <p>
              Package subscriptions are non-refundable. Unless there is a valid medical reason (as set out below), no refunds will be given for unused tokens or unused portions of your package. Token validity periods are fixed and cannot be extended.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">2. Medical Exceptions</h2>
            <p>
              You may cancel or terminate your membership for medical reasons. The following documentary proof must be provided and will be subject to approval by ZUMBATON management:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                A letter from a doctor at a Singapore hospital indicating that aerobics or step aerobics would seriously impair your health.
              </li>
            </ul>
            <p>
              If the documents are approved by management, your subscription may be put on hold until you are deemed fit to continue. Refunds in such cases are subject to management discretion and our internal policy. In the event of death or disability, liability for membership terminates as at the date of death or disability.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">3. Class Bookings and No-Show</h2>
            <p>
              Cancellation of a class after booking must be made at least 24 hours before the class date. If you cancel in time, the token will be returned to your account. A booked class with a &quot;NO SHOW&quot; will be forfeited; no token refund or credit will be given.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">4. Cancellations by ZUMBATON</h2>
            <p>
              If we cancel a class (e.g. instructor illness, low attendance, facility issues), your token will be refunded to your account automatically. We will notify you as early as possible.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">5. How to Request a Refund or Hold</h2>
            <p>
              To request a refund or membership hold based on medical grounds, contact us at{" "}
              <a href="mailto:hello@zumbaton.sg" className="text-green-600 dark:text-green-400 hover:underline">
                hello@zumbaton.sg
              </a>{" "}
              with your membership details and the required doctor&apos;s letter. All requests are subject to management approval. Approved refunds will be processed within a reasonable time to the original payment method.
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8">6. Contact</h2>
            <p>
              For refund or hold enquiries, email{" "}
              <a href="mailto:hello@zumbaton.sg" className="text-green-600 dark:text-green-400 hover:underline">
                hello@zumbaton.sg
              </a>{" "}
              or visit us at 2 Jalan Klapa, #2-A, Singapore 199314.
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

export default RefundPage;
