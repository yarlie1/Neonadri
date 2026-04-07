"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";

type SimpleUser = {
  id: string;
  email?: string | null;
} | null;

export default function TopNav() {
  const [user, setUser] = useState<SimpleUser>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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
      setMenuOpen(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="shrink-0 text-[28px] font-extrabold tracking-[-0.04em] text-[#1f1b18] sm:text-[30px]"
          >
            Neonadri
          </Link>

          {loading ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-[#f3ebe2] sm:h-10 sm:w-32 sm:rounded-full" />
          ) : (
            <>
              {/* Desktop menu */}
              <div className="hidden items-center gap-2 sm:flex">
                {user ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Mobile menu */}
              <div className="relative sm:hidden" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Open menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dccfc2] bg-white text-[#5a5149] shadow-sm transition hover:bg-[#f4ece4]"
                >
                  <span className="text-xl leading-none">☰</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-2xl border border-[#e7ddd2] bg-white shadow-[0_12px_28px_rgba(80,60,40,0.14)]">
                    <div className="flex flex-col p-2">
                      {user ? (
                        <>
                          <Link
                            href="/account"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                          >
                            Account
                          </Link>

                          <Link
                            href="/dashboard"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                          >
                            Dashboard
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="rounded-xl px-4 py-3 text-left text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f8efe7]"
                          >
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/login"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-xl px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                          >
                            Log In
                          </Link>

                          <Link
                            href="/signup"
                            onClick={() => setMenuOpen(false)}
                            className="rounded-xl bg-[#a48f7a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
                          >
                            Sign Up
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}