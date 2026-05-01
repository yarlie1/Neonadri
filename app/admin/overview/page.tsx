import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  BellRing,
  CalendarClock,
  ClipboardList,
  HeartHandshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getAdminOverviewData } from "../../../lib/adminOverview";
import { createClient } from "../../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_60px_rgba(118,126,133,0.14)] sm:px-8 sm:py-8";

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className={`${APP_SOFT_CARD_CLASS} px-4 py-4`}>
      <div className="flex items-center justify-between gap-3">
        <div
          className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${APP_SUBTLE_TEXT_CLASS}`}
        >
          {label}
        </div>
        <div className="text-[#6b7a83]">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#24323c]">
        {value}
      </div>
    </div>
  );
}

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/");
  }

  let overview: Awaited<ReturnType<typeof getAdminOverviewData>> | null = null;
  let loadError = "";

  try {
    overview = await getAdminOverviewData();
  } catch (error) {
    console.error("Admin overview load failed", error);
    loadError = "Could not load the latest site overview.";
  }

  return (
    <main
      className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}
    >
      <div className="mx-auto max-w-6xl space-y-4">
        <section className={HERO_SURFACE_CLASS}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#d6e0e6]/45 blur-2xl" />
          <div className="relative">
            <div className={APP_EYEBROW_CLASS}>Admin</div>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[30px] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#22303a] sm:text-[34px]">
                  Site overview
                </h1>
                <p className={`mt-3 max-w-2xl ${APP_BODY_TEXT_CLASS}`}>
                  Watch signups, meetup activity, pending beta applications,
                  and review follow-through in one place.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/beta"
                  className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Beta applications
                </Link>
                <Link
                  href="/admin/reports"
                  className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Safety reports
                </Link>
              </div>
            </div>
          </div>
        </section>

        {loadError ? (
          <section
            className={`${APP_SURFACE_CARD_CLASS} p-5 text-sm text-[#6c7880]`}
          >
            {loadError}
          </section>
        ) : overview ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="Total users"
                value={overview.metrics.totalUsers}
                icon={<Users className="h-5 w-5" />}
              />
              <MetricCard
                label="New users today"
                value={overview.metrics.newUsersToday}
                icon={<BellRing className="h-5 w-5" />}
              />
              <MetricCard
                label="Pending beta applications"
                value={overview.metrics.pendingBetaApplications}
                icon={<ClipboardList className="h-5 w-5" />}
              />
              <MetricCard
                label="Upcoming meetups"
                value={overview.metrics.upcomingMeetups}
                icon={<CalendarClock className="h-5 w-5" />}
              />
              <MetricCard
                label="Matches this week"
                value={overview.metrics.matchesThisWeek}
                icon={<HeartHandshake className="h-5 w-5" />}
              />
              <MetricCard
                label="Reviews due"
                value={overview.metrics.reviewsDue}
                icon={<ShieldCheck className="h-5 w-5" />}
              />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
              <div className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
                <div className={APP_EYEBROW_CLASS}>Pending beta</div>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                  Applications waiting for review
                </h2>
                <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
                  Review the newest posting requests and jump into the beta
                  tools when you are ready to approve them.
                </p>

                <div className="mt-4 space-y-3">
                  {overview.pendingBetaApplications.length > 0 ? (
                    overview.pendingBetaApplications.map((item) => (
                      <div
                        key={item.id}
                        className={`${APP_SOFT_CARD_CLASS} flex flex-wrap items-start justify-between gap-3 px-4 py-4`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#24323c]">
                            {item.fullName}
                          </div>
                          <div className="mt-1 text-sm text-[#5f6c75]">
                            {item.email}
                          </div>
                          <div
                            className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}
                          >
                            {item.city} / {formatDateTime(item.createdAt)}
                          </div>
                        </div>
                        <Link
                          href="/admin/beta"
                          className="text-sm font-medium text-[#3f4f59] underline underline-offset-4"
                        >
                          Open
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`${APP_SOFT_CARD_CLASS} px-4 py-4 text-sm text-[#6c7880]`}
                    >
                      No pending beta applications right now.
                    </div>
                  )}
                </div>
              </div>

              <div className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
                <div className={APP_EYEBROW_CLASS}>Review follow-up</div>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                  Expired meetups still missing reviews
                </h2>
                <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
                  These meetups are finished, but at least one review still has
                  not been written.
                </p>

                <div className="mt-4 space-y-3">
                  {overview.reviewDueMatches.length > 0 ? (
                    overview.reviewDueMatches.map((item) => (
                      <Link
                        key={item.id}
                        href={`/posts/${item.postId}`}
                        className={`${APP_SOFT_CARD_CLASS} block px-4 py-4 transition hover:bg-white/90`}
                      >
                        <div className="text-sm font-semibold text-[#24323c]">
                          {item.meetingPurpose}
                        </div>
                        <div className="mt-1 text-sm text-[#5f6c75]">
                          {item.placeName}
                        </div>
                        <div
                          className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}
                        >
                          {item.participantNames} /{" "}
                          {formatDateTime(item.meetingTime)}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div
                      className={`${APP_SOFT_CARD_CLASS} px-4 py-4 text-sm text-[#6c7880]`}
                    >
                      No review backlog right now.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
              <div className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
                <div className={APP_EYEBROW_CLASS}>Recent signups</div>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                  Newest accounts
                </h2>
                <div className="mt-4 space-y-3">
                  {overview.recentSignups.length > 0 ? (
                    overview.recentSignups.map((item) => (
                      <div
                        key={item.id}
                        className={`${APP_SOFT_CARD_CLASS} flex flex-wrap items-center justify-between gap-3 px-4 py-4`}
                      >
                        <div>
                          <div className="text-sm font-semibold text-[#24323c]">
                            {item.displayName}
                          </div>
                          <div
                            className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}
                          >
                            {item.signupIntent === "host"
                              ? "Started as posting path"
                              : "Started as join-first path"}
                          </div>
                        </div>
                        <div className={`text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                          {formatDateTime(item.createdAt)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`${APP_SOFT_CARD_CLASS} px-4 py-4 text-sm text-[#6c7880]`}
                    >
                      No signup data yet.
                    </div>
                  )}
                </div>
              </div>

              <div className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
                <div className={APP_EYEBROW_CLASS}>Recent meetups</div>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                  Latest posts
                </h2>
                <div className="mt-4 space-y-3">
                  {overview.recentMeetups.length > 0 ? (
                    overview.recentMeetups.map((item) => (
                      <Link
                        key={item.id}
                        href={`/posts/${item.id}`}
                        className={`${APP_SOFT_CARD_CLASS} block px-4 py-4 transition hover:bg-white/90`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#24323c]">
                              {item.meetingPurpose}
                            </div>
                            <div className="mt-1 text-sm text-[#5f6c75]">
                              {item.placeName}
                            </div>
                            <div
                              className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}
                            >
                              Host: {item.hostDisplayName}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6f7d86]">
                              {item.status}
                            </div>
                            <div
                              className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}
                            >
                              {formatDateTime(item.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div
                      className={`${APP_SOFT_CARD_CLASS} px-4 py-4 text-sm text-[#6c7880]`}
                    >
                      No meetup posts yet.
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}
