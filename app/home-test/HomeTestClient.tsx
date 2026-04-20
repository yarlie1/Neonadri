"use client";

import {
  Clock3,
  Coins,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatMeetingTime, getMeetingStatus } from "../../lib/meetingTime";
import {
  getMatchBadge,
  getPurposeIcon,
  getPurposeLabel,
  parseBenefitAmount,
  formatDuration,
} from "../homeFeedHelpers";

function ViewportFadeCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setRatio(entry.intersectionRatio);
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const opacity = Math.max(0.5, ratio);

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transition: "opacity 0.2s ease-out",
      }}
    >
      {children}
    </div>
  );
}

export default function HomeTestClient({
  posts,
  hostProfileMap,
  matchSummaryMap,
  initialUserTimeZone,
}: any) {
  const formatTime = (meetingTime: string | null) =>
    formatMeetingTime(meetingTime, initialUserTimeZone) || "Time TBD";

  const getPostStatus = (meetingTime: string | null) =>
    getMeetingStatus(meetingTime, initialUserTimeZone);

  const sortedPosts = [...posts].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const metaRowClass =
    "flex min-h-[60px] items-center gap-2.5 rounded-[16px] border border-[#dde3e7] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(244,246,247,0.86)_100%)] px-3.5 py-2.5 text-sm text-[#364149] shadow-[0_8px_18px_rgba(118,126,133,0.05)]";

  return (
    <main className="min-h-screen px-4 py-5 text-[#2f3a42]">
      <div className="mx-auto max-w-2xl space-y-4 pb-28">

        {/* 리스트 */}
        <div className="space-y-4">
          {sortedPosts.map((post: any, index: number) => {
            const amount = parseBenefitAmount(post.benefit_amount);
            const status = getPostStatus(post.meeting_time);
            const matchBadge = getMatchBadge(
              status,
              matchSummaryMap[post.id]
            );

            // 👉 부드러운 좌우 흐름만 유지
            const offsetClass =
              index === 0
                ? "mt-2"
                : index % 3 === 1
                ? "ml-2 sm:ml-3"
                : index % 3 === 2
                ? "mr-2 sm:mr-3"
                : "";

            return (
              <ViewportFadeCard key={post.id}>
                <section
                  className={`rounded-[24px] border p-4 shadow-md bg-white ${offsetClass}`}
                >
                  <div className="flex justify-between">
                    <div className="text-lg font-semibold">
                      {getPurposeLabel(post.meeting_purpose)}
                    </div>
                    <div className="text-xs">{matchBadge.label}</div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <Clock3 className="h-4 w-4" />
                      {formatTime(post.meeting_time)}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <MapPin className="h-4 w-4" />
                      {post.location}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between text-sm">
                    <div className="flex gap-2">
                      <UserRound className="h-4 w-4" />
                      {post.target_gender || "Any"}
                    </div>

                    <div className="flex gap-1 items-center font-semibold">
                      <Coins className="h-4 w-4" />
                      {amount ? `$${amount}` : "-"}
                    </div>
                  </div>
                </section>
              </ViewportFadeCard>
            );
          })}
        </div>

        {/* FAB */}
        <button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-black text-white shadow-xl flex items-center justify-center">
          <Plus />
        </button>
      </div>
    </main>
  );
}