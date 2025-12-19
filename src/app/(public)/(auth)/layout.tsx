"use client";

import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <ScrollToTop />
    </>
  );
}
