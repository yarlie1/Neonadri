"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  LoaderCircle,
  MessageSquareMore,
  Send,
  ShieldCheck,
} from "lucide-react";

declare global {
  interface Window {
    PubNub?: new (config: {
      publishKey: string;
      subscribeKey: string;
      userId: string;
    }) => {
      addListener: (listener: {
        message?: (event: {
          message: {
            text?: string;
            senderId?: string;
            senderName?: string;
            createdAt?: string;
          };
          timetoken: string;
        }) => void;
      }) => void;
      channel: (name: string) => {
        subscription: () => {
          subscribe: () => void;
          unsubscribe: () => void;
        };
      };
      publish: (payload: {
        channel: string;
        message: {
          text: string;
          senderId: string;
          senderName: string;
          createdAt: string;
        };
        storeInHistory?: boolean;
      }) => Promise<unknown>;
      fetchMessages?: (payload: {
        channels: string[];
        count?: number;
        includeUUID?: boolean;
      }) => Promise<{
        channels?: Record<
          string,
          Array<{
            message?: {
              text?: string;
              senderId?: string;
              senderName?: string;
              createdAt?: string;
            };
            timetoken?: string;
          }>
        >;
      }>;
    };
  }
}

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
};

function formatMessageTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatPresenceLabel(value: string | null) {
  if (!value) return "Offline";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Offline";

  const diffMs = Date.now() - parsed.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMs < 1000 * 60 * 2) return "Active now";
  if (diffMinutes < 60) return `Last seen ${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `Last seen ${diffHours}h ago`;

  return `Last seen ${parsed.toLocaleDateString()}`;
}

export default function ChatRoomClient({
  matchId,
  otherUserName,
  initialOtherUserLastSeenAt,
  meetingTimeLabel,
  placeLabel,
  roomId,
  isProviderConfigured,
  currentUserId,
  currentUserName,
}: {
  matchId: number;
  otherUserName: string;
  initialOtherUserLastSeenAt: string | null;
  meetingTimeLabel: string;
  placeLabel: string;
  roomId: string;
  isProviderConfigured: boolean;
  currentUserId: string;
  currentUserName: string;
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionLabel, setConnectionLabel] = useState("Connecting...");
  const [otherUserLastSeenAt, setOtherUserLastSeenAt] = useState<string | null>(
    initialOtherUserLastSeenAt
  );
  const pubnubRef = useRef<InstanceType<NonNullable<typeof window.PubNub>> | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const publishKey = process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY;
  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY;

  const roomLabel = useMemo(() => roomId, [roomId]);
  const presenceLabel = useMemo(
    () => formatPresenceLabel(otherUserLastSeenAt),
    [otherUserLastSeenAt]
  );

  const markActivity = async (action: "seen" | "message") => {
    try {
      const response = await fetch("/api/matches/chat/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          action,
        }),
        keepalive: action === "message",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        console.error("[match-chat-activity]", action, payload?.error || response.status);
      }
    } catch {
      console.error("[match-chat-activity]", action, "network-failed");
    }
  };

  useEffect(() => {
    setOtherUserLastSeenAt(initialOtherUserLastSeenAt);
  }, [initialOtherUserLastSeenAt]);

  useEffect(() => {
    if (!sdkReady || !isProviderConfigured || !window.PubNub || !publishKey || !subscribeKey) {
      return;
    }

    const pubnub = new window.PubNub({
      publishKey,
      subscribeKey,
      userId: currentUserId,
    });

    pubnubRef.current = pubnub;
    setConnectionLabel("Connected");

    const pushMessage = (incoming: ChatMessage) => {
      setMessages((current) => {
        if (current.some((message) => message.id === incoming.id)) {
          return current;
        }

        return [...current, incoming].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      });
    };

    pubnub.addListener({
      message: (event) => {
        const payload = event.message || {};
        const text = (payload.text || "").trim();
        if (!text) return;

        pushMessage({
          id: event.timetoken,
          text,
          senderId: payload.senderId || "unknown",
          senderName: payload.senderName || "Participant",
          createdAt: payload.createdAt || new Date().toISOString(),
        });

        if ((payload.senderId || "unknown") !== currentUserId) {
          void markActivity("seen");
        }
      },
    });

    const subscription = pubnub.channel(roomLabel).subscription();
    subscription.subscribe();
    subscriptionRef.current = subscription;

    const loadHistory = async () => {
      if (!pubnub.fetchMessages) {
        return;
      }

      try {
        const history = await pubnub.fetchMessages({
          channels: [roomLabel],
          count: 25,
          includeUUID: true,
        });

        const historyMessages =
          history.channels?.[roomLabel]
            ?.map((entry) => {
              const payload = entry.message || {};
              const text = (payload.text || "").trim();
              if (!text) return null;

              return {
                id: entry.timetoken || `${payload.senderId}-${payload.createdAt}`,
                text,
                senderId: payload.senderId || "unknown",
                senderName: payload.senderName || "Participant",
                createdAt: payload.createdAt || new Date().toISOString(),
              } satisfies ChatMessage;
            })
            .filter(Boolean) || [];

        setMessages(historyMessages as ChatMessage[]);
        void markActivity("seen");
      } catch {
        setErrorMessage("Past messages could not be loaded. New chat still works.");
      }
    };

    void loadHistory();

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      pubnubRef.current = null;
      setConnectionLabel("Disconnected");
    };
  }, [currentUserId, isProviderConfigured, publishKey, roomLabel, sdkReady, subscribeKey]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isProviderConfigured) {
      return;
    }

    let cancelled = false;

    const syncPresence = async () => {
      try {
        const response = await fetch(`/api/matches/chat/activity?matchId=${matchId}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as {
          otherUserLastSeenAt?: string | null;
        };

        if (!cancelled) {
          setOtherUserLastSeenAt(payload.otherUserLastSeenAt || null);
        }
      } catch {
        // Best-effort presence sync only.
      }
    };

    void syncPresence();
    const seenInterval = window.setInterval(() => {
      void markActivity("seen");
      void syncPresence();
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(seenInterval);
    };
  }, [isProviderConfigured, matchId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !pubnubRef.current) return;

    setSending(true);
    setErrorMessage(null);

    try {
      await pubnubRef.current.publish({
        channel: roomLabel,
        message: {
          text,
          senderId: currentUserId,
          senderName: currentUserName,
          createdAt: new Date().toISOString(),
        },
        storeInHistory: true,
      });
      setDraft("");
      void markActivity("message");
    } catch {
      setErrorMessage("Message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDraftKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) {
      return;
    }

    event.preventDefault();
    void handleSend();
  };

  return (
    <main className="bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-4 text-[#2f2a26] sm:px-6 sm:py-6">
      <Script
        src="https://cdn.pubnub.com/sdk/javascript/pubnub.10.2.8.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="mx-auto max-w-3xl">
        <div className="rounded-[24px] border border-[#eadfd3] bg-white/92 p-4 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur sm:p-5">
          {isProviderConfigured ? (
            <>
              <div className="border-b border-[#eadfd3] pb-3">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#8c7e73]">
                  <span className="font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Live chat
                  </span>
                  <span>{presenceLabel}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#5f453b]">
                  <span className="font-semibold text-[#2b1f1a]">{otherUserName}</span>
                  <span>{meetingTimeLabel}</span>
                  <span className="truncate">{placeLabel}</span>
                </div>
              </div>

              <div
                ref={listRef}
                className="mt-4 h-[315px] overflow-y-auto rounded-[18px] border border-[#ece1d4] bg-[linear-gradient(180deg,#fffdfa_0%,#fff8f1_100%)] px-3 py-3 sm:h-[345px] sm:px-4"
              >
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isMine = message.senderId === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          {isMine ? (
                            <span className="shrink-0 text-[10px] font-medium text-[#9b8f84]">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          ) : null}
                          <div
                            className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm ${
                              isMine
                                ? "bg-[linear-gradient(135deg,#ffdca9_0%,#f7c87d_100%)] text-[#5d3e15]"
                                : "bg-[#f7efe7] text-[#4f443b]"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{message.text}</div>
                          </div>
                          {!isMine ? (
                            <span className="shrink-0 text-[10px] font-medium text-[#9b8f84]">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-[#8c7e73]">
                    <MessageSquareMore className="h-8 w-8 text-[#b19b8d]" />
                    <div className="mt-3 font-medium text-[#6f6258]">No messages yet</div>
                    <div className="mt-1 max-w-xs leading-6">
                      Start with a quick hello, confirm the time, or share an arrival update.
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-[18px] border border-[#ece1d4] bg-white p-2 sm:p-3">
                <div className="flex gap-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    placeholder={`Message ${otherUserName}...`}
                    className="h-[56px] min-h-[56px] flex-1 resize-none rounded-[16px] border border-[#e3d7ca] bg-[#fffdfa] px-4 py-[17px] text-sm leading-5 text-[#2f2a26] outline-none transition placeholder:text-[#a29185] focus:border-[#cfb8a4]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={sending || !draft.trim()}
                    className="inline-flex h-[56px] shrink-0 items-center gap-2 self-end rounded-[16px] border border-[#dccfc2] bg-[#fff7ef] px-4 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sending ? (
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-3 rounded-[14px] border border-[#eadfd3] bg-[#fbf6f0] px-4 py-3 text-sm text-[#7b6256]">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 text-center text-[11px] font-medium text-[#9b8f84]">
                Chat Powered by PubNub
              </div>
            </>
          ) : (
            <div className="rounded-[18px] border border-[#ece1d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e8_100%)] px-4 py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                <div className="text-sm leading-6 text-[#5f5347]">
                  Chat is ready, but PubNub keys are not configured yet.
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/dashboard?tab=matches"
              className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Back to Matches
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
