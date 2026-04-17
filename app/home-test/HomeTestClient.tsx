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

  return (
    <main className="min-h-screen overflow-hidden bg-[#e5ecf1] px-4 py-5 text-[#273643]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#eef4f7_28%,#dce4ea_68%,#d2dbe3_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(187,225,232,0.42),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(199,211,231,0.34),transparent_21%),radial-gradient(circle_at_60%_100%,rgba(181,219,223,0.22),transparent_30%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:22px_22px] opacity-40" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_46%,rgba(143,224,235,0.12)_49%,transparent_52%,transparent_100%)] opacity-60" />

      <div className="relative mx-auto max-w-2xl space-y-4 pb-24 sm:space-y-5">
        <section className="relative overflow-hidden rounded-[36px] border border-[#f7fbff] bg-[linear-gradient(145deg,rgba(249,252,254,0.98)_0%,rgba(230,237,243,0.96)_52%,rgba(213,222,229,0.98)_100%)] px-5 py-6 shadow-[0_28px_80px_rgba(128,147,162,0.18),inset_0_1px_0_rgba(255,255,255,0.92)] sm:px-7 sm:py-8">
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#ffffffd9] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#d9f0ee99] blur-3xl" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.0)_0%,rgba(169,226,233,0.12)_45%,rgba(255,255,255,0.0)_100%)]" />
          <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(141,214,225,0.78),transparent)]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#d8e5ed] bg-[#f9fcfecc] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#5f95a2] shadow-[0_10px_22px_rgba(151,176,191,0.12)]">
              <Sparkles className="h-3.5 w-3.5" />
              AI social layer
            </div>

            <h1 className="mt-4 max-w-md text-[35px] font-black leading-[0.94] tracking-[-0.06em] text-[#24323f] sm:text-[42px]">
              Meet someone new in a softer future.
            </h1>

            <p className="mt-4 max-w-lg text-[14px] leading-6 text-[#667a89] sm:text-[15px]">
              Same structure, different mood. Quiet silver surfaces, ambient lab
              glow, and a calmer way to browse local social energy.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[24px] border border-[#eaf1f5] bg-[linear-gradient(180deg,rgba(252,254,255,0.96)_0%,rgba(229,236,242,0.96)_100%)] px-3 py-3.5 shadow-[0_14px_28px_rgba(162,179,192,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#7f9daa]">
                  Live now
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#24323f]">
                  {upcomingCount}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#eaf1f5] bg-[linear-gradient(180deg,rgba(252,254,255,0.96)_0%,rgba(229,236,242,0.96)_100%)] px-3 py-3.5 shadow-[0_14px_28px_rgba(162,179,192,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#7f9daa]">
                  Hosts
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#24323f]">
                  {hostCount}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#eaf1f5] bg-[linear-gradient(180deg,rgba(252,254,255,0.96)_0%,rgba(229,236,242,0.96)_100%)] px-3 py-3.5 shadow-[0_14px_28px_rgba(162,179,192,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#6f96a1]">
                  Signal
                </div>
                <div className="mt-1 text-sm font-bold leading-5 text-[#24323f]">
                  Chill
                  <br />
                  Lab
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Signal drift", "Afterglow walks", "Quiet co-work"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[#d9e6ee] bg-[#f9fcfecc] px-3 py-2 text-xs font-medium text-[#567382] shadow-[0_8px_18px_rgba(151,178,194,0.1)]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {highlightedPost && (
          <section className="overflow-hidden rounded-[32px] border border-[#edf3f7] bg-[linear-gradient(180deg,rgba(247,250,252,0.98)_0%,rgba(224,233,239,0.96)_100%)] shadow-[0_24px_70px_rgba(142,159,173,0.16)]">
            <div className="border-b border-[#dbe5ec] px-5 py-[18px]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#6d94a0]">
                    <Search className="h-3.5 w-3.5" />
                    Featured signal
                  </div>
                  <div className="mt-1 text-lg font-bold tracking-[-0.03em] text-[#24323f]">
                    {highlightedPost.place_name || highlightedPost.location || "Meetup"}
                  </div>
                </div>

                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7e5ed] bg-[#f8fbfd] text-[#7096a3] shadow-[0_10px_20px_rgba(150,170,186,0.12)]">
                  <Plus className="h-4 w-4 rotate-45" />
                </div>
              </div>
            </div>

            <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1.4fr_1fr] sm:px-5">
              <div className="rounded-[26px] border border-[#e7eef3] bg-[linear-gradient(180deg,rgba(252,254,255,0.96)_0%,rgba(230,237,242,0.94)_100%)] px-4 py-4 text-[#24323f] shadow-[0_14px_30px_rgba(151,171,186,0.1)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9e6ee] bg-[#f8fbfdcc] px-3 py-1.5 text-xs font-medium text-[#648794]">
                  {getPurposeIcon(highlightedPost.meeting_purpose)}
                  {highlightedPost.meeting_purpose || "Meetup"}
                </div>

                <div className="mt-4 text-2xl font-black leading-[1.02] tracking-[-0.04em]">
                  {getPurposeLabel(highlightedPost.meeting_purpose)}
                </div>

                <div className="mt-2 text-sm leading-6 text-[#667a89]">
                  Same featured module, re-skinned for a soft metallic AI-lab
                  mood.
                </div>
              </div>

              <div className="space-y-2.5 rounded-[24px] border border-[#e7eef3] bg-[linear-gradient(180deg,rgba(252,254,255,0.96)_0%,rgba(230,237,242,0.94)_100%)] px-4 py-4 text-[#334856] shadow-[0_14px_30px_rgba(151,171,186,0.1)]">
                <div className="flex items-center gap-2 text-sm">
                  <Clock3 className="h-4 w-4 text-[#6f98a5]" />
                  <span>{formatTime(highlightedPost.meeting_time)}</span>
                </div>
                <div className="flex min-w-0 items-start gap-2 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#6f98a5]" />
                  <span className="block min-w-0 flex-1 break-words line-clamp-2">
                    {highlightedPost.location ||
                      highlightedPost.place_name ||
                      "Location TBD"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Search className="h-4 w-4 text-[#6f98a5]" />
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
          <div className="rounded-[28px] border border-[#edf3f7] bg-[linear-gradient(180deg,rgba(248,251,253,0.96)_0%,rgba(227,235,241,0.94)_100%)] shadow-[0_18px_40px_rgba(149,167,182,0.14)]">
            <div className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#273744]">
                  <SlidersHorizontal className="h-4 w-4 text-[#6d97a5]" />
                  Shape your signal
                </div>
                <div className="mt-2 text-sm text-[#6d818f]">
                  Static test shell for silver surfaces, lab-light accents, and
                  calmer chrome.
                </div>
              </div>

              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d7e4ec] bg-[#f8fbfd] text-[#6d97a5] shadow-[0_10px_18px_rgba(153,172,186,0.12)]">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f96a1]">
              Discover
            </div>
            <div className="mt-1 text-xl font-black tracking-[-0.04em] text-[#24323f]">
              Nearby social moments
            </div>
          </div>

          <div className="rounded-[24px] border border-[#dbe7ee] bg-[#f8fbfdcc] px-3 py-1.5 text-xs font-medium text-[#6c8c99] shadow-[0_8px_18px_rgba(154,174,189,0.1)]">
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
              <div className="rounded-[24px] border border-[#edf3f7] bg-[linear-gradient(180deg,rgba(252,254,255,0.94)_0%,rgba(231,237,242,0.94)_100%)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#dbe7ee] bg-[#f8fbfd] text-[#6d97a5] shadow-[0_8px_18px_rgba(153,172,186,0.1)]">
                        {getPurposeIcon(post.meeting_purpose, "h-5 w-5 shrink-0")}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-black tracking-[-0.04em] text-[#24323f]">
                          {post.meeting_purpose || "Social meetup"}
                        </div>
                        <div className="mt-0.5 text-xs text-[#6c808e]">
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
                  <div className="flex items-center gap-2 rounded-[18px] border border-[#e7eef3] bg-[#f8fbfd] px-3 py-2.5 text-sm text-[#314454]">
                    <Clock3 className="h-4 w-4 text-[#6d97a5]" />
                    <span className="truncate">{formatTime(post.meeting_time)}</span>
                    {formatDuration(post.duration_minutes) ? (
                      <span className="ml-auto rounded-full border border-[#d8e6ee] bg-[#eef5f8] px-2 py-0.5 text-[11px] font-medium text-[#6b8b98]">
                        {formatDuration(post.duration_minutes)}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-start gap-2 rounded-[18px] border border-[#e7eef3] bg-[#f8fbfd] px-3 py-2.5 text-sm text-[#314454]">
                    <MapPin className="mt-0.5 h-4 w-4 text-[#6d97a5]" />
                    <span className="min-w-0 flex-1 break-words">
                      {post.place_name || post.location || "No place"}
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-[18px] border border-[#e7eef3] bg-[#f8fbfd] px-3 py-2.5 text-sm text-[#314454]">
                      <UserRound className="h-4 w-4 text-[#6d97a5]" />
                      <span>
                        {post.target_gender || "Any"} / {post.target_age_group || "Any"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 rounded-[18px] border border-[#e7eef3] bg-[#f8fbfd] px-3 py-2.5 text-sm text-[#314454]">
                      <Coins className="h-4 w-4 text-[#7fb39f]" />
                      <span>
                        {amount !== null ? `+$${amount.toLocaleString()}` : "No benefit"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-[#e3edf3] bg-[linear-gradient(90deg,rgba(250,252,254,0.88)_0%,rgba(234,241,245,0.72)_100%)] px-3 py-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-[#7a9da9]">
                    Silver lab mode
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
