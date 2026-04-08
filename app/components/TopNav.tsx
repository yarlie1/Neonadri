"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  Menu,
  X,
  UserRound,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
} from "lucide-react";

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

  const desktopButtonClass =
    "inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="text-[26px] font-extrabold tracking-[-0.04em] text-[#1f1b18] sm:text-[28px]"
        >
          Neonadri
        </Link>

        {loading ? (
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#f3ebe2]" />
        ) : (
          <>
            <div className="hidden items-center gap-2 sm:flex">
              {user ? (
                <>
                  <Link href="/account" className={desktopButtonClass}>
                    <UserRound className="h-4 w-4" />
                    Account
                  </Link>

                  <Link href="/dashboard" className={desktopButtonClass}>
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#927d69]"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={desktopButtonClass}>
                    <LogIn className="h-4 w-4" />
                    Log In
                  </Link>

                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#927d69]"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="relative sm:hidden" ref={menuRef}>
              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dccfc2] bg-white text-[#5a5149] shadow-sm transition hover:bg-[#f4ece4]"
              >
                {menuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-[24px] border border-[#e7ddd2] bg-white shadow-[0_12px_28px_rgba(80,60,40,0.14)]">
                  <div className="flex flex-col p-2">
                    {user ? (
                      <>
                        <Link
                          href="/account"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                        >
                          <UserRound className="h-4 w-4" />
                          Account
                        </Link>

                        <Link
                          href="/dashboard"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f8efe7]"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          href="/login"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                        >
                          <LogIn className="h-4 w-4" />
                          Log In
                        </Link>

                        <Link
                          href="/signup"
                          onClick={() => setMenuOpen(false)}
                          className="inline-flex items-center gap-2 rounded-[18px] bg-[#a48f7a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
                        >
                          <UserPlus className="h-4 w-4" />
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
    </header>
  );
}