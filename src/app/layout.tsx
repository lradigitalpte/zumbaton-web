import { Providers } from "./providers";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "../styles/index.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zumbaton - Book Your Fitness Classes",
  description: "Book and manage your fitness classes with Zumbaton",
  icons: {
    icon: "/logo/logo fav.png",
    shortcut: "/logo/logo fav.png",
    apple: "/logo/logo fav.png",
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

