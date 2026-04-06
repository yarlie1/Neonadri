"use client";

import "./globals.css";
import Script from "next/script";
import TopNav from "./components/TopNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <html lang="en">
      <body className="bg-[#f7f1ea] text-[#2f2a26]">
        {mapsKey ? (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`}
            strategy="beforeInteractive"
          />
        ) : null}
        <TopNav />
        {children}
      </body>
    </html>
  );
}