import Link from "next/link";
import { redirect } from "next/navigation";
import { EyeOff, ListFilter, RotateCcw, Search, ShieldCheck } from "lucide-react";
import { getAdminPostsData, type AdminPostStatusFilter, type AdminPostVisibilityFilter } from "../../../lib/adminPosts";
import { buildPostPath } from "../../../lib/postUrl";
import { createClient } from "../../../lib/supabase/server";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";
import AdminPostVisibilityButton from "../overview/AdminPostVisibilityButton";

type SearchParams = Record<string, string | string[] | undefined>;

function getSearchParam(searchParams: SearchParams | undefined, key: string) {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

const visibilityOptions: Array<{ label: string; value: AdminPostVisibilityFilter }> = [
  { label: "All", value: "all" },
  { label: "Visible", value: "visible" },
  { label: "Hidden", value: "hidden" },
];

const statusOptions: Array<{ label: string; value: AdminPostStatusFilter }> = [
  { label: "All status", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Expired", value: "expired" },
  { label: "Cancelled", value: "cancelled" },
];

function formatDateTime(value: string | null | undefined) {
  if (!value) return "Unknown";

  return new Date(value).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function normalizeVisibility(value: string | undefined): AdminPostVisibilityFilter {
  return value === "visible" || value === "hidden" ? value : "all";
}

function normalizeStatus(value: string | undefined): AdminPostStatusFilter {
  return value === "upcoming" || value === "expired" || value === "cancelled"
    ? value
    : "all";
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
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

  const filters = {
    q: String(getSearchParam(searchParams, "q") || "").trim(),
    visibility: normalizeVisibility(getSearchParam(searchParams, "visibility")),
    status: normalizeStatus(getSearchParam(searchParams, "status")),
  };

  let data: Awaited<ReturnType<typeof getAdminPostsData>> | null = null;
  let loadError = "";

  try {
    data = await getAdminPostsData(supabase, filters);
  } catch (error) {
    console.error("Admin posts load failed", error);
    loadError = "Could not load meetups.";
  }

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-7xl space-y-4">
        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className={APP_EYEBROW_CLASS}>Admin</div>
              <h1 className="mt-2 text-[30px] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#22303a] sm:text-[34px]">
                All meetups
              </h1>
              <p className={`mt-3 max-w-2xl ${APP_BODY_TEXT_CLASS}`}>
                Find any meetup and hide or restore it safely.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/admin/overview"
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Overview
              </Link>
              <Link
                href="/admin/reports"
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Reports
              </Link>
            </div>
          </div>
        </section>

        <section className={`${APP_SURFACE_CARD_CLASS} p-4 sm:p-5`}>
          <form className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_190px_auto]" action="/admin/posts">
            <label className={`${APP_SOFT_CARD_CLASS} flex items-center gap-3 px-4 py-3`}>
              <Search className="h-5 w-5 text-[#81909a]" />
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder="Search id, place, type, host"
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#24323c] outline-none placeholder:text-[#9aa6ad]"
              />
            </label>

            <label className={`${APP_SOFT_CARD_CLASS} flex items-center gap-3 px-4 py-3`}>
              <EyeOff className="h-5 w-5 text-[#81909a]" />
              <select
                name="visibility"
                defaultValue={filters.visibility}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#2f3a42] outline-none"
              >
                {visibilityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={`${APP_SOFT_CARD_CLASS} flex items-center gap-3 px-4 py-3`}>
              <ListFilter className="h-5 w-5 text-[#81909a]" />
              <select
                name="status"
                defaultValue={filters.status}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[#2f3a42] outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                className={`inline-flex flex-1 items-center justify-center rounded-full px-4 py-3 text-sm font-semibold ${APP_PILL_ACTIVE_CLASS}`}
              >
                Search
              </button>
              <Link
                href="/admin/posts"
                className={`inline-flex items-center justify-center rounded-full px-4 py-3 text-sm font-semibold ${APP_PILL_INACTIVE_CLASS}`}
                aria-label="Reset filters"
              >
                <RotateCcw className="h-4 w-4" />
              </Link>
            </div>
          </form>
        </section>

        {loadError ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5 text-sm text-[#6c7880]`}>
            {loadError}
          </section>
        ) : data ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className={APP_EYEBROW_CLASS}>Meetup list</div>
                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                  {data.items.length} shown
                </h2>
              </div>
              <div className={`text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                Loaded latest {data.totalLoaded} / limit {data.limit}
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {data.items.length > 0 ? (
                data.items.map((item) => (
                  <div key={item.id} className={`${APP_SOFT_CARD_CLASS} p-4`}>
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-[#dce5eb] bg-white px-2.5 py-1 text-xs font-bold text-[#6f7d86]">
                            #{item.id}
                          </span>
                          {item.adminHidden ? (
                            <span className="rounded-full border border-[#ead6d6] bg-[#fff7f7] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#9b5555]">
                              Hidden
                            </span>
                          ) : (
                            <span className="rounded-full border border-[#d8e7de] bg-[#f7fff9] px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#52775e]">
                              Visible
                            </span>
                          )}
                          <span className="rounded-full border border-[#dce5eb] bg-white px-2.5 py-1 text-xs font-bold text-[#6f7d86]">
                            {item.status}
                          </span>
                        </div>

                        <Link
                          href={buildPostPath(item.id, item.meetingPurpose, item.placeName)}
                          className="mt-3 block truncate text-lg font-black tracking-[-0.03em] text-[#24323c] transition hover:underline"
                        >
                          {item.placeName}
                        </Link>
                        <div className="mt-1 text-sm font-semibold text-[#5b6870]">
                          {item.meetingPurpose}
                        </div>
                        <div className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
                          Host: {item.hostDisplayName} / Meetup: {formatDateTime(item.meetingTime)}
                        </div>
                        {item.adminHiddenReason ? (
                          <div className={`mt-2 text-sm ${APP_SUBTLE_TEXT_CLASS}`}>
                            Hidden reason: {item.adminHiddenReason}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                        <Link
                          href={buildPostPath(item.id, item.meetingPurpose, item.placeName)}
                          className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
                        >
                          Open
                        </Link>
                        <AdminPostVisibilityButton
                          postId={item.id}
                          hidden={item.adminHidden}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${APP_SOFT_CARD_CLASS} px-4 py-8 text-center text-sm text-[#6c7880]`}>
                  No meetups match these filters.
                </div>
              )}
            </div>

            <div className={`mt-4 flex items-start gap-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Hide keeps the record, removes it from public surfaces, and blocks new join requests.
              </span>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
