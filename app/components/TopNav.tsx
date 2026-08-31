"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { MessageCircleMore } from "lucide-react";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../lib/userTimeZone";
import { loadNavIndicatorState, type NavIndicatorState } from "../../lib/navIndicators";
import {
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
} from "../designSystem";
import { useCreateMeetupHref } from "../useCreateMeetupHref";

type SimpleUser = {
  id: string;
  email?: string | null;
} | null;

type TopNavProps = {
  initialUser?: SimpleUser;
  initialIndicators?: NavIndicatorState;
};

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      className={`inline-flex min-w-[18px] items-center justify-center rounded-[8px] px-1.5 py-0.5 text-[10px] font-extrabold leading-none shadow-none ${APP_PILL_ACTIVE_CLASS}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NewChatBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <span
      className={`relative inline-flex h-5 w-5 items-center justify-center rounded-[8px] ${APP_PILL_INACTIVE_CLASS}`}
      aria-label="New chat activity"
      title="New chat activity"
    >
      <MessageCircleMore className="h-3 w-3" />
      <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-[8px] border border-white bg-[#7b8790]" />
    </span>
  );
}


export default function TopNav({
  initialUser = null,
  initialIndicators,
}: TopNavProps) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SimpleUser>(initialUser);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(initialIndicators?.pendingCount || 0);
  const [acceptedSentCount, setAcceptedSentCount] = useState(
    initialIndicators?.acceptedSentCount || 0
  );
  const [upcomingMatchCount, setUpcomingMatchCount] = useState(
    initialIndicators?.upcomingMatchCount || 0
  );
  const [hasNewChatActivity, setHasNewChatActivity] = useState(
    initialIndicators?.hasNewChatActivity || false
  );
  const [showTagline, setShowTagline] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const loggingOutRef = useRef(false);
  const pathname = usePathname();
  const isSilverHome = true;
  
  const currentPathWithSearch = useMemo(() => {
    return currentSearch ? `${pathname}${currentSearch}` : pathname;
  }, [pathname, currentSearch]);

  const loginHref =
    pathname === "/login"
      ? "/login"
      : `/login?next=${encodeURIComponent(currentPathWithSearch)}`;
  const dashboardHref =
    user && acceptedSentCount > 0
      ? "/dashboard?tab=sent"
      : user && pendingCount > 0
      ? "/dashboard?tab=received"
      : "/dashboard";
  const mobileDashboardCount =
    pendingCount + acceptedSentCount + upcomingMatchCount;
  const createHref = useCreateMeetupHref(!!user, user ? "/write" : undefined);
  const openIntroVideo = () => {
    setMenuOpen(false);
    window.dispatchEvent(new CustomEvent("neonadri:open-intro"));
  };

  useEffect(() => {
    const showDurationMs = 2200;
    const cycleDurationMs = 7000;
    let hideTimeout: number | null = null;

    const showThenHide = () => {
      setShowTagline(true);
      hideTimeout = window.setTimeout(() => {
        setShowTagline(false);
      }, showDurationMs);
    };

    const intervalId = window.setInterval(showThenHide, cycleDurationMs);

    return () => {
      window.clearInterval(intervalId);
      if (hideTimeout) window.clearTimeout(hideTimeout);
    };
  }, []);

  useEffect(() => {
    const browserTimeZone = normalizeUserTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    document.cookie = `${USER_TIME_ZONE_COOKIE}=${encodeURIComponent(
      browserTimeZone
    )}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncSearch = () => {
      setCurrentSearch(window.location.search || "");
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args) {
      const result = originalPushState(...args);
      syncSearch();
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState(...args);
      syncSearch();
      return result;
    };

    syncSearch();
    window.addEventListener("popstate", syncSearch);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", syncSearch);
    };
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    let refreshChannel: ReturnType<typeof supabase.channel> | null = null;
    const browserTimeZone = normalizeUserTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );

    const resetSignedOutState = () => {
      setUser(null);
      setPendingCount(0);
      setAcceptedSentCount(0);
      setUpcomingMatchCount(0);
      setHasNewChatActivity(false);
      setMenuOpen(false);
      setIsLoggingOut(false);
      loggingOutRef.current = false;
    };

    const refreshIndicators = async (userId: string) => {
      try {
        const nextIndicators = await loadNavIndicatorState(
          supabase,
          userId,
          browserTimeZone
        );

        if (!mounted || loggingOutRef.current) return;
        setPendingCount(nextIndicators.pendingCount);
        setAcceptedSentCount(nextIndicators.acceptedSentCount);
        setUpcomingMatchCount(nextIndicators.upcomingMatchCount);
        setHasNewChatActivity(nextIndicators.hasNewChatActivity);
      } catch (error) {
        console.error("TopNav refreshIndicators error:", error);
      }
    };

    const attachRefreshChannel = (userId: string) => {
      refreshChannel?.unsubscribe();
      refreshChannel = supabase
        .channel(`topnav-badges-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "posts",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_requests",
            filter: `post_owner_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_requests",
            filter: `requester_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_chats",
            filter: `host_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_chats",
            filter: `guest_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .subscribe();
    };

    const loadUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted || loggingOutRef.current) return;

        const user = session?.user ?? null;
        const nextUser = user ? { id: user.id, email: user.email } : null;
        setUser(nextUser);

        if (user) {
          attachRefreshChannel(user.id);
          await refreshIndicators(user.id);
        } else {
          refreshChannel?.unsubscribe();
          refreshChannel = null;
          setPendingCount(0);
          setAcceptedSentCount(0);
          setUpcomingMatchCount(0);
          setHasNewChatActivity(false);
        }
      } catch (error) {
        console.error("TopNav loadUser error:", error);
      }
    };

    loadUser();
    const pollId = window.setInterval(() => {
      void loadUser();
    }, 30000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      try {
        if (!mounted) return;

        if (_event === "SIGNED_OUT") {
          resetSignedOutState();
          return;
        }

        if (!session?.user) {
          refreshChannel?.unsubscribe();
          refreshChannel = null;
          resetSignedOutState();
          return;
        }

        if (loggingOutRef.current) return;

        const nextUser = { id: session.user.id, email: session.user.email };

        setUser(nextUser);
        setMenuOpen(false);

        window.setTimeout(() => {
          if (!mounted || loggingOutRef.current) return;
          attachRefreshChannel(session.user.id);
          void refreshIndicators(session.user.id);
        }, 0);
      } catch (error) {
        console.error("TopNav auth change error:", error);
      }
    });

    return () => {
      mounted = false;
      window.clearInterval(pollId);
      refreshChannel?.unsubscribe();
      subscription.unsubscribe();
    };
  }, [supabase, pathname, currentSearch]);

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
    setAcceptedSentCount(0);
    setUpcomingMatchCount(0);
    setHasNewChatActivity(false);

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("TopNav session storage clear error:", error);
    }

    const target = `/?signed_out=${Date.now()}`;
    window.location.assign(
      `/api/auth/logout?redirect=${encodeURIComponent(target)}`
    );
  };

  const closeMenu = () => setMenuOpen(false);

  const topLink =
    "inline-flex h-10 items-center rounded-[8px] px-3 text-sm font-bold text-[#111111] transition hover:bg-[#f4f4f4]";
  const menuItem =
    "block rounded-[8px] px-3 py-2 text-sm font-bold text-[#111111] transition hover:bg-[#f4f4f4]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#111111] bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="relative inline-flex h-10 w-[142px] shrink-0 items-center text-[#111111] sm:w-[280px]"
          onClick={closeMenu}
          aria-label="Neonadri home"
        >
          <span
            aria-hidden="true"
            className={`absolute left-0 text-[24px] font-black leading-none tracking-[-0.05em] transition duration-500 ease-out ${
              showTagline
                ? "-translate-y-1 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            Neonadri
          </span>
          <span
            aria-hidden="true"
            className={`absolute left-0 text-[13px] font-black leading-[1.05] tracking-normal transition duration-500 ease-out sm:text-[18px] sm:leading-none ${
              showTagline
                ? "translate-y-0 opacity-100"
                : "translate-y-1 opacity-0"
            }`}
          >
            <span className="block sm:inline">The simplest way to</span>
            <span className="block sm:inline"> start meetups</span>
          </span>
        </Link>

        <div className="relative flex items-center gap-1.5" ref={menuRef}>
          {user ? (
            <>
              <Link href={dashboardHref} className={topLink} onClick={closeMenu}>
                Dashboard
                <span className="ml-2 inline-flex items-center gap-1">
                  <CountBadge count={mobileDashboardCount} />
                  <NewChatBadge visible={hasNewChatActivity} />
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link href={loginHref} className={topLink} onClick={closeMenu}>
                Log in
              </Link>
            </>
          )}

          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 items-center rounded-[8px] border border-[#111111] bg-white px-3 text-sm font-bold text-[#111111] transition hover:bg-[#f4f4f4]"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 rounded-[8px] border border-[#111111] bg-white p-2 shadow-none">
              <Link href="/" onClick={closeMenu} className={menuItem}>
                Home
              </Link>
              <button
                type="button"
                onClick={openIntroVideo}
                className="w-full text-left rounded-[8px] px-3 py-2 text-sm font-bold text-[#111111] transition hover:bg-[#f4f4f4]"
              >
                Watch intro
              </button>

              {!user ? (
                <>
                  <div className="my-1 border-t border-[#111111]" />
                  <Link href="/signup" onClick={closeMenu} className={menuItem}>
                    Sign up
                  </Link>
                </>
              ) : null}

              {user ? (
                <>
                  <div className="my-1 border-t border-[#111111]" />
                  <Link
                    href="/chats"
                    onClick={closeMenu}
                    className="flex items-center justify-between gap-3 rounded-[8px] px-3 py-2 text-sm font-bold text-[#111111] transition hover:bg-[#f4f4f4]"
                  >
                    <span>Chats</span>
                    <NewChatBadge visible={hasNewChatActivity} />
                  </Link>
                  <Link href="/profile" onClick={closeMenu} className={menuItem}>
                    Profile
                  </Link>
                  <Link href="/account" onClick={closeMenu} className={menuItem}>
                    Account
                  </Link>
                  <Link href={createHref} onClick={closeMenu} className={menuItem}>
                    Create meetup
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className={`w-full text-left rounded-[8px] px-3 py-2 text-sm font-bold text-[#111111] transition hover:bg-[#f4f4f4] ${
                      isLoggingOut ? "cursor-not-allowed opacity-60" : ""
                    }`}
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
