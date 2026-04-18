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
  const surfaceClass =
    "border border-[#e2e7eb] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(246,248,249,0.985)_30%,rgba(231,235,238,0.985)_100%)] shadow-[0_16px_34px_rgba(118,126,133,0.12),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,208,214,0.42)]";
  const metaRowClass =
    "flex min-h-[62px] items-center gap-2.5 rounded-[16px] border border-[#dde3e7] bg-[linear-gradient(180deg,#ffffff_0%,#f3f5f7_100%)] px-3.5 py-2.5 text-sm text-[#364149] shadow-[inset_0_1px_0_rgba(255,255,255,0.98)]";

  return (
    <main className="min-h-screen overflow-hidden bg-[#eceff1] px-4 py-5 text-[#2f3a42]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#fcfdfe_24%,#eef2f4_58%,#e2e7eb_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.76),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(251,252,253,0.42),transparent_22%),radial-gradient(circle_at_60%_100%,rgba(228,233,237,0.24),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:22px_22px] opacity-36" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_44%,rgba(255,255,255,0.28)_49%,transparent_54%,transparent_100%)] opacity-85" />

      <div className="relative mx-auto max-w-2xl space-y-4 pb-24 sm:space-y-5">
        <section className="relative overflow-hidden rounded-[32px] border border-[#edf1f4] bg-[linear-gradient(145deg,rgba(255,255,255,0.995)_0%,rgba(247,249,250,0.985)_36%,rgba(232,236,239,0.99)_100%)] px-5 py-5 shadow-[0_26px_66px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(204,210,215,0.36)] sm:px-7 sm:py-7">
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#ffffffeb] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#f5f9fcc7] blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(255,255,255,0.34)_45%,rgba(255,255,255,0.0)_100%)]" />
          <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.98),transparent)]" />
          <div className="absolute inset-x-0 top-[28%] h-[1px] bg-[linear-gradient(90deg,transparent,rgba(244,248,251,0.55),transparent)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eef2f4] bg-[#ffffffd9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7e858b] shadow-[0_10px_22px_rgba(136,142,148,0.08)]">
              <Sparkles className="h-3.5 w-3.5" />
              Soft social layer
            </div>

            <h1 className="mt-3 max-w-lg text-[35px] font-black leading-[0.92] tracking-[-0.065em] text-[#1f2b34] sm:mt-4 sm:text-[44px]">
              Find someone new, without the noise.
            </h1>

            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#667179] sm:mt-4 sm:text-[15px]">
              A quieter way to discover nearby meetups. Soft silver surfaces,
              calm pacing, and just enough AI presence to make browsing feel easy.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:mt-7 sm:gap-3">
              <div className="relative overflow-hidden rounded-[22px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(246,248,249,0.985)_40%,rgba(233,237,240,0.99)_100%)] px-3.5 py-3.5 shadow-[0_16px_30px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.92),transparent)]" />
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#888f94]">
                  Happening now
                </div>
                <div className="mt-1.5 text-[30px] font-black tracking-[-0.05em] text-[#24323f]">
                  {upcomingCount}
                </div>
                <div className="mt-1 text-[11px] text-[#868d92]">Open right now</div>
              </div>

              <div className="relative overflow-hidden rounded-[22px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(246,248,249,0.985)_40%,rgba(233,237,240,0.99)_100%)] px-3.5 py-3.5 shadow-[0_16px_30px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.92),transparent)]" />
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#888f94]">
                  Hosts nearby
                </div>
                <div className="mt-1.5 text-[30px] font-black tracking-[-0.05em] text-[#24323f]">
                  {hostCount}
                </div>
                <div className="mt-1 text-[11px] text-[#868d92]">Across the city</div>
              </div>

              <div className="relative overflow-hidden rounded-[22px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(246,248,249,0.985)_40%,rgba(233,237,240,0.99)_100%)] px-3.5 py-3.5 shadow-[0_16px_30px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.92),transparent)]" />
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#81878d]">
                  Mood
                </div>
                <div className="mt-1.5 text-sm font-bold leading-5 text-[#24323f]">
                  Chill
                  <br />
                  Lab
                </div>
                <div className="mt-1 text-[11px] text-[#868d92]">Softly guided</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5">
              {["Slow coffee", "Afterglow walks", "Quiet co-work"].map((label) => (
                <span
                  key={label}
                  className="rounded-[15px] border border-[#e5eaee] bg-[linear-gradient(180deg,#ffffff_0%,#f1f4f6_100%)] px-3 py-1.5 text-[11px] font-medium text-[#66727a] shadow-[0_8px_16px_rgba(118,126,133,0.08)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {highlightedPost && (
          <section className="overflow-hidden rounded-[30px] border border-[#edf1f4] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(247,249,250,0.99)_38%,rgba(236,240,243,0.99)_100%)] shadow-[0_26px_64px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(201,208,214,0.28)]">
            <div className="border-b border-[#e3e6e8] px-5 py-4 sm:py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#838b91]">
                    <Search className="h-3.5 w-3.5" />
                    Featured moment
                  </div>
                  <div className="mt-2 text-[28px] font-black tracking-[-0.05em] text-[#24323f]">
                    {highlightedPost.place_name || highlightedPost.location || "Meetup"}
                  </div>
                </div>

                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#edf1f4] bg-[#ffffff] text-[#7e868d] shadow-[0_12px_24px_rgba(136,142,148,0.09)]">
                  <Plus className="h-4 w-4 rotate-45" />
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1.45fr_0.95fr] sm:px-5 sm:py-5">
              <div className="relative overflow-hidden rounded-[24px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(247,249,250,0.985)_50%,rgba(235,239,242,0.99)_100%)] px-4 py-3.5 text-[#24323f] shadow-[0_18px_34px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.94),transparent)]" />
                <div className="inline-flex items-center gap-2 rounded-full border border-[#eef2f4] bg-[#ffffffd8] px-3 py-1.5 text-xs font-medium text-[#788087]">
                  {getPurposeIcon(highlightedPost.meeting_purpose)}
                  {highlightedPost.meeting_purpose || "Meetup"}
                </div>

                <div className="mt-3 text-[30px] font-black leading-[0.98] tracking-[-0.05em] sm:mt-4">
                  {getPurposeLabel(highlightedPost.meeting_purpose)}
                </div>

                <div className="mt-2.5 max-w-md text-sm leading-6 text-[#707980] sm:mt-3">
                  A quieter featured moment with a little more room to breathe.
                </div>
              </div>

              <div className="relative overflow-hidden space-y-2 rounded-[20px] border border-[#e3e8ec] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(245,247,248,0.985)_100%)] px-4 py-3.5 text-[#38434b] shadow-[0_14px_26px_rgba(118,126,133,0.08)] sm:space-y-2.5 sm:py-4">
                <div className="absolute inset-x-0 top-0 h-[1px] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.92),transparent)]" />
                <div className="flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4 text-[#7c8489]" />
                  <span>{formatTime(highlightedPost.meeting_time)}</span>
                </div>
                <div className="flex min-w-0 items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#7c8489]" />
                  <span className="block min-w-0 flex-1 break-words line-clamp-2">
                    {highlightedPost.location ||
                      highlightedPost.place_name ||
                      "Location TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Search className="h-4 w-4 text-[#7c8489]" />
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
          <div className="rounded-[22px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(253,253,253,0.995)_0%,rgba(243,245,246,0.98)_100%)] shadow-[0_16px_34px_rgba(118,126,133,0.09)]">
            <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2f3b44]">
                  <SlidersHorizontal className="h-4 w-4 text-[#7f888e]" />
                  Refine your view
                </div>
                <div className="mt-2 text-sm text-[#707b83]">
                  A design sandbox for softer hierarchy, lighter surfaces, and a
                  calmer way to scan the page.
                </div>
              </div>

              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] border border-[#edf1f4] bg-[#ffffff] text-[#7e878d] shadow-[0_10px_18px_rgba(146,154,162,0.08)]">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#848d93]">
              Discover
            </div>
            <div className="mt-1 text-xl font-black tracking-[-0.04em] text-[#24323f]">
              Nearby invitations
            </div>
          </div>

          <div className="rounded-[16px] border border-[#edf1f4] bg-[#ffffffd8] px-3 py-1.5 text-xs font-medium text-[#747f86] shadow-[0_8px_18px_rgba(146,154,162,0.07)]">
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

          return (
            <section
              key={post.id}
              className={`overflow-hidden rounded-[24px] border p-2.5 shadow-[0_18px_36px_rgba(118,126,133,0.12)] sm:p-3 ${
                isExpired
                  ? "border-[#d6dde2] bg-[linear-gradient(180deg,rgba(236,240,243,0.97)_0%,rgba(221,227,232,0.95)_100%)]"
                  : "border-[#e4ebef] bg-[linear-gradient(180deg,rgba(248,250,252,0.985)_0%,rgba(228,235,240,0.95)_100%)]"
              }`}
            >
              <div className="rounded-[18px] border border-[#e6edf1] bg-[linear-gradient(180deg,rgba(253,254,255,0.998)_0%,rgba(238,243,246,0.975)_100%)] px-4 py-3.5 shadow-[0_16px_28px_rgba(118,126,133,0.1),inset_0_1px_0_rgba(255,255,255,1)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-[#d7dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f2f5f7_100%)] text-[#6f808a] shadow-[0_8px_16px_rgba(118,126,133,0.08)]">
                        {getPurposeIcon(post.meeting_purpose, "h-5 w-5 shrink-0")}
                      </div>
                      <div className="min-w-0 truncate text-[24px] font-black leading-none tracking-[-0.05em] text-[#1f2b34]">
                        {post.meeting_purpose || "Social meetup"}
                      </div>
                    </div>
                    <div className="mt-1 pl-[50px] text-[12px] leading-none text-[#75818a]">
                      Hosted by {host.displayName}
                      {host.gender || host.ageGroup
                        ? ` | ${host.gender || "Unknown"}${
                            host.ageGroup ? ` / ${host.ageGroup}` : ""
                          }`
                        : ""}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-[14px] border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[0_6px_14px_rgba(118,126,133,0.08),inset_0_1px_0_rgba(255,255,255,0.78)] ${
                      matchBadge.label.startsWith("Open")
                        ? "border-[#d9e0e5] bg-[linear-gradient(180deg,#ffffff_0%,#edf2f5_100%)] text-[#4d646c]"
                        : matchBadge.label === "Matched"
                        ? "border-[#d8e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#edf2f5_100%)] text-[#54656d]"
                        : "border-[#d9e0e4] bg-[linear-gradient(180deg,#ffffff_0%,#eef2f4_100%)] text-[#7b858c]"
                    } ${
                      isExpired ? "opacity-70" : ""
                    }`}
                  >
                    {matchBadge.label}
                  </span>
                </div>

                <div className="mt-3.5 grid gap-1.5">
                  <div className={`${metaRowClass} min-h-[56px] py-2`}>
                    <Clock3 className="h-4 w-4 shrink-0 text-[#788b95]" />
                    <span className="truncate">{formatTime(post.meeting_time)}</span>
                    {formatDuration(post.duration_minutes) ? (
                    <span className="ml-auto rounded-[14px] border border-[#cbd4db] bg-[linear-gradient(180deg,#ffffff_0%,#eceff2_100%)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52616a] shadow-[0_8px_14px_rgba(118,126,133,0.12)]">
                        {formatDuration(post.duration_minutes)}
                      </span>
                    ) : null}
                  </div>

                  <div className={`${metaRowClass} min-h-[56px] py-2`}>
                    <MapPin className="h-4 w-4 shrink-0 text-[#788b95]" />
                    <span className="min-w-0 flex-1 break-words">
                      {post.place_name || post.location || "No place"}
                    </span>
                  </div>

                  <div className="flex min-h-[34px] flex-wrap items-center justify-between gap-x-3 gap-y-1 px-1 pt-0 text-sm text-[#55646e]">
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-[#788b95]" />
                      {post.target_gender || "Any"} / {post.target_age_group || "Any"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-[14px] border border-[#ced7de] bg-[linear-gradient(180deg,#ffffff_0%,#edf1f4_100%)] px-3 py-1.5 font-semibold text-[#435760] shadow-[0_8px_16px_rgba(118,126,133,0.12)]">
                      <Coins className="h-4 w-4 text-[#7b8d97]" />
                      {amount !== null ? `+$${amount.toLocaleString()}` : "No benefit"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-[#dde4e9] bg-[linear-gradient(90deg,rgba(252,253,254,0.96)_0%,rgba(237,241,244,0.88)_100%)] px-3 py-1.5">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#7a8b95]">
                    Refined mode
                  </div>
                  <div className="text-right text-sm font-semibold text-[#314454]">
                    {getPurposeLabel(post.meeting_purpose)}
                  </div>
                </div>
              </div>
            </section>
          );
        })}

        {sortedPosts.length === 0 && (
          <div className="rounded-[32px] border border-[#e6eff4] bg-[linear-gradient(180deg,rgba(248,251,253,0.98)_0%,rgba(226,234,240,0.94)_100%)] px-5 py-10 text-center text-[#69808f] sm:px-6 sm:py-12">
            No meetups found.
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-5 z-40 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#d8e6ee] bg-[linear-gradient(135deg,#fdfefe_0%,#dfe8ee_100%)] text-[#648996] shadow-[0_24px_48px_rgba(148,168,183,0.22)]">
        <Plus className="h-6 w-6" />
      </div>
    </main>
  );
}
