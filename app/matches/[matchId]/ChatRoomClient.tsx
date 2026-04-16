"use client";

import Link from "next/link";
import { MessageSquareMore, ShieldCheck, Sparkles } from "lucide-react";

export default function ChatRoomClient({
  otherUserName,
  purposeLabel,
  meetingTimeLabel,
  placeLabel,
  provider,
  roomId,
  isProviderConfigured,
}: {
  otherUserName: string;
  purposeLabel: string;
  meetingTimeLabel: string;
  placeLabel: string;
  provider: string;
  roomId: string;
  isProviderConfigured: boolean;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
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
