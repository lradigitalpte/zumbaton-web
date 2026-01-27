"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import EarlyBirdBanner from "@/components/EarlyBirdBanner";
import { WhatsAppModalProvider } from "@/context/WhatsAppModalContext";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/signin') || pathname?.startsWith('/signup');
  
  return (
    <WhatsAppModalProvider>
      <EarlyBirdBanner />
      <Header />
      {children}
      {!isAuthPage && <Footer />}
      <ScrollToTop />
    </WhatsAppModalProvider>
  );
}
