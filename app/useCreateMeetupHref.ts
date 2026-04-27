"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabase/client";

const WRITE_PATH = "/write";
const LOGIN_TO_WRITE_HREF = `/login?next=${encodeURIComponent(WRITE_PATH)}`;
const LOGGED_IN_FALLBACK_HREF = "/beta?next=/write";
export const POSTING_ACCESS_UPDATED_EVENT = "posting-access-updated";

function getPostingAccessHref(email?: string | null) {
  if (!email) return LOGGED_IN_FALLBACK_HREF;

  return `/beta?email=${encodeURIComponent(email)}&next=/write`;
}

async function checkPostingAccess(email: string) {
  const response = await fetch("/api/beta/check-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Posting access check failed");
  }

  const payload = await response.json().catch(() => ({}));
  return !!payload.allowed;
}

export function useCreateMeetupHref(initialIsLoggedIn = false) {
  const supabase = useMemo(() => createClient(), []);
  const [createHref, setCreateHref] = useState(
    initialIsLoggedIn ? LOGGED_IN_FALLBACK_HREF : LOGIN_TO_WRITE_HREF
  );

  useEffect(() => {
    let cancelled = false;
    let requestVersion = 0;

    const resolveCreateHref = async (sessionUser?: { email?: string | null } | null) => {
      const currentVersion = requestVersion + 1;
      requestVersion = currentVersion;

      if (!sessionUser) {
        if (!cancelled) {
          setCreateHref(LOGIN_TO_WRITE_HREF);
        }
        return;
      }

      const fallbackHref = getPostingAccessHref(sessionUser.email);

      if (!cancelled) {
        setCreateHref(fallbackHref);
      }

      if (!sessionUser.email) {
        return;
      }

      try {
        const allowed = await checkPostingAccess(sessionUser.email);

        if (cancelled || currentVersion !== requestVersion) {
          return;
        }

        setCreateHref(allowed ? WRITE_PATH : fallbackHref);
      } catch (error) {
        if (cancelled || currentVersion !== requestVersion) {
          return;
        }

        console.error("Create meetup access lookup failed", error);
        setCreateHref(fallbackHref);
      }
    };

    const refreshFromCurrentSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await resolveCreateHref(data.session?.user ?? null);
      } catch (error) {
        console.error("Create meetup session lookup failed", error);
        if (!cancelled) {
          setCreateHref(
            initialIsLoggedIn ? LOGGED_IN_FALLBACK_HREF : LOGIN_TO_WRITE_HREF
          );
        }
      }
    };

    void refreshFromCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void resolveCreateHref(session?.user ?? null);
    });

    const handlePostingAccessUpdated = () => {
      void refreshFromCurrentSession();
    };

    const handleWindowFocus = () => {
      void refreshFromCurrentSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshFromCurrentSession();
      }
    };

    window.addEventListener(POSTING_ACCESS_UPDATED_EVENT, handlePostingAccessUpdated);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.removeEventListener(
        POSTING_ACCESS_UPDATED_EVENT,
        handlePostingAccessUpdated
      );
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [initialIsLoggedIn, supabase]);

  return createHref;
}
