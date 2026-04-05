"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Navbar() {
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
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-semibold tracking-[0.2em] text-[#6b5f52]">
          NEONADRI
        </a>

        <nav className="flex items-center gap-3 text-sm">
          <a
            href="/"
            className="rounded-xl px-3 py-2 text-[#5a5149] transition hover:bg-[#f4ece4]"
          >
            Home
          </a>

          {userEmail ? (
            <>
              <a
                href="/dashboard"
                className="rounded-xl px-3 py-2 text-[#5a5149] transition hover:bg-[#f4ece4]"
              >
                Dashboard
              </a>

              <a
                href="/write"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 font-medium text-white transition hover:bg-[#927d69]"
              >
                Write
              </a>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="rounded-xl px-3 py-2 text-[#5a5149] transition hover:bg-[#f4ece4]"
              >
                Log In
              </a>

              <a
                href="/signup"
                className="rounded-xl bg-[#6b5f52] px-4 py-2 font-medium text-white transition hover:bg-[#5b5046]"
              >
                Sign Up
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}