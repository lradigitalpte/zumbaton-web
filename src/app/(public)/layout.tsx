"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FloatingSideActions from "@/components/FloatingSideActions";
import { WhatsAppModalProvider } from "@/context/WhatsAppModalContext";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/signin') || pathname?.startsWith('/signup');
  // Dedicated conversion landing pages render their own minimal chrome.
  const isLandingPage = pathname === '/start' || pathname === '/start/success';

  return (
    <WhatsAppModalProvider>
      <div className="min-h-0 min-w-0 max-w-full overflow-x-clip">
        {!isLandingPage && <Header />}
        {children}
        {!isAuthPage && !isLandingPage && <Footer />}
        {!isLandingPage && <FloatingSideActions />}      </div>
    </WhatsAppModalProvider>
  );
}
