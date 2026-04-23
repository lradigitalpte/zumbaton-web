import { Providers } from "./providers";
import type { Metadata } from "next";
import "../styles/index.css";

const defaultWebUrl = "https://onestepfitness.sg";
const configuredWebUrl = process.env.NEXT_PUBLIC_WEB_APP_URL || process.env.NEXT_PUBLIC_APP_URL || defaultWebUrl;
const siteUrl = configuredWebUrl.includes("admin.") ? defaultWebUrl : configuredWebUrl;
const firstHeroImage = `${siteUrl}/images/hero/hero.jpeg`;

export const metadata: Metadata = {
  title: "One Step Fitness - one step to change your life",
  description:
    "One Step Fitness brings joyful movement, dance cardio, and step workouts for all levels. One step to change your life.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/logo/logo fav.png",
    shortcut: "/logo/logo fav.png",
    apple: "/logo/logo fav.png",
  },
  openGraph: {
    title: "One Step Fitness - one step to change your life",
    description:
      "One Step Fitness brings joyful movement, dance cardio, and step workouts for all levels. One step to change your life.",
    url: siteUrl,
    siteName: "One Step Fitness",
    images: [
      {
        url: firstHeroImage,
        width: 1200,
        height: 630,
        alt: "One Step Fitness",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Step Fitness - one step to change your life",
    description:
      "One Step Fitness brings joyful movement, dance cardio, and step workouts for all levels. One step to change your life.",
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
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P2GLX7DJ');`,
          }}
        />
        {/* End Google Tag Manager */}
      </head>
      <body className="bg-[#FCFCFC] dark:bg-black font-sans">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P2GLX7DJ"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

