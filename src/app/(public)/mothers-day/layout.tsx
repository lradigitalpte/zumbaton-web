import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mother's Day Promo | One Step Fitness",
  description:
    "Mother's Day promo classes on May 9 and May 10, 2026. $30. WhatsApp or call One Step Fitness for enquiries and payment details.",
  openGraph: {
    title: "Mother's Day Promo | One Step Fitness",
    description:
      "Mother's Day promo classes. $30. WhatsApp or call +65 8492 7347 for enquiries and payment details.",
  },
};

export default function MothersDayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
