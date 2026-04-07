"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type SimpleUser = {
  id: string;
  email?: string | null;
} | null;

export default function TopNav() {
  const [user, setUser] = useState<SimpleUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user ? { id: user.id, email: user.email } : null);
      setLoading(false);
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user;
      setUser(nextUser ? { id: nextUser.id, email: nextUser.email } : null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-[28px] font-extrabold tracking-[-0.04em] text-[#1f1b18] sm:text-[30px]"
        >
          Neonadri
        </Link>

        {loading ? (
          <div className="h-10 w-32 rounded-full bg-[#f3ebe2] animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-2">
            <Link
              href="/account"
              className="rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Account
            </Link>

            <Link
              href="/dashboard"
              className="rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#927d69]"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Log In
            </Link>

            <Link
              href="/signup"
              className="rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#927d69]"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}