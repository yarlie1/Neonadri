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

/* ✅ A/B 테스트 + 위치 조정된 태그라인 */
function BrandTagline() {
  const [variant, setVariant] = useState<"A" | "B" | "C">("A");

  useEffect(() => {
    const saved = localStorage.getItem("tagline_variant") as
      | "A"
      | "B"
      | "C"
      | null;

    if (saved) {
      setVariant(saved);
      return;
    }

    const options: ("A" | "B" | "C")[] = ["A", "B", "C"];
    const random = options[Math.floor(Math.random() * options.length)];
    localStorage.setItem("tagline_variant", random);
    setVariant(random);
  }, []);

  const content = {
    A: ["Want to meet someone?", "Start with Neonadri"],
    B: ["Meet someone new", "today"],
    C: ["Find your next meetup", "on Neonadri"],
  }[variant];

  return (
    <div className="ml-2 mt-[6px] text-left leading-tight">
      <div className="text-[11px] font-medium text-[#6f655c] sm:text-[12px]">
        {content[0]}
      </div>
      <div className="text-[11px] font-medium text-[#6f655c] sm:text-[12px]">
        {content[1]}
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
        
        {/* ✅ 로고 + 태그라인 */}
        <div className="flex items-start">
          <Link
            href="/"
            className="text-[26px] font-extrabold tracking-[-0.04em] text-[#1f1b18] sm:text-[28px]"
          >
            Neonadri
          </Link>
          <BrandTagline />
        </div>

        <>
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

          <div className="relative sm:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dccfc2] bg-white text-[#5a5149] shadow-sm transition hover:bg-[#f4ece4]"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </>
      </div>
    </header>
  );
}