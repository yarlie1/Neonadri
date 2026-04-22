"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

type ReportItem = {
  id: number;
  reporter_user_id: string;
  reporter_display_name: string;
  target_type: string;
  target_id: string;
  target_href: string | null;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ["open", "reviewing", "resolved", "dismissed"] as const;
const STATUS_FILTERS = ["all", ...STATUS_OPTIONS] as const;

const STATUS_LABELS: Record<(typeof STATUS_OPTIONS)[number], string> = {
  open: "Open",
  reviewing: "Reviewing",
  resolved: "Resolved",
  dismissed: "Dismissed",
};

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment",
  unsafe_behavior: "Unsafe behavior",
  fake_or_misleading: "Fake or misleading",
  bad_meetup_conduct: "Bad meetup conduct",
  other: "Other",
};

export default function AdminReportsClient() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("all");

  const loadReports = async () => {
    setLoading(true);
    setMessage("");
    const response = await fetch("/api/admin/reports", { cache: "no-store" });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error || "Could not load reports.");
      return;
    }

    setItems(payload.items || []);
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const updateStatus = async (
    reportId: number,
    status: (typeof STATUS_OPTIONS)[number]
  ) => {
    setMessage("");
    const response = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setMessage(payload.error || "Could not update report.");
      return;
    }

    setItems((current) =>
      current.map((item) => (item.id === reportId ? { ...item, status } : item))
    );
  };

  const visibleItems =
    statusFilter === "all"
      ? items
      : items.filter((item) => item.status === statusFilter);

  const counts = {
    all: items.length,
    open: items.filter((item) => item.status === "open").length,
    reviewing: items.filter((item) => item.status === "reviewing").length,
    resolved: items.filter((item) => item.status === "resolved").length,
    dismissed: items.filter((item) => item.status === "dismissed").length,
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7fafc_20%,#e8edf1_56%,#d7dfe5_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Admin</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#24323c]">
            Reports
          </h1>
          <p className="mt-2 text-sm text-[#6c7880]">
            Review new reports, filter by status, and jump straight to the affected
            target when you need context.
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
            Loading reports...
          </div>
        ) : visibleItems.length === 0 ? (
          <div className={`${APP_SURFACE_CARD_CLASS} p-5 text-sm text-[#6c7880]`}>
            {statusFilter === "all"
              ? "No reports yet."
              : `No ${statusFilter} reports.`}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleItems.map((item) => (
              <section key={item.id} className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#24323c]">
                      {item.target_type} #{item.target_id}
                    </div>
                    <div className="mt-1 text-xs text-[#849099]">
                      {item.reporter_display_name} · {item.reporter_user_id} ·{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span
                    className={`${APP_SOFT_CARD_CLASS} px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#52616a]`}
                  >
                    {STATUS_LABELS[item.status as (typeof STATUS_OPTIONS)[number]] ||
                      item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3`}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                      Reason
                    </div>
                    <div className="mt-2 text-sm font-medium text-[#24323c]">
                      {REASON_LABELS[item.reason] || item.reason}
                    </div>
                  </div>
                  <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3`}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                      Detail
                    </div>
                    <div className="mt-2 text-sm text-[#52616a]">
                      {item.detail || "No extra detail."}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-3 flex flex-wrap items-center gap-3 text-xs ${APP_SUBTLE_TEXT_CLASS}`}
                >
                  <span>Target type: {item.target_type}</span>
                  {item.target_href ? (
                    <Link
                      href={item.target_href}
                      className="font-medium text-[#3d4d57] underline underline-offset-4"
                    >
                      Open target
                    </Link>
                  ) : null}
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
            ))}
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
