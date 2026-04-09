"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  House,
  UserCircle2,
  Plus,
} from "lucide-react";

type SimpleUser = {
  id: string;
  email?: string | null;
} | null;

function PendingBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#c96f5d] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function BrandTagline() {
  return (
    <div className="text-right leading-tight">
      <div className="text-[10px] font-medium text-[#8b7f74] sm:text-[11px]">
        Want to meet someone?
      </div>
      <div className="text-[11px] font-semibold text-[#5a5149] sm:text-[12px]">
        Try Neonadri
      </div>
    </div>
  );
}

export default function TopNav() {
  const [user, setUser] = useState<SimpleUser>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        const nextUser = user ? { id: user.id, email: user.email } : null;
        setUser(nextUser);

        if (user) {
          const { count } = await supabase
            .from("match_requests")
            .select("*", { count: "exact", head: true })
            .eq("post_owner_user_id", user.id)
            .eq("status", "pending");

          if (!mounted) return;
          setPendingCount(count || 0);
        } else {
          setPendingCount(0);
        }
      } catch (error) {
        console.error("TopNav loadUser error:", error);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!mounted) return;

        const nextUser = session?.user
          ? { id: session.user.id, email: session.user.email }
          : null;

        setUser(nextUser);
        setMenuOpen(false);

        if (session?.user) {
          const { count } = await supabase
            .from("match_requests")
            .select("*", { count: "exact", head: true })
            .eq("post_owner_user_id", session.user.id)
            .eq("status", "pending");

          if (!mounted) return;
          setPendingCount(count || 0);
        } else {
          setPendingCount(0);
        }
      } catch (error) {
        console.error("TopNav auth change error:", error);
      }
    });

    return () => {
      mounted = false;
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
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("TopNav logout error:", error);
    } finally {
      setMenuOpen(false);
      window.location.href = "/";
    }
  };

  const btn =
    "inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]";

  const primary =
    "inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#927d69]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="text-[26px] font-extrabold tracking-[-0.04em] text-[#1f1b18] sm:text-[28px]"
        >
          Neonadri
        </Link>

        <>
          <div className="hidden items-center gap-3 sm:flex">
            <BrandTagline />

            <div className="h-8 w-px bg-[#e7ddd2]" />

            <Link href="/" className={btn}>
              <House className="h-4 w-4" />
              Home
            </Link>

            {user ? (
              <>
                <Link href="/dashboard" className={btn}>
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                  <PendingBadge count={pendingCount} />
                </Link>

                <Link href={`/profile/${user.id}`} className={btn}>
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </Link>

                <Link href="/write" className={primary}>
                  <Plus className="h-4 w-4" />
                  Create
                </Link>

                <button type="button" onClick={handleLogout} className={btn}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={btn}>
                  <LogIn className="h-4 w-4" />
                  Log In
                </Link>

                <Link href="/signup" className={primary}>
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="relative flex items-center gap-3 sm:hidden" ref={menuRef}>
            <BrandTagline />

            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dccfc2] bg-white text-[#5a5149] shadow-sm transition hover:bg-[#f4ece4]"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-[24px] border border-[#e7ddd2] bg-white shadow-[0_12px_28px_rgba(80,60,40,0.14)]">
                <div className="flex flex-col p-2">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                  >
                    <House className="h-4 w-4" />
                    Home
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex items-center justify-between gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </span>
                        <PendingBadge count={pendingCount} />
                      </Link>

                      <Link
                        href={`/profile/${user.id}`}
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                      >
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        href="/write"
                        onClick={() => setMenuOpen(false)}
                        className="inline-flex items-center gap-2 rounded-[18px] bg-[#a48f7a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
                      >
                        <Plus className="h-4 w-4" />
                        Create Meetup
                      </Link>

                      <div className="my-2 border-t border-[#f0e8de]" />

                      <button
                        type="button"
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
      </div>
    </header>
  );
}