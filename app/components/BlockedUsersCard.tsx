"use client";

import { useEffect, useState } from "react";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

type BlockedUserItem = {
  blockedUserId: string;
  displayName: string;
  createdAt: string;
};

export default function BlockedUsersCard() {
  const [items, setItems] = useState<BlockedUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadBlockedUsers = async () => {
    setLoading(true);
    const response = await fetch("/api/blocks", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error || "Could not load blocked users.");
      return;
    }

    setItems(payload.items || []);
  };

  useEffect(() => {
    void loadBlockedUsers();
  }, []);

  const handleUnblock = async (blockedUserId: string) => {
    setMessage("");
    const response = await fetch("/api/blocks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedUserId }),
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(payload.error || "Could not unblock user.");
      return;
    }

    setItems((current) =>
      current.filter((item) => item.blockedUserId !== blockedUserId)
    );
  };

  return (
    <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
      <div className={APP_EYEBROW_CLASS}>Safety</div>
      <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
        Blocked users
      </h3>
      <p className="mt-2 text-sm text-[#6c7880]">
        People you block can no longer send new requests or open new chats with you.
      </p>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm text-[#6c7880]`}>
            Loading blocked users...
          </div>
        ) : items.length === 0 ? (
          <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm text-[#6c7880]`}>
            No blocked users yet.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.blockedUserId}
              className={`${APP_SOFT_CARD_CLASS} flex items-center justify-between gap-3 px-4 py-3`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-[#24323c]">
                  {item.displayName}
                </div>
                <div className="mt-1 text-xs text-[#849099]">
                  Blocked {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleUnblock(item.blockedUserId)}
                className={`inline-flex shrink-0 items-center rounded-full px-3.5 py-2 text-xs font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Unblock
              </button>
            </div>
          ))
        )}
      </div>

      {message ? (
        <div className={`mt-3 rounded-[16px] px-3.5 py-2 text-xs font-medium text-[#55626a] ${APP_SOFT_CARD_CLASS}`}>
          {message}
        </div>
      ) : null}
    </section>
  );
}
