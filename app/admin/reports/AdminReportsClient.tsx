"use client";

import { useEffect, useState } from "react";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

type ReportItem = {
  id: number;
  reporter_user_id: string;
  target_type: string;
  target_id: string;
  reason: string;
  detail: string | null;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ["open", "reviewing", "resolved", "dismissed"] as const;

export default function AdminReportsClient() {
  const [items, setItems] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadReports = async () => {
    setLoading(true);
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

  const updateStatus = async (reportId: number, status: (typeof STATUS_OPTIONS)[number]) => {
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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7fafc_20%,#e8edf1_56%,#d7dfe5_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Admin</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#24323c]">
            Reports
          </h1>
          <p className="mt-2 text-sm text-[#6c7880]">
            Review new reports, update status, and track safety issues in one place.
          </p>
        </section>

        {loading ? (
          <div className={`${APP_SURFACE_CARD_CLASS} p-5 text-sm text-[#6c7880]`}>
            Loading reports...
          </div>
        ) : items.length === 0 ? (
          <div className={`${APP_SURFACE_CARD_CLASS} p-5 text-sm text-[#6c7880]`}>
            No reports yet.
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <section key={item.id} className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#24323c]">
                      {item.target_type} #{item.target_id}
                    </div>
                    <div className="mt-1 text-xs text-[#849099]">
                      Reporter {item.reporter_user_id} · {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                  <span className={`${APP_SOFT_CARD_CLASS} px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#52616a]`}>
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3`}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                      Reason
                    </div>
                    <div className="mt-2 text-sm font-medium text-[#24323c]">{item.reason}</div>
                  </div>
                  <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3`}>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                      Detail
                    </div>
                    <div className="mt-2 text-sm text-[#52616a]">{item.detail || "No extra detail."}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => void updateStatus(item.id, status)}
                      className={`inline-flex items-center rounded-full px-3.5 py-2 text-xs font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
                    >
                      Mark {status}
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
