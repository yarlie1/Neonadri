"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LoaderCircle,
  MessageSquareMore,
  Send,
  ShieldCheck,
  Sparkles,
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

export default function ChatRoomClient({
  matchId,
  otherUserName,
  purposeLabel,
  meetingTimeLabel,
  placeLabel,
  provider,
  roomId,
  isProviderConfigured,
  currentUserId,
  currentUserName,
}: {
  matchId: number;
  otherUserName: string;
  purposeLabel: string;
  meetingTimeLabel: string;
  placeLabel: string;
  provider: string;
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
  const pubnubRef = useRef<InstanceType<NonNullable<typeof window.PubNub>> | null>(null);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const publishKey = process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY;
  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY;

  const roomLabel = useMemo(() => roomId, [roomId]);
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

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <Script
        src="https://cdn.pubnub.com/sdk/javascript/pubnub.10.2.8.js"
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
      />
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="relative overflow-hidden rounded-[30px] border border-[#ece0d4] bg-[radial-gradient(circle_at_top_left,#fffbf7_0%,#f6e8dd_44%,#edd8ca_100%)] px-6 py-6 shadow-[0_18px_42px_rgba(92,69,52,0.08)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
            <div className="text-[11px] tracking-[0.28em] text-[#9b8f84]">MATCH CHAT</div>
            <div className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#2b1f1a] sm:text-[36px]">
              Chat with {otherUserName}
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-[#5f453b]">
              <span className="rounded-full border border-[#dfd1c3] bg-white/70 px-3 py-1.5">
                {purposeLabel}
              </span>
              <span className="rounded-full border border-[#dfd1c3] bg-white/70 px-3 py-1.5">
                {meetingTimeLabel}
              </span>
              <span className="rounded-full border border-[#dfd1c3] bg-white/70 px-3 py-1.5">
                {placeLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#eadfd3] bg-white/92 p-5 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#ebded1] bg-[#fbf6f0] text-[#8d6f61]">
              <MessageSquareMore className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9d7362]">
                PubNub setup
              </div>
              <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
                {isProviderConfigured
                  ? "Chat foundation is ready"
                  : "Chat foundation is ready. Provider keys come next."}
              </div>
              <p className="mt-2 text-sm leading-6 text-[#6a5e54]">
                We already created and protected a match-specific room on the Neonadri side.
                The next step is wiring the PubNub publish/subscribe keys and rendering the
                actual message stream in this panel.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-[#ece1d4] bg-[#fbf6f0] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                Provider
              </div>
              <div className="mt-2 text-sm font-medium text-[#4f443b]">{provider}</div>
            </div>
            <div className="rounded-[18px] border border-[#ece1d4] bg-[#fbf6f0] px-4 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                Room ID
              </div>
              <div className="mt-2 break-all text-sm font-medium text-[#4f443b]">{roomId}</div>
            </div>
          </div>

          {isProviderConfigured ? (
            <div className="mt-4 rounded-[18px] border border-[#ece1d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e8_100%)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfd3] pb-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Live chat
                  </div>
                  <div className="mt-1 text-sm font-medium text-[#4f443b]">
                    {connectionLabel}
                  </div>
                </div>
                <div className="text-xs text-[#8c7e73]">Messages are stored by PubNub, not Neonadri.</div>
              </div>

              <div
                ref={listRef}
                className="mt-4 h-[360px] overflow-y-auto rounded-[16px] border border-[#ece1d4] bg-white px-3 py-3"
              >
                {messages.length > 0 ? (
                  <div className="space-y-3">
                    {messages.map((message) => {
                      const isMine = message.senderId === currentUserId;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[78%] rounded-[18px] px-4 py-3 text-sm leading-6 shadow-sm ${
                              isMine
                                ? "bg-[linear-gradient(135deg,#ffdca9_0%,#f7c87d_100%)] text-[#5d3e15]"
                                : "bg-[#f7efe7] text-[#4f443b]"
                            }`}
                          >
                            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-70">
                              {isMine ? "You" : message.senderName}
                            </div>
                            <div className="mt-1 whitespace-pre-wrap break-words">{message.text}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-[#8c7e73]">
                    No messages yet. Start with a quick check-in.
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={`Message ${otherUserName}...`}
                  className="min-h-[104px] flex-1 resize-none rounded-[18px] border border-[#e3d7ca] bg-white px-4 py-3 text-sm text-[#2f2a26] outline-none transition placeholder:text-[#a29185] focus:border-[#cfb8a4]"
                />
                <button
                  type="button"
                  onClick={() => void handleSend()}
                  disabled={sending || !draft.trim()}
                  className="inline-flex h-[52px] shrink-0 items-center gap-2 self-end rounded-full border border-[#dccfc2] bg-white px-4 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </button>
              </div>

              {errorMessage && (
                <div className="mt-3 rounded-[14px] border border-[#eadfd3] bg-[#fbf6f0] px-4 py-3 text-sm text-[#7b6256]">
                  {errorMessage}
                </div>
              )}
            </div>
          ) : null}

          <div className="mt-4 rounded-[18px] border border-[#ece1d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e8_100%)] px-4 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
              <div className="text-sm leading-6 text-[#5f5347]">
                This room only opens for matched participants. Neonadri stores the match-to-room
                link, but not the chat body itself.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/dashboard?tab=matches"
              className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Back to Matches
            </Link>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e5d7cb] bg-[#fbf6f0] px-4 py-2 text-sm font-medium text-[#7b6f65]">
              <Sparkles className="h-4 w-4" />
              {isProviderConfigured
                ? "PubNub keys detected"
                : "PubNub keys not configured yet"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
