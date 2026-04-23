"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MessageSquareMore } from "lucide-react";
import { getChatWindowState } from "../../lib/chat/chatWindow";
import { parseMeetingTime } from "../../lib/meetingTime";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

export type ChatListItem = {
  matchId: number;
  otherUserName: string;
  meetingPurpose: string | null;
  meetingTime: string | null;
  placeLabel: string;
  hasNewMessage: boolean;
  lastActivityAt: string | null;
  createdAt: string;
  postStatus: string | null;
};

type ChatFilter = "all" | "active" | "read_only" | "cancelled";

function formatChatTime(meetingTime: string | null, userTimeZone: string) {
  const parsed = parseMeetingTime(meetingTime, userTimeZone);
  if (!parsed) return "Time TBD";

  const dateLabel = parsed.toLocaleDateString("en-US", {
    timeZone: userTimeZone,
    month: "short",
    day: "numeric",
  });

  const timeLabel = parsed.toLocaleTimeString("en-US", {
    timeZone: userTimeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel} / ${timeLabel}`;
}

function getChatListStatus(item: ChatListItem, userTimeZone: string) {
  if (String(item.postStatus || "open").toLowerCase() === "cancelled") {
    return "cancelled" as const;
  }

  return getChatWindowState(item.meetingTime, userTimeZone).chatClosed
    ? ("read_only" as const)
    : ("active" as const);
}

function getStatusLabel(status: ReturnType<typeof getChatListStatus>) {
  if (status === "cancelled") return "Cancelled";
  if (status === "read_only") return "Read-only";
  return "Active";
}

function getStatusClass(status: ReturnType<typeof getChatListStatus>) {
  if (status === "cancelled") {
    return "border border-[#e7d7d2] bg-[linear-gradient(180deg,#ffffff_0%,#f6ece8_100%)] text-[#8f5b4b]";
  }

  if (status === "read_only") {
    return "border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] text-[#5f7480]";
  }

  return "border border-[#c7d2da] bg-[linear-gradient(180deg,#ffffff_0%,#ebf0f4_100%)] text-[#435760]";
}

export default function ChatsPageClient({
  chats,
  userTimeZone,
}: {
  chats: ChatListItem[];
  userTimeZone: string;
}) {
  const [filter, setFilter] = useState<ChatFilter>("all");

  const filteredChats = useMemo(() => {
    if (filter === "all") return chats;
    return chats.filter((item) => getChatListStatus(item, userTimeZone) === filter);
  }, [chats, filter, userTimeZone]);

  return (
    <main className={`${APP_PAGE_BG_CLASS} min-h-screen px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-4xl">
        <div className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className={APP_EYEBROW_CLASS}>All chats</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#24323f]">
                Chats from your matched meetups
              </div>
              <p className={`mt-2 max-w-2xl ${APP_BODY_TEXT_CLASS}`}>
                Review active conversations, read-only threads, and cancelled meetup chats in one place.
              </p>
            </div>
            <Link
              href="/dashboard?tab=matches"
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["all", "All"],
              ["active", "Active"],
              ["read_only", "Read-only"],
              ["cancelled", "Cancelled"],
            ].map(([value, label]) => {
              const isActive = filter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilter(value as ChatFilter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="mt-5 overflow-hidden rounded-[22px] border border-[#d8e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)]">
            {filteredChats.length > 0 ? (
              filteredChats.map((chat, index) => {
                const status = getChatListStatus(chat, userTimeZone);
                return (
                  <Link
                    key={chat.matchId}
                    href={`/matches/${chat.matchId}/chat`}
                    className={`flex flex-col gap-3 px-4 py-4 transition hover:bg-white/80 sm:flex-row sm:items-center sm:justify-between ${
                      index !== filteredChats.length - 1 ? "border-b border-[#dfe6ea]" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[#24323f]">
                          {chat.otherUserName}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] ${getStatusClass(
                            status
                          )}`}
                        >
                          {getStatusLabel(status)}
                        </span>
                        {chat.hasNewMessage && status === "active" ? (
                          <span className="rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5f7480]">
                            New
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-sm font-medium text-[#52616a]">
                        {chat.meetingPurpose || "Meetup"}
                      </div>
                      <div className="mt-1 truncate text-xs text-[#78848c]">
                        {formatChatTime(chat.meetingTime, userTimeZone)} · {chat.placeLabel}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs font-medium text-[#78848c]">
                      {chat.lastActivityAt
                        ? `Last activity ${new Date(chat.lastActivityAt).toLocaleString()}`
                        : `Opened ${new Date(chat.createdAt).toLocaleString()}`}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center text-[#78848c]">
                <MessageSquareMore className="h-8 w-8 text-[#9aa6ad]" />
                <div className="mt-3 text-base font-medium text-[#52616a]">No chats in this filter</div>
                <div className="mt-1 max-w-sm text-sm leading-6">
                  Matched meetup conversations will appear here when they fit this status.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

