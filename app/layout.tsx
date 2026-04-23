"use client";

import "./globals.css";
import Script from "next/script";
import TopNav from "./components/TopNav";
import LegalFooter from "./components/LegalFooter";

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
