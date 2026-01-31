import { Providers } from "./providers";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "../styles/index.css";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_WEB_APP_URL || "https://zumbaton.sg";
const firstHeroImage = `${siteUrl}/images/landing2.png`;

export const metadata: Metadata = {
  title: "Zumbaton - Dance Happy, Get Fit Naturally",
  description:
    "Fun into fitness with Zumbaton! Not hardcore training — just joyful movement with good energy. Join our community transforming lives one Zumba step at a time.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/logo/logo fav.png",
    shortcut: "/logo/logo fav.png",
    apple: "/logo/logo fav.png",
  },
  openGraph: {
    title: "Zumbaton - Dance Happy, Get Fit Naturally",
    description:
      "Fun into fitness with Zumbaton! Not hardcore training — just joyful movement with good energy. Join our community transforming lives one Zumba step at a time.",
    url: siteUrl,
    siteName: "Zumbaton",
    images: [
      {
        url: firstHeroImage,
        width: 1200,
        height: 630,
        alt: "Zumbaton - Fun into Fitness",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zumbaton - Dance Happy, Get Fit Naturally",
    description:
      "Fun into fitness with Zumbaton! Not hardcore training — just joyful movement with good energy. Join our community transforming lives one Zumba step at a time.",
    images: [firstHeroImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

