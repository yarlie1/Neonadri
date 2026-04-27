import "./globals.css";
import Script from "next/script";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import TopNav from "./components/TopNav";
import LegalFooter from "./components/LegalFooter";
import { OG_IMAGE_VERSION } from "../lib/socialPreview";
import { createClient } from "../lib/supabase/server";
import { loadNavIndicatorState } from "../lib/navIndicators";
import { normalizeUserTimeZone, USER_TIME_ZONE_COOKIE } from "../lib/userTimeZone";

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
        url: `/opengraph-image?${OG_IMAGE_VERSION}`,
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
    images: [`/opengraph-image?${OG_IMAGE_VERSION}`],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );
  const initialUser = user
    ? {
        id: user.id,
        email: user.email,
      }
    : null;
  const initialIndicators = user
    ? await loadNavIndicatorState(supabase, user.id, userTimeZone).catch((error) => {
        console.error("Root layout nav indicator preload failed", error);
        return {
          pendingCount: 0,
          acceptedSentCount: 0,
          upcomingMatchCount: 0,
          hasNewChatActivity: false,
        };
      })
    : undefined;

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#dfe6eb] text-[#2f3a42]">
        {mapsKey ? (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${mapsKey}&libraries=places&language=en&region=US`}
            strategy="beforeInteractive"
          />
        ) : null}

        <TopNav initialUser={initialUser} initialIndicators={initialIndicators} />
        {children}
        <LegalFooter />
      </body>
    </html>
  );
}
