"use client";

import Script from "next/script";
import { useReadReceipts } from "./useReadReceipts";
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
            readReceiptVersion?: number;
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
    };
  }
}

type ChatMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  readReceiptVersion?: number;
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
  chatClosed,
  chatClosedMessage,
  currentUserId,
}: {
  matchId: number;
  otherUserName: string;
  initialOtherUserLastSeenAt: string | null;
  meetingTimeLabel: string;
  placeLabel: string;
  roomId: string;
  isProviderConfigured: boolean;
  chatClosed: boolean;
  chatClosedMessage: string;
  currentUserId: string;
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
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

  const { readIds, checkedIds } = useReadReceipts(matchId, currentUserId, messages, listRef, isProviderConfigured && !historyLoading);

  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY;

  const roomLabel = useMemo(() => roomId, [roomId]);
  const presenceLabel = useMemo(
    () => formatPresenceLabel(otherUserLastSeenAt),
    [otherUserLastSeenAt]
  );
  const isOtherUserActiveNow = presenceLabel === "Active now";
  const canSend =
    !chatClosed && connectionLabel === "Connected" && draft.trim().length > 0 && !sending;

  const canMarkSeen = () => {
    if (typeof document === "undefined") return true;
    const isVisible = document.visibilityState === "visible";
    const hasFocus = typeof document.hasFocus === "function" ? document.hasFocus() : true;
    return isVisible && hasFocus;
  };

  const markSeenIfVisible = async () => {
    if (!canMarkSeen()) return;
    await markActivity("seen");
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.PubNub) {
      setSdkReady(true);
    }
  }, []);

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
        keepalive: true,
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        console.error("[match-chat-activity]", action, payload?.error || response.status);
        return {
          ok: false,
          error: payload?.error || "Chat activity update failed.",
        };
      }

      return { ok: true as const };
    } catch {
      console.error("[match-chat-activity]", action, "network-failed");
      return {
        ok: false,
        error: "Chat activity update failed.",
      };
    }
  };

  useEffect(() => {
    setOtherUserLastSeenAt(initialOtherUserLastSeenAt);
  }, [initialOtherUserLastSeenAt]);

  useEffect(() => {
    if (!isProviderConfigured) return;
    void markSeenIfVisible();
  }, [isProviderConfigured, matchId]);

  useEffect(() => {
    if (!sdkReady || !isProviderConfigured || !window.PubNub || !subscribeKey) {
      return;
    }

    const pubnub = new window.PubNub({
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
          id: String(event.timetoken),
          readReceiptVersion: payload.readReceiptVersion,
          text,
          senderId: payload.senderId || "unknown",
          senderName: payload.senderName || "Participant",
          createdAt: payload.createdAt || new Date().toISOString(),
        });

        if ((payload.senderId || "unknown") !== currentUserId) {
          void markSeenIfVisible();
        }
      },
    });

    const subscription = pubnub.channel(roomLabel).subscription();
    subscription.subscribe();
    subscriptionRef.current = subscription;

    const loadHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await fetch(
          `/api/matches/chat/history?matchId=${matchId}&count=50`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("HISTORY_FETCH_FAILED");
        }

        const history = (await response.json()) as {
          messages?: ChatMessage[];
        };

        const historyMessages = Array.isArray(history.messages)
          ? history.messages
              .map((message) => ({
                id: String(message.id || "").trim(),
                readReceiptVersion: message.readReceiptVersion,
                text: String(message.text || "").trim(),
                senderId: String(message.senderId || "unknown"),
                senderName: String(message.senderName || "Participant"),
                createdAt: String(message.createdAt || new Date().toISOString()),
              }))
              .filter((message) => message.id && message.text)
          : [];

        setMessages((current) => Array.from(new Map([...historyMessages, ...current].map((message) => [message.id, message])).values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
        void markSeenIfVisible();
      } catch {
        setErrorMessage("Past messages unavailable.");
      } finally {
        setHistoryLoading(false);
      }
    };

    void loadHistory();

    return () => {
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      pubnubRef.current = null;
      setConnectionLabel("Disconnected");
    };
  }, [
    currentUserId,
    isProviderConfigured,
    matchId,
    roomLabel,
    sdkReady,
    subscribeKey,
  ]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (!isProviderConfigured) return;

    const handleVisibilityOrFocus = () => {
      void markSeenIfVisible();
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
    };
  }, [isProviderConfigured, matchId]);

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
      void markSeenIfVisible();
      void syncPresence();
    }, 30000);

    return () => {
      cancelled = true;
      void markSeenIfVisible();
      window.clearInterval(seenInterval);
    };
  }, [isProviderConfigured, matchId]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text) return;
    if (chatClosed) {
      setErrorMessage(chatClosedMessage);
      return;
    }
    if (!pubnubRef.current) {
      setErrorMessage("Chat still connecting.");
      return;
    }

    setSending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/matches/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          text,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(payload?.error || "Message failed.");
        return;
      }

      if (payload?.message) {
        setMessages((current) => {
          if (current.some((message) => message.id === payload.message.id)) {
            return current;
          }

          return [...current, payload.message].sort((a, b) =>
            a.createdAt.localeCompare(b.createdAt)
          );
        });
      }

      setDraft("");
    } catch {
      setErrorMessage("Message failed.");
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
    <main className="bg-white px-3 py-4 text-[#111111] sm:px-6 sm:py-6">
      <Script
        src="https://cdn.pubnub.com/sdk/javascript/pubnub.10.2.8.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onReady={() => setSdkReady(true)}
        onError={() => {
          setConnectionLabel("Unavailable");
          setErrorMessage("Chat connection failed.");
        }}
      />
      <div className="mx-auto max-w-3xl overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-[#e5e5e5]">
        {isProviderConfigured ? (
          <>
            <header className="border-b border-[#ededed] px-2 pb-4 pt-1 sm:px-6 sm:pt-5">
              <div className="flex items-center gap-2.5">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${isOtherUserActiveNow ? "bg-[#43885b]" : "bg-[#b0b0b0]"}`}
                  role="img"
                  aria-label={presenceLabel}
                  title={presenceLabel}
                />
                <h1 className="min-w-0 break-words text-xl font-bold tracking-tight text-[#111111]">{otherUserName}</h1>
                {chatClosed ? <span className="ml-auto shrink-0 text-xs text-[#737373]">Read-only</span> : null}
              </div>
              <p className="mt-1.5 break-words pl-[18px] text-[13px] leading-5 text-[#666666]">
                {meetingTimeLabel}<span className="px-2" aria-hidden="true">·</span>{placeLabel}
              </p>
            </header>

            <div
              ref={listRef}
              role="log"
              aria-label="Conversation"
              aria-live="polite"
              aria-relevant="additions"
              aria-busy={historyLoading}
              tabIndex={0}
              className="h-[clamp(320px,55dvh,600px)] overflow-y-auto overscroll-contain px-1 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#999999] sm:px-6 sm:py-6"
            >
              {historyLoading ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-[#737373]">
                  <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                  Loading conversation…
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isMine = message.senderId === currentUserId;
                    return (
                      <div key={message.id} className={`flex items-start gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                        {isMine && message.readReceiptVersion === 1 && checkedIds.has(message.id) && !readIds.has(message.id) ? (
                          <span role="img" aria-label="Not yet read" title="Not yet read" className="mb-7 h-1.5 w-1.5 shrink-0 self-end rounded-full bg-[#737373]" />
                        ) : null}
                        <div className="min-w-0 max-w-[88%] sm:max-w-[78%]">
                          <div data-receipt-id={!isMine && message.readReceiptVersion === 1 ? message.id : undefined} className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] rounded-2xl px-4 py-3 text-[15px] leading-[1.6] ${
                            isMine
                              ? "rounded-br-sm bg-[#202020] text-white"
                              : "rounded-bl-sm bg-[#f1f1f1] text-[#222222]"
                          }`}>
                            {message.text}
                          </div>
                          <time dateTime={message.createdAt} className={`mt-1 block px-1 text-[11px] leading-4 text-[#737373] ${isMine ? "text-right" : "text-left"}`}>
                            <span className="sr-only">{isMine ? "You" : message.senderName}, </span>
                            {formatMessageTime(message.createdAt)}
                          </time>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-sm text-[#737373]">
                  <MessageSquareMore className="mb-1 h-6 w-6 text-[#aaaaaa]" aria-hidden="true" />
                  <p className="font-medium text-[#333333]">{chatClosed ? "No saved messages" : "No messages yet"}</p>
                  <p>{chatClosed ? "This conversation is now read-only." : "Say hello or confirm details."}</p>
                </div>
              )}
            </div>

            <div className="border-t border-[#ededed] pt-3 pb-1 sm:px-5 sm:pb-5">
              {chatClosed ? (
                <p className="px-2 py-2 text-sm leading-6 text-[#666666]">{chatClosedMessage} You can still read previous messages here.</p>
              ) : (
                <div className="flex items-end gap-2 rounded-2xl border border-[#dedede] bg-white p-1.5 focus-within:border-[#777777]">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    aria-label={`Message ${otherUserName}`}
                    placeholder={`Message ${otherUserName}…`}
                    rows={2}
                    style={{ border: 0, boxShadow: "none", fontSize: 16, padding: "8px 12px" }}
                    className="min-h-[48px] min-w-0 flex-1 resize-none border-0 bg-transparent px-3 py-2 text-base leading-6 text-[#222222] outline-none placeholder:text-[#888888]"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!canSend}
                    aria-label={sending ? "Sending message" : "Send message"}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#202020] text-white transition hover:bg-[#3a3a3a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111111] disabled:cursor-not-allowed disabled:bg-[#e8e8e8] disabled:text-[#999999]"
                  >
                    {sending ? <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="h-5 w-5" aria-hidden="true" />}
                  </button>
                </div>
              )}
              {errorMessage ? <p role="alert" className="mt-2 px-2 text-sm leading-5 text-[#a12c2c]">{errorMessage}</p> : null}
            </div>
          </>
        ) : (
          <div className="flex items-start gap-3 px-5 py-6 text-sm leading-6 text-[#666666]">
            <ShieldCheck className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
            Chat is currently unavailable. Please try again later.
          </div>
        )}
      </div>
    </main>
  );
}
