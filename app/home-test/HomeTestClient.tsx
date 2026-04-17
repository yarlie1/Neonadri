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
  getPurposeTheme,
  parseBenefitAmount,
  formatDuration,
} from "../homeFeedHelpers";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
};

type HostProfileMap = Record<
  string,
  {
    displayName: string;
    gender: string;
    ageGroup: string;
  }
>;

type MatchSummaryMap = Record<
  number,
  {
    isMatched: boolean;
    pendingRequestCount: number;
    totalRequestCount: number;
  }
>;

export default function HomeTestClient({
  posts,
  hostProfileMap,
  matchSummaryMap,
  initialUserTimeZone,
}: {
  posts: PostRow[];
  hostProfileMap: HostProfileMap;
  matchSummaryMap: MatchSummaryMap;
  initialUserTimeZone: string;
}) {
  const formatTime = (meetingTime: string | null) =>
    formatMeetingTime(meetingTime, initialUserTimeZone) || "Time TBD";
  const getPostStatus = (meetingTime: string | null) =>
    getMeetingStatus(meetingTime, initialUserTimeZone);

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const highlightedPost = sortedPosts[0] || null;
  const upcomingCount = posts.filter(
    (post) => getPostStatus(post.meeting_time) === "Upcoming"
  ).length;
  const hostCount = Object.keys(hostProfileMap).length;

  return (
    <main className="min-h-screen overflow-hidden bg-[#07111f] px-4 py-5 text-[#e7f2ff]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#1d3d6c33_0%,transparent_34%),linear-gradient(180deg,#08111e_0%,#0a1322_52%,#07111f_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(95,196,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(95,196,255,0.05)_1px,transparent_1px)] bg-[size:22px_22px] opacity-40" />

      <div className="relative mx-auto max-w-2xl space-y-4 pb-24 sm:space-y-5">
        <section className="relative overflow-hidden rounded-[36px] border border-[#74d4ff40] bg-[linear-gradient(145deg,rgba(12,27,46,0.96)_0%,rgba(15,37,61,0.92)_54%,rgba(11,20,34,0.98)_100%)] px-5 py-6 shadow-[0_24px_72px_rgba(23,117,204,0.22),inset_0_1px_0_rgba(255,255,255,0.07)] sm:px-7 sm:py-8">
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#74d4ff1f] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#62f2c81a] blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8be9ff55] bg-[#0d2037cc] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#8be9ff] shadow-[0_0_20px_rgba(90,214,255,0.12)]">
              <Sparkles className="h-3.5 w-3.5" />
              AI social layer
            </div>

            <h1 className="mt-4 max-w-md text-[35px] font-black leading-[0.94] tracking-[-0.06em] text-white sm:text-[42px]">
              Meet someone new in a softer future.
            </h1>

            <p className="mt-4 max-w-lg text-[14px] leading-6 text-[#a6bed6] sm:text-[15px]">
              Same structure, different mood. Calm cyber surfaces, AI-native
              glow, and a quieter way to browse local social energy.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[24px] border border-[#87dfff3a] bg-[linear-gradient(180deg,rgba(14,34,56,0.92)_0%,rgba(10,23,38,0.92)_100%)] px-3 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#82cfe8]">
                  Live now
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">
                  {upcomingCount}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#87dfff3a] bg-[linear-gradient(180deg,rgba(14,34,56,0.92)_0%,rgba(10,23,38,0.92)_100%)] px-3 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#82cfe8]">
                  Hosts
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-white">
                  {hostCount}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#87dfff3a] bg-[linear-gradient(180deg,rgba(14,34,56,0.92)_0%,rgba(10,23,38,0.92)_100%)] px-3 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#82cfe8]">
                  Signal
                </div>
                <div className="mt-1 text-sm font-bold leading-5 text-white">
                  Chill
                  <br />
                  Cyber
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Neon coffee", "Afterglow walks", "Quiet co-work"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[#8be9ff40] bg-[#0d2037b8] px-3 py-2 text-xs font-medium text-[#d5f4ff] shadow-[0_0_16px_rgba(65,177,230,0.08)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {highlightedPost && (
          <section className="overflow-hidden rounded-[32px] border border-[#6ed2ff38] bg-[linear-gradient(180deg,rgba(10,24,40,0.98)_0%,rgba(8,18,32,0.95)_100%)] shadow-[0_24px_70px_rgba(10,91,153,0.18)]">
            <div className="border-b border-[#7bd7ff1c] px-5 py-[18px]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7edcff]">
                    <Search className="h-3.5 w-3.5" />
                    Featured signal
                  </div>
                  <div className="mt-1 text-lg font-bold tracking-[-0.03em] text-white">
                    {highlightedPost.place_name || highlightedPost.location || "Meetup"}
                  </div>
                </div>

                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#88e7ff44] bg-[#0d2037cc] text-[#9cefff]">
                  <Plus className="h-4 w-4 rotate-45" />
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1.4fr_1fr] sm:px-5">
              <div className="rounded-[26px] border border-[#7adfff26] bg-[linear-gradient(180deg,rgba(16,37,62,0.86)_0%,rgba(8,21,37,0.88)_100%)] px-4 py-4 text-white">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#8ce6ff40] bg-[#0d2037cc] px-3 py-1.5 text-xs font-medium text-[#baf6ff]">
                  {getPurposeIcon(highlightedPost.meeting_purpose)}
                  {highlightedPost.meeting_purpose || "Meetup"}
                </div>

                <div className="mt-4 text-2xl font-black leading-[1.02] tracking-[-0.04em]">
                  {getPurposeLabel(highlightedPost.meeting_purpose)}
                </div>

                <div className="mt-2 text-sm leading-6 text-[#9eb9d0]">
                  Same featured module, re-skinned for a calm machine-era mood.
                </div>
              </div>

              <div className="space-y-2.5 rounded-[24px] border border-[#7adfff26] bg-[linear-gradient(180deg,rgba(12,28,46,0.92)_0%,rgba(7,18,31,0.94)_100%)] px-4 py-4 text-[#dff6ff]">
                <div className="flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4 text-[#7edcff]" />
                  <span>{formatTime(highlightedPost.meeting_time)}</span>
                </div>
                <div className="flex min-w-0 items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#7edcff]" />
                  <span className="block min-w-0 flex-1 break-words line-clamp-2">
                    {highlightedPost.location ||
                      highlightedPost.place_name ||
                      "Location TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Search className="h-4 w-4 text-[#7edcff]" />
                  <span>
                    {highlightedPost.target_gender || "Any"} /{" "}
                    {highlightedPost.target_age_group || "Any"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="sticky top-[68px] z-20 sm:top-[76px]">
          <div className="rounded-[28px] border border-[#7adfff2f] bg-[linear-gradient(180deg,rgba(8,21,36,0.96)_0%,rgba(10,25,42,0.94)_100%)] shadow-[0_18px_40px_rgba(12,76,124,0.18)]">
            <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#e8fbff]">
                  <SlidersHorizontal className="h-4 w-4 text-[#7edcff]" />
                  Shape your signal
                </div>
                <div className="mt-2 text-sm text-[#96b5cb]">
                  Static test shell for color, texture, type, and chrome.
                </div>
              </div>

              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#7adfff38] bg-[#0d2037cc] text-[#7edcff] shadow-[0_0_16px_rgba(65,177,230,0.10)]">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#79dfff]">
              Discover
            </div>
            <div className="mt-1 text-xl font-black tracking-[-0.04em] text-white">
              Nearby social moments
            </div>
          </div>

          <div className="rounded-[24px] border border-[#7adfff36] bg-[#0d2037cc] px-3 py-1.5 text-xs font-medium text-[#b6e7f7]">
            {sortedPosts.length} results
          </div>
        </div>

        {sortedPosts.map((post) => {
          const amount = parseBenefitAmount(post.benefit_amount);
          const host = hostProfileMap[post.user_id] || {
            displayName: "Unknown",
            gender: "",
            ageGroup: "",
          };
          const status = getPostStatus(post.meeting_time);
          const isExpired = status === "Expired";
          const matchBadge = getMatchBadge(
            status as "Upcoming" | "Expired",
            matchSummaryMap[post.id]
          );
          const purposeTheme = getPurposeTheme(post.meeting_purpose);

          return (
            <section
              key={post.id}
              className={`overflow-hidden rounded-[32px] border p-[14px] shadow-[0_20px_48px_rgba(12,83,140,0.18)] sm:p-4 ${
                isExpired
                  ? "border-[#4f64774d] bg-[linear-gradient(180deg,rgba(10,20,31,0.96)_0%,rgba(7,16,26,0.94)_100%)]"
                  : "border-[#74d4ff33] bg-[linear-gradient(180deg,rgba(10,25,42,0.98)_0%,rgba(8,18,31,0.94)_100%)]"
              }`}
            >
              <div className="rounded-[24px] border border-[#7bd7ff1f] bg-[linear-gradient(180deg,rgba(13,30,49,0.94)_0%,rgba(8,19,33,0.94)_100%)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#7adfff36] bg-[#0f2843] text-[#aef2ff]">
                        {getPurposeIcon(post.meeting_purpose, "h-5 w-5 shrink-0")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-black tracking-[-0.04em] text-white">
                          {post.meeting_purpose || "Social meetup"}
                        </div>
                        <div className="mt-0.5 text-xs text-[#88a7bc]">
                          Hosted by {host.displayName}
                          {host.gender || host.ageGroup
                            ? ` · ${host.gender || "Unknown"}${
                                host.ageGroup ? ` / ${host.ageGroup}` : ""
                              }`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${matchBadge.className} ${
                      isExpired ? "opacity-70" : ""
                    }`}
                  >
                    {matchBadge.label}
                  </span>
                </div>

                <div className="mt-4 grid gap-2.5 text-sm text-[#dff6ff]">
                  <div className="flex items-center gap-2 rounded-[18px] border border-[#7bd7ff1f] bg-[#0c2036] px-3 py-2.5">
                    <Clock3 className="h-4 w-4 text-[#7edcff]" />
                    <span className="truncate">{formatTime(post.meeting_time)}</span>
                    {formatDuration(post.duration_minutes) ? (
                      <span className="ml-auto rounded-full border border-[#7adfff2a] bg-[#112944] px-2 py-0.5 text-[11px] font-medium text-[#9eeeff]">
                        {formatDuration(post.duration_minutes)}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-start gap-2 rounded-[18px] border border-[#7bd7ff1f] bg-[#0c2036] px-3 py-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 text-[#7edcff]" />
                    <span className="min-w-0 flex-1 break-words">
                      {post.place_name || post.location || "No place"}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-[18px] border border-[#7bd7ff1f] bg-[#0c2036] px-3 py-2.5">
                      <UserRound className="h-4 w-4 text-[#7edcff]" />
                      <span>
                        {post.target_gender || "Any"} /{" "}
                        {post.target_age_group || "Any"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-[18px] border border-[#7bd7ff1f] bg-[#0c2036] px-3 py-2.5">
                      <Coins className="h-4 w-4 text-[#62f2c8]" />
                      <span>
                        {amount !== null ? `+$${amount.toLocaleString()}` : "No benefit"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-[#7adfff20] bg-[linear-gradient(90deg,rgba(14,34,56,0.88)_0%,rgba(12,48,63,0.56)_100%)] px-3 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#84dff2]">
                    {purposeTheme.pillClass.includes("text-[#") ? "AI-chill mode" : "Signal"}
                  </div>
                  <div className="text-sm font-semibold text-[#dff6ff]">
                    {getPurposeLabel(post.meeting_purpose)}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {sortedPosts.length === 0 && (
          <div className="rounded-[32px] border border-[#74d4ff28] bg-[linear-gradient(180deg,rgba(10,25,42,0.98)_0%,rgba(8,18,31,0.94)_100%)] px-5 py-10 text-center text-[#9bb7cb] sm:px-6 sm:py-12">
            No meetups found.
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-5 z-40 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#88e7ff44] bg-[linear-gradient(135deg,#16385c_0%,#0f2037_100%)] text-[#b8f7ff] shadow-[0_22px_46px_rgba(24,100,170,0.30)]">
        <Plus className="h-6 w-6" />
      </div>
    </main>
  );
}
