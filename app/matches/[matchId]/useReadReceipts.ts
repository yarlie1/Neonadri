"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Message = { id: string; senderId: string; readReceiptVersion?: number };

// Only opt-in messages have receipt state; legacy messages remain unmarked.
export function useReadReceipts(
  matchId: number,
  userId: string,
  messages: Message[],
  listRef: RefObject<HTMLDivElement>,
  enabled: boolean
) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const saved = useRef(new Set<string>());
  const pending = useRef(new Set<string>());

  useEffect(() => {
    saved.current.clear();
    pending.current.clear();
    setReadIds(new Set());
    setCheckedIds(new Set());
  }, [matchId, userId]);

  useEffect(() => {
    const list = listRef.current;
    if (!enabled || !list) return;
    let disposed = false;
    let busy = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const controller = new AbortController();
    const sentIds = messages.filter((m) => m.senderId === userId &&
      m.readReceiptVersion === 1 && /^[0-9]{15,20}$/.test(m.id)).map((m) => m.id);

    const scanVisible = () => {
      if (document.visibilityState !== "visible" || !document.hasFocus()) return;
      const box = list.getBoundingClientRect();
      const top = Math.max(0, box.top);
      const bottom = Math.min(window.innerHeight, box.bottom);
      const left = Math.max(0, box.left);
      const right = Math.min(window.innerWidth, box.right);
      for (const node of Array.from(list.querySelectorAll<HTMLElement>("[data-receipt-id]"))) {
        const id = node.dataset.receiptId!;
        if (saved.current.has(id)) continue;
        const rect = node.getBoundingClientRect();
        const visibleHeight = Math.min(bottom, rect.bottom) - Math.max(top, rect.top);
        // Supports long bubbles while excluding messages outside the viewport.
        if (rect.height > 0 && bottom > top && rect.right > left && rect.left < right &&
            visibleHeight >= Math.min(rect.height, bottom - top) * 0.8) {
          pending.current.add(id);
        }
      }
    };

    const sync = async () => {
      if (busy || disposed || document.visibilityState !== "visible") return;
      scanVisible();
      const reads = Array.from(pending.current);
      if (!reads.length && !sentIds.length) return;
      busy = true;
      try {
        for (let i = 0; i < Math.max(reads.length, sentIds.length); i += 100) {
          const readBatch = reads.slice(i, i + 100);
          const sentBatch = sentIds.slice(i, i + 100);
          const response = await fetch("/api/matches/chat/receipts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matchId, readMessageIds: readBatch, sentMessageIds: sentBatch }),
            signal: controller.signal,
          });
          if (!response.ok) break; // Keep pending reads for the next retry.
          const data = await response.json();
          if (disposed) return;
          for (const id of readBatch) { saved.current.add(id); pending.current.delete(id); }
          setReadIds((previous) => new Set([...Array.from(previous), ...(data.readMessageIds || [])]));
          setCheckedIds((previous) => new Set([...Array.from(previous), ...sentBatch]));
        }
      } catch {
        // A failed request must never mark the sender's messages as read.
      } finally { busy = false; }
    };

    const schedule = () => {
      scanVisible();
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void sync(), 250);
    };
    list.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("focus", schedule);
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    // Wait until the rendered list and its scroll position have settled.
    schedule();
    const interval = setInterval(() => void sync(), 3000);
    return () => {
      disposed = true;
      controller.abort();
      if (timer) clearTimeout(timer);
      clearInterval(interval);
      list.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("focus", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [matchId, userId, messages, listRef, enabled]);

  return { readIds, checkedIds };
}
