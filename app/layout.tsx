import "./globals.css";
import Script from "next/script";
import type { Metadata } from "next";
import TopNav from "./components/TopNav";
import LegalFooter from "./components/LegalFooter";

const APP_URL = process.env.APP_BASE_URL?.trim() || "https://neonadri.net";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Neonadri",
    template: "%s | Neonadri",
  },
  description:
    "Discover nearby meetups, see who is hosting, and browse at a calmer pace.",
  openGraph: {
    title: "A calmer way to meet someone new.",
    description:
      "Discover nearby meetups, see who is hosting, and browse at a calmer pace.",
    url: APP_URL,
    siteName: "Neonadri",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Neonadri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A calmer way to meet someone new.",
    description:
      "Discover nearby meetups, see who is hosting, and browse at a calmer pace.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#dfe6eb] text-[#2f3a42]">
        {mapsKey ? (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&language=en&region=US`}
            strategy="beforeInteractive"
          />
        ) : null}

        <TopNav />
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
