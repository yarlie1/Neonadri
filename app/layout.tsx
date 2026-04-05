import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Neonadri",
  description: "Meet people nearby",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-stone-50 text-stone-800">
        {/* Google Maps API */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        />

        {/* 전체 레이아웃 */}
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}