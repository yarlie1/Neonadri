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
    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#c96f5d] px-1.5 py-0.5 text-[10px] font-bold text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ✅ 태그라인 (A/B 테스트 + 아래로 살짝 내림) */
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

        setPendingCount(count || 0);
      }
    };

    loadUser();

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
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* 외부 클릭 시 메뉴 닫기 */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const btn =
    "inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm text-[#5a5149] hover:bg-[#f4ece4]";

  const primary =
    "inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm text-white hover:bg-[#927d69]";

  return (
    <header className="sticky top-0 z-50 border-b bg-[#fffaf5]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        
        {/* ✅ 로고 + 문구 */}
        <div className="flex items-start">
          <Link
            href="/"
            className="text-[26px] font-extrabold text-[#1f1b18]"
          >
            Neonadri
          </Link>
          <BrandTagline />
        </div>

        {/* 데스크탑 메뉴 */}
        <div className="hidden sm:flex gap-2">
          <Link href="/" className={btn}>
            <House className="h-4 w-4" /> Home
          </Link>

          {user ? (
            <>
              <Link href="/dashboard" className={btn}>
                Dashboard <PendingBadge count={pendingCount} />
              </Link>
              <Link href={`/profile/${user.id}`} className={btn}>
                Profile
              </Link>
              <Link href="/write" className={primary}>
                Create
              </Link>
              <button onClick={handleLogout} className={btn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={btn}>
                Log In
              </Link>
              <Link href="/signup" className={primary}>
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* 모바일 메뉴 */}
        <div className="relative sm:hidden" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-56 bg-white shadow rounded-xl">
              <div className="flex flex-col">
                <Link href="/" className="p-3">Home</Link>

                {user ? (
                  <>
                    <Link href="/dashboard" className="p-3">
                      Dashboard
                    </Link>
                    <Link href={`/profile/${user.id}`} className="p-3">
                      Profile
                    </Link>
                    <Link href="/write" className="p-3">
                      Create Meetup
                    </Link>
                    <button onClick={handleLogout} className="p-3 text-left">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="p-3">
                      Log In
                    </Link>
                    <Link href="/signup" className="p-3">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}