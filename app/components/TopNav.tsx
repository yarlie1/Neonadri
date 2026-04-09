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
    <span className="ml-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#c96f5d] px-1.5 py-0.5 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export default function TopNav() {
  const [user, setUser] = useState<SimpleUser>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const nextUser = user ? { id: user.id, email: user.email } : null;
      setUser(nextUser);

      if (user) {
        const { count } = await supabase
          .from("match_requests")
          .select("*", { count: "exact", head: true })
          .eq("post_owner_user_id", user.id)
          .eq("status", "pending");

        setPendingCount(count || 0);
      }

      setLoading(false);
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

        setPendingCount(count || 0);
      } else {
        setPendingCount(0);
      }

      setLoading(false);
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
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    window.location.href = "/";
  };

  const btn =
    "inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#5a5149] hover:bg-[#f4ece4]";

  const primary =
    "inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#927d69]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-extrabold">
          Neonadri
        </Link>

        {loading ? (
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#f3ebe2]" />
        ) : (
          <>
            {/* desktop */}
            <div className="hidden items-center gap-2 sm:flex">
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

                  <button onClick={handleLogout} className={btn}>
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

            {/* mobile */}
            <div className="relative sm:hidden" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="h-11 w-11 rounded-full border bg-white"
              >
                {menuOpen ? <X /> : <Menu />}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-14 w-64 rounded-2xl border bg-white p-2 shadow-lg">
                  <Link href="/" className="menu">
                    Home
                  </Link>

                  {user ? (
                    <>
                      <Link href="/dashboard" className="menu flex justify-between">
                        <span>Dashboard</span>
                        <PendingBadge count={pendingCount} />
                      </Link>

                      <Link href={`/profile/${user.id}`} className="menu">
                        Profile
                      </Link>

                      <Link href="/write" className="menu font-semibold text-[#a48f7a]">
                        + Create Meetup
                      </Link>

                      <button onClick={handleLogout} className="menu text-[#8b5e3c]">
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" className="menu">
                        Log In
                      </Link>

                      <Link href="/signup" className="menu font-semibold">
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .menu {
          display: block;
          padding: 12px 16px;
          border-radius: 14px;
        }
        .menu:hover {
          background: #f4ece4;
        }
      `}</style>
    </header>
  );
}