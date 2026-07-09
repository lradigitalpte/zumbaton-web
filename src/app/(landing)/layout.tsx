"use client";

import Link from "next/link";
import { WhatsAppModalProvider } from "@/context/WhatsAppModalContext";
import FloatingSideActions from "@/components/FloatingSideActions";
import Footer from "@/components/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WhatsAppModalProvider>
      <div className="min-h-0 min-w-0 max-w-full overflow-x-clip">
        {/* Home button - no full nav, just link to main site */}
        <div className="fixed top-6 right-6 z-[9999]">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/90 dark:bg-black/80 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-semibold text-sm shadow-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
        >
          Home
        </Link>
      </div>
      {children}
      <Footer />
      <FloatingSideActions />
      </div>
    </WhatsAppModalProvider>
  );
}
