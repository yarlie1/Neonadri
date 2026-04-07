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
        {mapsKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places`}
            strategy="beforeInteractive"
          />
        )}

        <TopNav />

        {/* 🔥 핵심 wrapper */}
        <div className="mx-auto w-full max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6">
          {children}
        </div>
      </body>
    </html>
  );
}