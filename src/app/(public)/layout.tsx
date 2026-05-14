"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
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
      <div className="min-h-0 min-w-0 max-w-full overflow-x-clip">
        <Header />
        {children}
        {!isAuthPage && <Footer />}
        <ScrollToTop />
      </div>
    </WhatsAppModalProvider>
  );
}
