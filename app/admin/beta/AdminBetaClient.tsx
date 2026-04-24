"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

type BetaApplicationItem = {
  id: number;
  email: string;
  full_name: string | null;
  city: string | null;
  age_group: string | null;
  gender: string | null;
  motivation: string;
  meetup_interests: string[] | null;
  availability: string | null;
  status: "pending" | "approved" | "waitlisted" | "rejected";
  notes: string | null;
  reviewed_at: string | null;
  created_at: string;
};

type BetaAllowlistRow = {
  email: string;
  active: boolean;
  approved_at: string;
  source_application_id: number | null;
};

const STATUS_OPTIONS = ["pending", "approved", "waitlisted", "rejected"] as const;
const STATUS_FILTERS = ["all", ...STATUS_OPTIONS] as const;

const STATUS_LABELS: Record<(typeof STATUS_OPTIONS)[number], string> = {
  pending: "Pending",
  approved: "Approved",
  waitlisted: "Waitlisted",
  rejected: "Rejected",
};

export default function AdminBetaClient() {
  const [items, setItems] = useState<BetaApplicationItem[]>([]);
  const [allowlist, setAllowlist] = useState<BetaAllowlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("all");
  const [notesById, setNotesById] = useState<Record<number, string>>({});

  const loadData = async () => {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/beta", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error || "Could not load beta applications.");
      return;
    }

    setItems(payload.items || []);
    setAllowlist(payload.allowlist || []);
    setNotesById(
      Object.fromEntries(
        (payload.items || []).map((item: BetaApplicationItem) => [
          item.id,
          item.notes || "",
        ])
      )
    );
  };

  useEffect(() => {
    void loadData();
  }, []);

  const allowlistMap = useMemo(
    () =>
      new Map(
        allowlist.map((row) => [row.email.toLowerCase(), row.active ? row : null])
      ),
    [allowlist]
  );

  const visibleItems =
    statusFilter === "all"
      ? items
      : items.filter((item) => item.status === statusFilter);

  const counts = {
    all: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    waitlisted: items.filter((item) => item.status === "waitlisted").length,
    rejected: items.filter((item) => item.status === "rejected").length,
  };

  const updateStatus = async (
    applicationId: number,
    status: (typeof STATUS_OPTIONS)[number]
  ) => {
    setMessage("");
    const response = await fetch("/api/admin/beta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        applicationId,
        status,
        notes: notesById[applicationId] || "",
      }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(payload.error || "Could not update beta application.");
      return;
    }

    await loadData();
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7fafc_20%,#e8edf1_56%,#d7dfe5_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Admin</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#24323c]">
            Beta Applications
          </h1>
          <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
            Review incoming beta requests, approve the right people, and keep the
            active allowlist tight while the product is still in closed beta.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => {
              const isActive = statusFilter === filter;
              const count = counts[filter];
              const label =
                filter === "all"
                  ? "All"
                  : STATUS_LABELS[filter as (typeof STATUS_OPTIONS)[number]];

              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium ${
                    isActive ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
                  }`}
                >
                  <span>{label}</span>
                  <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-[#4f5c65]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {loading ? (
          <div className={`${APP_SURFACE_CARD_CLASS} p-5 text-sm text-[#6c7880]`}>
            Loading beta applications...
          </div>
        ) : visibleItems.length === 0 ? (
          <div className={`${APP_SURFACE_CARD_CLASS} p-5 text-sm text-[#6c7880]`}>
            {statusFilter === "all"
              ? "No beta applications yet."
              : `No ${statusFilter} beta applications.`}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleItems.map((item) => {
              const allowlistEntry = allowlistMap.get(item.email.toLowerCase());

              return (
                <section key={item.id} className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-[#24323c]">
                        {item.full_name || item.email}
                      </div>
                      <div className="mt-1 text-xs text-[#7c8991]">
                        {item.email} · {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`${APP_SOFT_CARD_CLASS} px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#52616a]`}
                      >
                        {STATUS_LABELS[item.status]}
                      </span>
                      {allowlistEntry ? (
                        <span
                          className={`${APP_SOFT_CARD_CLASS} px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#52616a]`}
                        >
                          Allowlisted
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3`}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                        Location + fit
                      </div>
                      <div className="mt-2 text-sm text-[#4f5c65]">
                        {[item.city, item.gender, item.age_group]
                          .filter(Boolean)
                          .join(" · ") || "No profile fit details yet."}
                      </div>
                    </div>
                    <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3`}>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                        Interests
                      </div>
                      <div className="mt-2 text-sm text-[#4f5c65]">
                        {item.meetup_interests?.length
                          ? item.meetup_interests.join(", ")
                          : "No meetup preferences shared."}
                      </div>
                    </div>
                  </div>

                  <div className={`${APP_SOFT_CARD_CLASS} mt-3 px-4 py-3`}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                      Why they want in
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#4f5c65]">
                      {item.motivation}
                    </div>
                    {item.availability ? (
                      <div className="mt-3 text-xs text-[#7c8991]">
                        Availability: {item.availability}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                      Internal note
                    </label>
                    <textarea
                      value={notesById[item.id] || ""}
                      onChange={(event) =>
                        setNotesById((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                      rows={3}
                      className="mt-2 w-full rounded-[18px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30"
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void updateStatus(item.id, status)}
                        className={`inline-flex items-center rounded-full px-3.5 py-2 text-xs font-medium ${
                          item.status === status
                            ? APP_PILL_ACTIVE_CLASS
                            : APP_BUTTON_SECONDARY_CLASS
                        }`}
                      >
                        {item.status === status ? "Current" : "Mark"}{" "}
                        {STATUS_LABELS[status].toLowerCase()}
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {message ? (
          <div className={`${APP_SURFACE_CARD_CLASS} p-4 text-sm text-[#55626a]`}>
            {message}
          </div>
        ) : null}
      </div>
    </main>
  );
}
