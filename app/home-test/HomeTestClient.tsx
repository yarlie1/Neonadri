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
    "border border-[#f2f4f6] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(242,245,247,0.96)_38%,rgba(230,234,237,0.98)_100%)] shadow-[0_14px_30px_rgba(148,157,165,0.09),inset_0_1px_0_rgba(255,255,255,0.98)]";
  const metaRowClass =
    "rounded-[18px] border border-[#e7eaec] bg-[#fcfcfc] px-3 py-2.5 text-sm text-[#3a464f]";

  return (
    <main className="min-h-screen overflow-hidden bg-[#eaedf0] px-4 py-5 text-[#2f3a42]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8fafb_30%,#e6ebef_68%,#dbe1e6_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.72),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(246,249,251,0.58),transparent_22%),radial-gradient(circle_at_60%_100%,rgba(224,230,235,0.28),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:22px_22px] opacity-36" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_44%,rgba(255,255,255,0.24)_49%,transparent_54%,transparent_100%)] opacity-80" />

      <div className="relative mx-auto max-w-2xl space-y-4 pb-24 sm:space-y-5">
        <section className="relative overflow-hidden rounded-[36px] border border-[#fafbfc] bg-[linear-gradient(145deg,rgba(255,255,255,0.99)_0%,rgba(245,248,250,0.98)_42%,rgba(229,234,238,0.99)_100%)] px-5 py-6 shadow-[0_28px_80px_rgba(145,154,162,0.14),inset_0_1px_0_rgba(255,255,255,0.98)] sm:px-7 sm:py-8">
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#ffffffeb] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#f7f9fabf] blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(255,255,255,0.28)_45%,rgba(255,255,255,0.0)_100%)]" />
          <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.98),transparent)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eef1f3] bg-[#ffffffd6] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7c858c] shadow-[0_10px_22px_rgba(150,159,167,0.1)]">
              <Sparkles className="h-3.5 w-3.5" />
              Soft social layer
            </div>

            <h1 className="mt-4 max-w-lg text-[35px] font-black leading-[0.92] tracking-[-0.065em] text-[#24323f] sm:text-[44px]">
              Find someone new, without the noise.
            </h1>

            <p className="mt-4 max-w-xl text-[14px] leading-6 text-[#6e7982] sm:text-[15px]">
              A quieter way to discover nearby meetups. Soft silver surfaces,
              calm pacing, and just enough AI presence to make browsing feel easy.
            </p>

            <div className="mt-7 grid grid-cols-3 gap-3">
              <div className="rounded-[26px] border border-[#f0f3f5] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(245,247,248,0.98)_54%,rgba(233,237,240,0.99)_100%)] px-3.5 py-4 shadow-[0_18px_34px_rgba(145,154,162,0.1),inset_0_1px_0_rgba(255,255,255,0.98)]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#8a9399]">
                  Happening now
                </div>
                <div className="mt-1.5 text-[30px] font-black tracking-[-0.05em] text-[#24323f]">
                  {upcomingCount}
                </div>
                <div className="mt-1 text-[11px] text-[#8a9297]">Open right now</div>
              </div>

              <div className="rounded-[26px] border border-[#f0f3f5] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(245,247,248,0.98)_54%,rgba(233,237,240,0.99)_100%)] px-3.5 py-4 shadow-[0_18px_34px_rgba(145,154,162,0.1),inset_0_1px_0_rgba(255,255,255,0.98)]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#8a9399]">
                  Hosts nearby
                </div>
                <div className="mt-1.5 text-[30px] font-black tracking-[-0.05em] text-[#24323f]">
                  {hostCount}
                </div>
                <div className="mt-1 text-[11px] text-[#8a9297]">Across the city</div>
              </div>

              <div className="rounded-[26px] border border-[#f0f3f5] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(245,247,248,0.98)_54%,rgba(233,237,240,0.99)_100%)] px-3.5 py-4 shadow-[0_18px_34px_rgba(145,154,162,0.1),inset_0_1px_0_rgba(255,255,255,0.98)]">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#818c93]">
                  Mood
                </div>
                <div className="mt-1.5 text-sm font-bold leading-5 text-[#24323f]">
                  Chill
                  <br />
                  Lab
                </div>
                <div className="mt-1 text-[11px] text-[#8a9297]">Softly guided</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {["Slow coffee", "Afterglow walks", "Quiet co-work"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[#eef1f3] bg-[#ffffffd8] px-3 py-1.5 text-[11px] font-medium text-[#707b83] shadow-[0_8px_18px_rgba(150,159,167,0.08)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {highlightedPost && (
          <section className="overflow-hidden rounded-[34px] border border-[#f6f7f8] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(244,247,249,0.99)_44%,rgba(236,240,244,0.99)_100%)] shadow-[0_30px_88px_rgba(145,154,162,0.14),inset_0_1px_0_rgba(255,255,255,0.99)]">
            <div className="border-b border-[#e3e6e8] px-5 py-5">
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

                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eef1f3] bg-[#ffffff] text-[#818a91] shadow-[0_12px_24px_rgba(150,159,167,0.1)]">
                  <Plus className="h-4 w-4 rotate-45" />
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-4 py-5 sm:grid-cols-[1.45fr_0.95fr] sm:px-5">
              <div className="rounded-[28px] border border-[#f0f3f5] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(246,248,249,0.98)_56%,rgba(237,241,244,0.98)_100%)] px-4 py-4 text-[#24323f] shadow-[0_20px_38px_rgba(150,159,167,0.1),inset_0_1px_0_rgba(255,255,255,0.98)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ebeff1] bg-[#ffffffd8] px-3 py-1.5 text-xs font-medium text-[#7a848a]">
                  {getPurposeIcon(highlightedPost.meeting_purpose)}
                  {highlightedPost.meeting_purpose || "Meetup"}
                </div>

                <div className="mt-4 text-[30px] font-black leading-[0.98] tracking-[-0.05em]">
                  {getPurposeLabel(highlightedPost.meeting_purpose)}
                </div>

                <div className="mt-3 max-w-md text-sm leading-6 text-[#6f7b84]">
                  A quieter featured moment with a little more room to breathe.
                </div>
              </div>

              <div className="space-y-2.5 rounded-[24px] border border-[#eef1f3] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(243,246,247,0.98)_100%)] px-4 py-4 text-[#3b4952] shadow-[0_16px_30px_rgba(150,159,167,0.08)]">
                <div className="flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4 text-[#7a848a]" />
                  <span>{formatTime(highlightedPost.meeting_time)}</span>
                </div>
                <div className="flex min-w-0 items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#7a848a]" />
                  <span className="block min-w-0 flex-1 break-words line-clamp-2">
                    {highlightedPost.location ||
                      highlightedPost.place_name ||
                      "Location TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Search className="h-4 w-4 text-[#7a848a]" />
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
          <div className="rounded-[28px] border border-[#f0f2f4] bg-[linear-gradient(180deg,rgba(252,252,252,0.98)_0%,rgba(241,244,246,0.96)_100%)] shadow-[0_18px_40px_rgba(150,159,167,0.1)]">
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

              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ebeff1] bg-[#ffffff] text-[#7d878d] shadow-[0_10px_18px_rgba(150,159,167,0.08)]">
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
              Nearby moments
            </div>
          </div>

          <div className="rounded-[24px] border border-[#eef1f3] bg-[#ffffffd8] px-3 py-1.5 text-xs font-medium text-[#747f86] shadow-[0_8px_18px_rgba(150,159,167,0.07)]">
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
              className={`overflow-hidden rounded-[32px] border p-[14px] shadow-[0_20px_48px_rgba(145,164,179,0.14)] sm:p-4 ${
                isExpired
                  ? "border-[#d8e1e7] bg-[linear-gradient(180deg,rgba(235,240,244,0.96)_0%,rgba(217,225,232,0.94)_100%)]"
                  : "border-[#edf3f7] bg-[linear-gradient(180deg,rgba(248,251,253,0.98)_0%,rgba(226,234,240,0.94)_100%)]"
              }`}
            >
              <div className="rounded-[24px] border border-[#eef3f6] bg-[linear-gradient(180deg,rgba(252,254,255,0.98)_0%,rgba(236,242,246,0.96)_100%)] p-4 shadow-[0_16px_30px_rgba(151,171,186,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dde5eb] bg-[#fbfdfe] text-[#7a8b95] shadow-[0_8px_18px_rgba(153,172,186,0.08)]">
                        {getPurposeIcon(post.meeting_purpose, "h-5 w-5 shrink-0")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[24px] font-black tracking-[-0.05em] text-[#24323f]">
                          {post.meeting_purpose || "Social meetup"}
                        </div>
                        <div className="mt-1 text-xs text-[#6c808e]">
                          Hosted by {host.displayName}
                          {host.gender || host.ageGroup
                            ? ` | ${host.gender || "Unknown"}${
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

                <div className="mt-4 grid gap-2.5">
                  <div className={metaRowClass}>
                    <Clock3 className="h-4 w-4 text-[#788b95]" />
                    <span className="truncate">{formatTime(post.meeting_time)}</span>
                    {formatDuration(post.duration_minutes) ? (
                      <span className="ml-auto rounded-full border border-[#d1dce3] bg-[linear-gradient(180deg,#ffffff_0%,#edf2f5_100%)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f6f78] shadow-[0_8px_18px_rgba(160,176,188,0.16)]">
                        {formatDuration(post.duration_minutes)}
                      </span>
                    ) : null}
                  </div>

                  <div className={metaRowClass}>
                    <MapPin className="mt-0.5 h-4 w-4 text-[#788b95]" />
                    <span className="min-w-0 flex-1 break-words">
                      {post.place_name || post.location || "No place"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1 pt-0.5 text-sm text-[#5f7482]">
                    <span className="inline-flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-[#788b95]" />
                      {post.target_gender || "Any"} / {post.target_age_group || "Any"}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#d6dee5] bg-[linear-gradient(180deg,#ffffff_0%,#edf2f5_100%)] px-3 py-1.5 font-semibold text-[#4d626d] shadow-[0_8px_18px_rgba(160,176,188,0.14)]">
                      <Coins className="h-4 w-4 text-[#7b8d97]" />
                      {amount !== null ? `+$${amount.toLocaleString()}` : "No benefit"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-[#e4ebf0] bg-[linear-gradient(90deg,rgba(252,253,254,0.94)_0%,rgba(239,243,246,0.82)_100%)] px-3 py-2">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#7a8b95]">
                    Soft lounge mode
                  </div>
                  <div className="text-sm font-semibold text-[#314454]">
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
