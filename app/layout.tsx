"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import TopNav from "./components/TopNav";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? "");
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? "");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <html lang="en">
      <body className="bg-[#f7f1ea] text-[#2f2a26]">
        <TopNav userEmail={userEmail} onLogout={handleLogout} />
        {children}
      </body>
    </html>
  );
}