"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const VISITOR_ID_STORAGE_KEY = "neonadri.visitorId";

function createFallbackVisitorId() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (
      Number(char) ^
      (Math.random() * 16) >> (Number(char) / 4)
    ).toString(16)
  );
}

function getVisitorId() {
  const existing = window.localStorage.getItem(VISITOR_ID_STORAGE_KEY);

  if (existing) {
    return existing;
  }

  const nextId =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : createFallbackVisitorId();

  window.localStorage.setItem(VISITOR_ID_STORAGE_KEY, nextId);
  return nextId;
}

export default function SiteVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const visitorId = getVisitorId();
    const payload = JSON.stringify({
      visitorId,
      path: pathname,
    });

    const queued = navigator.sendBeacon?.(
      "/api/visits",
      new Blob([payload], { type: "application/json" })
    );

    if (!queued) {
      fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
