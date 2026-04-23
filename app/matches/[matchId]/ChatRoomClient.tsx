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
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_MUTED_TEXT_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

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

type DebugState = {
  lastEvent: string;
  historyCount: number | null;
  fetchStatus: "idle" | "success" | "failed" | "unavailable";
  publishStatus: "idle" | "success" | "failed";
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

function formatKeyDebug(value: string | undefined) {
  if (!value) return "missing";
  if (value.length <= 12) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
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
  currentUserName,
  otherUserId,
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
  currentUserName: string;
  otherUserId: string;
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
  const [debugState, setDebugState] = useState<DebugState>({
    lastEvent: "idle",
    historyCount: null,
    fetchStatus: "idle",
    publishStatus: "idle",
  });
  const pubnubRef = useRef<InstanceType<NonNullable<typeof window.PubNub>> | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const publishKey = process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY;
  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY;

  const roomLabel = useMemo(() => roomId, [roomId]);
  const publishKeyDebug = useMemo(() => formatKeyDebug(publishKey), [publishKey]);
  const subscribeKeyDebug = useMemo(() => formatKeyDebug(subscribeKey), [subscribeKey]);
  const presenceLabel = useMemo(
    () => formatPresenceLabel(otherUserLastSeenAt),
    [otherUserLastSeenAt]
  );
  const isOtherUserActiveNow = presenceLabel === "Active now";
  const canSend =
    !chatClosed && connectionLabel === "Connected" && draft.trim().length > 0 && !sending;

  const logChatDebug = (
    event: string,
    details: Record<string, unknown> = {}
  ) => {
    setDebugState((current) => ({
      ...current,
      lastEvent: event,
    }));
    console.info("[match-chat-debug]", {
      event,
      matchId,
      roomId: roomLabel,
      ...details,
    });
  };

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
    logChatDebug("sdk-connected");

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

        logChatDebug("live-message-received", {
          timetoken: event.timetoken,
          senderId: payload.senderId || "unknown",
        });

        pushMessage({
          id: event.timetoken,
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
      if (!pubnub.fetchMessages) {
        setDebugState((current) => ({
          ...current,
          fetchStatus: "unavailable",
          historyCount: null,
          lastEvent: "history-unavailable",
        }));
        logChatDebug("history-unavailable");
        return;
      }

      try {
        logChatDebug("history-fetch-start");
        const history = await pubnub.fetchMessages({
          channels: [roomLabel],
          count: 50,
          includeUUID: true,
        });

        const channelHistory = history.channels?.[roomLabel] || [];
        setDebugState((current) => ({
          ...current,
          fetchStatus: "success",
          historyCount: channelHistory.length,
          lastEvent: "history-fetch-success",
        }));
        logChatDebug("history-fetch-success", {
          channelCount: Object.keys(history.channels || {}).length,
          messageCount: channelHistory.length,
        });

        const historyMessages =
          channelHistory
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
        void markSeenIfVisible();
      } catch (error) {
        setDebugState((current) => ({
          ...current,
          fetchStatus: "failed",
          historyCount: null,
          lastEvent: "history-fetch-failed",
        }));
        console.error("[match-chat-debug]", {
          event: "history-fetch-failed",
          matchId,
          roomId: roomLabel,
          error,
        });
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
      setErrorMessage("Chat is still connecting. Please try again in a moment.");
      return;
    }

    setSending(true);
    setErrorMessage(null);

    try {
      const activityResult = await markActivity("message");
      if (!activityResult?.ok) {
        setErrorMessage(activityResult?.error || chatClosedMessage);
        return;
      }

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
      setDebugState((current) => ({
        ...current,
        publishStatus: "success",
        lastEvent: "publish-success",
      }));
      logChatDebug("publish-success", {
        senderId: currentUserId,
      });
      setDraft("");
    } catch (error) {
      setDebugState((current) => ({
        ...current,
        publishStatus: "failed",
        lastEvent: "publish-failed",
      }));
      console.error("[match-chat-debug]", {
        event: "publish-failed",
        matchId,
        roomId: roomLabel,
        error,
      });
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
    <main className={`${APP_PAGE_BG_CLASS} px-4 py-4 text-[#2f2a26] sm:px-6 sm:py-6`}>
      <Script
        src="https://cdn.pubnub.com/sdk/javascript/pubnub.10.2.8.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onReady={() => setSdkReady(true)}
        onError={() => {
          setConnectionLabel("Unavailable");
          setErrorMessage("Chat could not connect right now. Please refresh once and try again.");
        }}
      />
      <div className="mx-auto max-w-3xl">
        <div className={`${APP_SURFACE_CARD_CLASS} rounded-[24px] p-4 sm:p-5`}>
          {isProviderConfigured ? (
            <>
              <div className="border-b border-[#dce4ea] pb-3">
                <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#7a8790]">
                  <span className={APP_EYEBROW_CLASS}>
                    {chatClosed ? "Read-only chat" : "Live chat"}
                  </span>
                </div>
                <div className={`mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${APP_MUTED_TEXT_CLASS}`}>
                  <span className="inline-flex items-center gap-2 font-semibold text-[#24323c]">
                    <span
                      className={`inline-flex h-2.5 w-2.5 rounded-full ${
                        isOtherUserActiveNow ? "bg-[#4e9d62]" : "bg-[#b6aea7]"
                      }`}
                      aria-hidden="true"
                    />
                    {otherUserName}
                  </span>
                  <span>{meetingTimeLabel}</span>
                  <span className="truncate">{placeLabel}</span>
                </div>
              </div>

              <div
                ref={listRef}
                className="mt-4 h-[315px] overflow-y-auto rounded-[18px] border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-3 py-3 sm:h-[345px] sm:px-4"
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
                            <span className="shrink-0 text-[10px] font-medium text-[#859199]">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          ) : null}
                          <div
                            className={`max-w-[82%] rounded-[20px] px-4 py-3 text-sm leading-6 shadow-sm ${
                              isMine
                                ? "border border-[#c9d5dd] bg-[linear-gradient(135deg,#ffffff_0%,#dde7ed_100%)] text-[#273740] shadow-[0_12px_22px_rgba(118,126,133,0.12),inset_0_1px_0_rgba(255,255,255,0.96)]"
                                : "border border-[#d8e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eff4f7_100%)] text-[#4c5b64]"
                            }`}
                          >
                            <div className="whitespace-pre-wrap break-words">{message.text}</div>
                          </div>
                          {!isMine ? (
                            <span className="shrink-0 text-[10px] font-medium text-[#859199]">
                              {formatMessageTime(message.createdAt)}
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-[#7a8790]">
                    <MessageSquareMore className="h-8 w-8 text-[#9aa6ad]" />
                    <div className="mt-3 font-medium text-[#52616a]">
                      {chatClosed ? "No saved messages" : "No messages yet"}
                    </div>
                    <div className="mt-1 max-w-xs leading-6">
                      {chatClosed
                        ? "This conversation is now read-only."
                        : "Start with a quick hello, confirm the time, or share an arrival update."}
                    </div>
                  </div>
                )}
              </div>

              <div className={`mt-4 rounded-[18px] p-2 sm:p-3 ${APP_SOFT_CARD_CLASS}`}>
                <div className="flex gap-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleDraftKeyDown}
                    disabled={chatClosed}
                    placeholder={
                      chatClosed ? chatClosedMessage : `Message ${otherUserName}...`
                    }
                    className={`h-[56px] min-h-[56px] flex-1 resize-none rounded-[16px] border px-4 py-[17px] text-sm leading-5 outline-none transition placeholder:text-[#96a2aa] ${
                      chatClosed
                        ? "cursor-not-allowed border-[#d9e1e6] bg-[linear-gradient(180deg,#f7fafb_0%,#eef3f6_100%)] text-[#7f8b92]"
                        : "border-[#d6e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] text-[#2f3a42] focus:border-[#bccad3] focus:bg-[#ffffff]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => void handleSend()}
                    disabled={!canSend}
                    className={`inline-flex h-[56px] shrink-0 items-center gap-2 self-end rounded-[16px] px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${APP_BUTTON_SECONDARY_CLASS}`}
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

              {chatClosed ? (
                <div className="mt-3 rounded-[14px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
                  {chatClosedMessage} You can still read previous messages here.
                </div>
              ) : null}

              {errorMessage && (
                <div className="mt-3 rounded-[14px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 text-center text-[11px] font-medium text-[#7f8b92]">
                Live Chat Powered by PubNub
              </div>
              <div className="mt-3 rounded-[14px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-[11px] leading-5 text-[#66757e]">
                <div className="font-semibold uppercase tracking-[0.16em] text-[#7c8a92]">
                  Chat debug
                </div>
                <div className="mt-1">Room: {roomLabel}</div>
                <div>Publish key: {publishKeyDebug}</div>
                <div>Subscribe key: {subscribeKeyDebug}</div>
                <div>History fetch: {debugState.fetchStatus}</div>
                <div>
                  Saved messages found:{" "}
                  {debugState.historyCount === null ? "-" : debugState.historyCount}
                </div>
                <div>Last publish: {debugState.publishStatus}</div>
                <div>Last event: {debugState.lastEvent}</div>
              </div>
            </>
          ) : (
            <div className={`rounded-[18px] px-4 py-4 ${APP_SOFT_CARD_CLASS}`}>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#71828c]" />
                <div className="text-sm leading-6 text-[#52616a]">
                  Chat is ready, but PubNub keys are not configured yet.
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/dashboard?tab=matches"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            Back to Matches
          </Link>
        </div>
      </div>
    </main>
  );
}
