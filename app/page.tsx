import Link from "next/link";
import {
  Clock3,
  MapPin,
  UserRound,
  UserCircle2,
  Coins,
  Star,
  Plus,
  Coffee,
  UtensilsCrossed,
  CakeSlice,
  Footprints,
  PersonStanding,
  Clapperboard,
  Mic2,
  Gamepad2,
  BookOpen,
  BriefcaseBusiness,
  Book,
  Camera,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import { createClient } from "../lib/supabase/server";

type SearchParams = {
  purpose?: string;
  gender?: string;
  age_group?: string;
  sort?: string;
};

type PageProps = {
  searchParams?: SearchParams;
};

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
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  gender: string | null;
  age_group: string | null;
};

type ProfileStatsRow = {
  average_rating?: number | null;
  review_count?: number | null;
};

type HostStatMap = Record<
  string,
  {
    averageRating: number;
    reviewCount: number;
  }
>;

type HostProfileMap = Record<
  string,
  {
    displayName: string;
    gender: string;
    ageGroup: string;
  }
>;

const PURPOSE_OPTIONS = [
  "All",
  "Coffee",
  "Meal",
  "Dessert",
  "Walk",
  "Jogging",
  "Yoga",
  "Movie",
  "Theater",
  "Karaoke",
  "Board Games",
  "Gaming",
  "Bowling",
  "Arcade",
  "Study",
  "Work Together",
  "Work",
  "Book Talk",
  "Book",
  "Photo Walk",
  "Photo",
];

const GENDER_OPTIONS = ["All", "Male", "Female", "Other", "Prefer not to say"];
const AGE_GROUP_OPTIONS = ["All", "20s", "30s", "40s", "50s+"];

const SORT_OPTIONS = [
  { value: "soonest", label: "Soonest" },
  { value: "newest", label: "Newest" },
  { value: "benefit_desc", label: "Highest Benefit" },
  { value: "benefit_asc", label: "Lowest Benefit" },
];

const getPurposeIcon = (purpose: string | null) => {
  const className = "h-[19px] w-[19px] shrink-0 text-[#7e746b]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return <Coffee className={className} />;
    case "Meal":
      return <UtensilsCrossed className={className} />;
    case "Dessert":
      return <CakeSlice className={className} />;
    case "Walk":
      return <Footprints className={className} />;
    case "Jogging":
    case "Yoga":
      return <PersonStanding className={className} />;
    case "Movie":
    case "Theater":
      return <Clapperboard className={className} />;
    case "Karaoke":
      return <Mic2 className={className} />;
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return <Gamepad2 className={className} />;
    case "Study":
      return <BookOpen className={className} />;
    case "Work Together":
    case "Work":
      return <BriefcaseBusiness className={className} />;
    case "Book Talk":
    case "Book":
      return <Book className={className} />;
    case "Photo Walk":
    case "Photo":
      return <Camera className={className} />;
    default:
      return <MapPin className={className} />;
  }
};

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "";
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
};

const formatTime = (meetingTime: string | null) => {
  if (!meetingTime) return "";
  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getPostStatus = (meetingTime: string | null) => {
  if (!meetingTime) return "Upcoming";
  return new Date(meetingTime).getTime() >= Date.now() ? "Upcoming" : "Expired";
};

const parseBenefitAmount = (value: string | null) => {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
};

const getSortSummaryLabel = (sort: string) => {
  switch (sort) {
    case "newest":
      return "Newest";
    case "benefit_desc":
      return "High $";
    case "benefit_asc":
      return "Low $";
    default:
      return "Soonest";
  }
};

function StarRatingInline({
  value,
  count,
}: {
  value: number;
  count: number;
}) {
  const rounded = Math.round(value);

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[#f4ece4] px-2 py-1 text-[11px] text-[#6b5f52]">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-3 w-3 ${
              n <= rounded
                ? "fill-[#a48f7a] text-[#a48f7a]"
                : "text-[#d8cec3]"
            }`}
          />
        ))}
      </div>
      <span className="font-medium">{value.toFixed(1)}</span>
      <span className="text-[#8b7f74]">({count})</span>
    </div>
  );
}

function buildHref(
  current: {
    purpose: string;
    gender: string;
    age_group: string;
    sort: string;
  },
  updates: Partial<{
    purpose: string;
    gender: string;
    age_group: string;
    sort: string;
  }>
) {
  const next = { ...current, ...updates };
  const params = new URLSearchParams();

  if (next.purpose && next.purpose !== "All") params.set("purpose", next.purpose);
  if (next.gender && next.gender !== "All") params.set("gender", next.gender);
  if (next.age_group && next.age_group !== "All") params.set("age_group", next.age_group);
  if (next.sort && next.sort !== "soonest") params.set("sort", next.sort);

  const query = params.toString();
  return query ? `/?${query}` : "/";
}

function FilterPill({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#a48f7a] text-white"
          : "bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
      }`}
    >
      {label}
    </Link>
  );
}

function FilterSummaryText({
  purpose,
  gender,
  ageGroup,
  sort,
}: {
  purpose: string;
  gender: string;
  ageGroup: string;
  sort: string;
}) {
  const parts: string[] = [];

  if (purpose !== "All") parts.push(purpose);
  if (gender !== "All") parts.push(gender);
  if (ageGroup !== "All") parts.push(ageGroup);
  if (sort !== "soonest") parts.push(getSortSummaryLabel(sort));

  if (parts.length === 0) {
    return <span className="text-sm text-[#8b7f74]">All filters</span>;
  }

  return <span className="text-sm font-medium text-[#5a5149]">{parts.join(" · ")}</span>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const resolved = searchParams || {};

  const selectedPurpose = resolved.purpose || "All";
  const selectedGender = resolved.gender || "All";
  const selectedAgeGroup = resolved.age_group || "All";
  const selectedSort = resolved.sort || "soonest";

  const currentFilters = {
    purpose: selectedPurpose,
    gender: selectedGender,
    age_group: selectedAgeGroup,
    sort: selectedSort,
  };

  const filtersKey = `${selectedPurpose}-${selectedGender}-${selectedAgeGroup}-${selectedSort}`;

  const supabase = createClient();

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at"
    );

  if (postsError) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-4 text-[#2f2a26]">
        <div className="mx-auto max-w-2xl rounded-[24px] border border-[#e7ddd2] bg-white p-5 shadow-sm">
          <div className="text-base font-semibold">Could not load home</div>
          <div className="mt-2 text-sm text-[#8b7f74]">{postsError.message}</div>
        </div>
      </main>
    );
  }

  let posts = ((postsData as PostRow[]) || []).filter((post) => {
    const purposeMatch =
      selectedPurpose === "All" || post.meeting_purpose === selectedPurpose;

    const genderMatch =
      selectedGender === "All" || post.target_gender === selectedGender;

    const ageGroupMatch =
      selectedAgeGroup === "All" || post.target_age_group === selectedAgeGroup;

    return purposeMatch && genderMatch && ageGroupMatch;
  });

  posts = posts.sort((a, b) => {
    if (selectedSort === "newest") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    if (selectedSort === "benefit_desc") {
      return (
        (parseBenefitAmount(b.benefit_amount) ?? -1) -
        (parseBenefitAmount(a.benefit_amount) ?? -1)
      );
    }

    if (selectedSort === "benefit_asc") {
      return (
        (parseBenefitAmount(a.benefit_amount) ?? Number.MAX_SAFE_INTEGER) -
        (parseBenefitAmount(b.benefit_amount) ?? Number.MAX_SAFE_INTEGER)
      );
    }

    const aUpcoming = getPostStatus(a.meeting_time) === "Upcoming" ? 0 : 1;
    const bUpcoming = getPostStatus(b.meeting_time) === "Upcoming" ? 0 : 1;

    if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming;

    const aTime = a.meeting_time ? new Date(a.meeting_time).getTime() : 0;
    const bTime = b.meeting_time ? new Date(b.meeting_time).getTime() : 0;
    return aTime - bTime;
  });

  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id))).filter(Boolean);

  const hostProfileMap: HostProfileMap = {};
  const hostStatsMap: HostStatMap = {};

  if (ownerIds.length > 0) {
    try {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, gender, age_group")
        .in("id", ownerIds);

      ((profilesData as ProfileRow[]) || []).forEach((profile) => {
        hostProfileMap[profile.id] = {
          displayName: profile.display_name || "Unknown",
          gender: profile.gender || "",
          ageGroup: profile.age_group || "",
        };
      });
    } catch {}

    try {
      const statsResults = await Promise.all(
        ownerIds.map(async (ownerId) => {
          const { data, error } = await supabase.rpc("get_profile_stats", {
            p_user_id: ownerId,
          });

          if (error) {
            return {
              ownerId,
              stats: {
                averageRating: 0,
                reviewCount: 0,
              },
            };
          }

          const stats = (data || {}) as ProfileStatsRow;

          return {
            ownerId,
            stats: {
              averageRating: Number(stats.average_rating ?? 0),
              reviewCount: Number(stats.review_count ?? 0),
            },
          };
        })
      );

      statsResults.forEach(({ ownerId, stats }) => {
        hostStatsMap[ownerId] = stats;
      });
    } catch {}
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-4 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-3 pb-24">
        <div className="rounded-[20px] border border-[#e7ddd2] bg-white shadow-sm">
          <details key={filtersKey} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2f2a26]">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter & Sort
                </div>

                <div className="mt-2">
                  <FilterSummaryText
                    purpose={selectedPurpose}
                    gender={selectedGender}
                    ageGroup={selectedAgeGroup}
                    sort={selectedSort}
                  />
                </div>
              </div>

              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4ece4] text-[#6b5f52] transition group-open:rotate-180">
                <ChevronDown className="h-4 w-4" />
              </span>
            </summary>

            <div className="border-t border-[#efe6db] px-4 py-4">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Purpose
                </div>
                <div className="flex flex-wrap gap-2">
                  {PURPOSE_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      href={buildHref(currentFilters, { purpose: option })}
                      active={selectedPurpose === option}
                      label={option}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Gender
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      href={buildHref(currentFilters, { gender: option })}
                      active={selectedGender === option}
                      label={option}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Age Group
                </div>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUP_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      href={buildHref(currentFilters, { age_group: option })}
                      active={selectedAgeGroup === option}
                      label={option}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Sort
                </div>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value}
                      href={buildHref(currentFilters, { sort: option.value })}
                      active={selectedSort === option.value}
                      label={option.label}
                    />
                  ))}
                </div>
              </div>
            </div>
          </details>

          <div className="border-t border-[#efe6db] px-4 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Link>
          </div>
        </div>

        {posts.map((post) => {
          const amount = parseBenefitAmount(post.benefit_amount);
          const host = hostProfileMap[post.user_id] || {
            displayName: "Unknown",
            gender: "",
            ageGroup: "",
          };
          const hostStats = hostStatsMap[post.user_id] || {
            averageRating: 0,
            reviewCount: 0,
          };
          const status = getPostStatus(post.meeting_time);
          const isExpired = status === "Expired";

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className={`block rounded-[24px] border p-4 shadow-sm transition active:scale-[0.995] ${
                isExpired
                  ? "border-[#ddd2c5] bg-[#f3eee8] opacity-80"
                  : "border-[#e7ddd2] bg-white hover:bg-[#fcfaf7]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 min-h-[74px]">
                  <div className="flex items-center gap-2 text-[24px] leading-[1.18] font-extrabold tracking-[-0.01em] text-[#2f2a26]">
                    {getPurposeIcon(post.meeting_purpose)}
                    <span className="truncate">{post.meeting_purpose || "Meetup"}</span>
                    {formatDuration(post.duration_minutes) ? (
                      <span className="inline-flex shrink-0 items-center gap-1 text-[21px] font-bold text-[#2f2a26]">
                        <Clock3 className="h-4 w-4" />
                        {formatDuration(post.duration_minutes)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-[21px] font-bold leading-[1.22] text-[#2f2a26]">
                    <MapPin className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <span className="truncate">
                      {post.place_name || post.location || "No place"}
                    </span>
                  </div>
                </div>

                <div className="flex h-[74px] shrink-0 flex-col items-end justify-start">
                  {amount !== null && (
                    <div className="rounded-full bg-gradient-to-b from-[#f5df97] to-[#e5c76f] px-3.5 py-2 text-sm font-bold text-[#5f4c1d] shadow-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <Coins className="h-4 w-4" />
                        ${amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3.5 space-y-1.5 text-[13px] text-[#766c62]">
                {post.meeting_time && (
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <span>{formatTime(post.meeting_time)}</span>
                  </div>
                )}

                {post.location && (
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <span className="line-clamp-1">{post.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                  <span>
                    {post.target_gender || "Any"} / {post.target_age_group || "Any"}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 rounded-[16px] border border-[#e7ddd2] bg-[#fcfaf7] px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-[#5a5149]">
                      <UserCircle2 className="h-4.5 w-4.5 text-[#8a7f74]" />
                      <span className="truncate">{host.displayName}</span>
                    </div>

                    {(host.gender || host.ageGroup) && (
                      <div className="mt-0.5 text-[12px] text-[#8b7f74]">
                        {host.gender || "Unknown"}
                        {host.gender && host.ageGroup ? " / " : ""}
                        {host.ageGroup || ""}
                      </div>
                    )}
                  </div>

                  {hostStats.reviewCount > 0 ? (
                    <StarRatingInline
                      value={hostStats.averageRating}
                      count={hostStats.reviewCount}
                    />
                  ) : (
                    <div className="rounded-full bg-[#f4ece4] px-2 py-1 text-[11px] text-[#8b7f74]">
                      No reviews
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {posts.length === 0 && (
          <div className="rounded-[24px] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
            No meetups found.
          </div>
        )}
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#a48f7a] text-white shadow-[0_10px_25px_rgba(80,60,40,0.18)] transition hover:bg-[#927d69]"
        aria-label="Create meetup"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </main>
  );
}