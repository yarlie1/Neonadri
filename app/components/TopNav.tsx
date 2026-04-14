"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
    <div className="text-left leading-[1.05]">
      <div className="text-[11px] font-medium text-[#6f655c] sm:text-[12px]">
        {content[0]}
      </div>
      <div className="text-[11px] font-medium text-[#6f655c] sm:text-[12px]">
        {content[1]}
      </div>
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TopNav() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SimpleUser>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const loggingOutRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    let mounted = true;

    const resetSignedOutState = () => {
      setUser(null);
      setPendingCount(0);
      setMenuOpen(false);
      setIsLoggingOut(false);
      loggingOutRef.current = false;
    };

    const loadPendingCount = async (userId: string) => {
      const { count } = await supabase
        .from("match_requests")
        .select("*", { count: "exact", head: true })
        .eq("post_owner_user_id", userId)
        .eq("status", "pending");

      return count || 0;
    };

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted || loggingOutRef.current) return;

        const nextUser = user ? { id: user.id, email: user.email } : null;
        setUser(nextUser);

        if (user) {
          const count = await loadPendingCount(user.id);
          if (!mounted || loggingOutRef.current) return;
          setPendingCount(count);
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

        if (_event === "SIGNED_OUT" || !session?.user) {
          resetSignedOutState();
          return;
        }

        if (loggingOutRef.current) return;

        const nextUser = session?.user
          ? { id: session.user.id, email: session.user.email }
          : null;

        setUser(nextUser);
        setMenuOpen(false);

        if (session?.user) {
          const count = await loadPendingCount(session.user.id);
          if (!mounted || loggingOutRef.current) return;
          setPendingCount(count);
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
  }, [supabase]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    loggingOutRef.current = true;
    setIsLoggingOut(true);
    setMenuOpen(false);
    setUser(null);
    setPendingCount(0);

    try {
      sessionStorage.clear();
      localStorage.removeItem("tagline_variant");

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 2500);

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
      } finally {
        window.clearTimeout(timeoutId);
      }

      await supabase.auth.signOut({ scope: "local" });
    } catch (error) {
      console.error("TopNav logout error:", error);
    } finally {
      window.location.replace("/?logged_out=1");
      window.setTimeout(() => {
        setIsLoggingOut(false);
        loggingOutRef.current = false;
      }, 2000);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const navBtn = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
      active
        ? "border-[#d6b79e] bg-[#f3e4d4] text-[#3f3226] shadow-[0_10px_24px_rgba(120,86,52,0.12)]"
        : "border-[#dccfc2] bg-white/90 text-[#5a5149] hover:bg-[#f4ece4]"
    }`;

  const primary =
    "inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white shadow-[0_12px_24px_rgba(108,77,48,0.22)] transition hover:bg-[#927d69]";

  const mobileItem =
    "inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/88 backdrop-blur-xl">
      <div className="border-b border-[#f1e4d7] bg-[linear-gradient(180deg,rgba(252,245,237,0.96),rgba(255,250,245,0.9))]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#f7d9bf,_#c89277_78%)] text-base font-bold tracking-[-0.05em] text-white shadow-[0_14px_30px_rgba(160,111,82,0.28)]"
              onClick={closeMenu}
              aria-label="Neonadri home"
            >
              N
            </Link>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <Link
                  href="/"
                  className="truncate text-[22px] font-extrabold tracking-[-0.05em] text-[#1f1b18] sm:text-[25px]"
                  onClick={closeMenu}
                >
                  Neonadri
                </Link>
                <span className="hidden rounded-full border border-[#eadccd] bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#9a6e55] sm:inline-flex">
                  Social meetup
                </span>
              </div>
              <div className="hidden border-l border-[#eadccd] pl-3 sm:block">
                <BrandTagline />
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/" className={navBtn(isActivePath(pathname, "/"))}>
              <House className="h-4 w-4" />
              Home
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={navBtn(isActivePath(pathname, "/dashboard"))}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                  <PendingBadge count={pendingCount} />
                </Link>

                <Link
                  href={`/profile/${user.id}`}
                  className={navBtn(pathname.startsWith("/profile/"))}
                >
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </Link>

                <Link href="/write" className={primary}>
                  <Plus className="h-4 w-4" />
                  Create
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`${navBtn(false)} ${
                    isLoggingOut
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={navBtn(isActivePath(pathname, "/login"))}>
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
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dccfc2] bg-white/95 text-[#5a5149] shadow-[0_10px_24px_rgba(90,70,48,0.12)] transition hover:bg-[#f4ece4]"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-[28px] border border-[#e7ddd2] bg-[#fffaf6] shadow-[0_22px_44px_rgba(80,60,40,0.18)]">
                <div className="border-b border-[#efe3d8] bg-[linear-gradient(180deg,#fff5eb,#fffaf6)] px-5 py-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#b27f61]">
                    Neonadri
                  </div>
                  <div className="mt-1 text-base font-semibold text-[#2d231d]">
                    Meet someone new without the awkward start.
                  </div>
                  <div className="mt-1 text-sm text-[#786b61]">
                    Warm meetups, clear plans, and a softer way to begin.
                  </div>
                </div>

                <div className="flex flex-col p-3">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={`${mobileItem} ${isActivePath(pathname, "/") ? "bg-[#f4e6d8] text-[#3f3226]" : ""}`}
                  >
                    <House className="h-4 w-4" />
                    Home
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className={`inline-flex items-center justify-between gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                          isActivePath(pathname, "/dashboard")
                            ? "bg-[#f4e6d8] text-[#3f3226]"
                            : "text-[#5a5149] hover:bg-[#f4ece4]"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </span>
                        <PendingBadge count={pendingCount} />
                      </Link>

                      <Link
                        href={`/profile/${user.id}`}
                        onClick={closeMenu}
                        className={`${mobileItem} ${pathname.startsWith("/profile/") ? "bg-[#f4e6d8] text-[#3f3226]" : ""}`}
                      >
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        href="/write"
                        onClick={closeMenu}
                        className="mt-1 inline-flex items-center gap-2 rounded-[18px] bg-[#a48f7a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
                      >
                        <Plus className="h-4 w-4" />
                        Create Meetup
                      </Link>

                      <div className="my-3 border-t border-[#f0e8de]" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-left text-sm font-medium text-[#8b5e3c] transition hover:bg-[#f8efe7] ${
                          isLoggingOut ? "cursor-not-allowed opacity-60" : ""
                        }`}
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={closeMenu}
                        className={`${mobileItem} ${isActivePath(pathname, "/login") ? "bg-[#f4e6d8] text-[#3f3226]" : ""}`}
                      >
                        <LogIn className="h-4 w-4" />
                        Log In
                      </Link>

                      <Link
                        href="/signup"
                        onClick={closeMenu}
                        className="mt-1 inline-flex items-center gap-2 rounded-[18px] bg-[#a48f7a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
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
        </div>
      </div>
    </header>
  );
}
