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
import { formatMeetingTime, getMeetingStatus } from "../../lib/meetingTime";
import {
  getMatchBadge,
  getPurposeIcon,
  getPurposeLabel,
  parseBenefitAmount,
  formatDuration,
} from "../homeFeedHelpers";
import { useEffect, useRef, useState } from "react";

/* 🔥 FadeCard 포함 */
function FadeCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visibleRatio, setVisibleRatio] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibleRatio(entry.intersectionRatio);
      },
      {
        threshold: Array.from({ length: 101 }, (_, i) => i / 100),
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const opacity = Math.max(0.5, visibleRatio);

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transition: "opacity 0.25s ease-out",
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
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <main className="min-h-screen px-4 py-5">
      <div className="mx-auto max-w-2xl space-y-4">

        {/* 🔥 카드 리스트 */}
        <div className="space-y-4">
          {sortedPosts.map((post: any, index: number) => {
            const amount = parseBenefitAmount(post.benefit_amount);
            const status = getPostStatus(post.meeting_time);
            const matchBadge = getMatchBadge(
              status,
              matchSummaryMap[post.id]
            );

            return (
              <FadeCard key={post.id}>
                <section className="rounded-[24px] border bg-white p-4 shadow-md">
                  
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
              </FadeCard>
            );
          })}
        </div>

        {/* FAB */}
        <button className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-black text-white shadow-xl">
          <Plus />
        </button>
      </div>
    </main>
  );
}