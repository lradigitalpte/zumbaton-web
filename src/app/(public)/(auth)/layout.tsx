"use client";

import Header from "@/components/Header";
import FloatingSideActions from "@/components/FloatingSideActions";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <FloatingSideActions />
    </>
  );
}
