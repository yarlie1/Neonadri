"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_BUTTON_SECONDARY_CLASS } from "../../designSystem";

export default function AdminPostVisibilityButton({
  postId,
  hidden,
}: {
  postId: number;
  hidden: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const label = hidden ? "Restore" : "Hide";

  const handleClick = async () => {
    if (submitting) return;

    const reason = hidden
      ? ""
      : window.prompt("Reason for hiding this meetup?", "Admin hidden") || "Admin hidden";

    if (!hidden && !reason.trim()) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/admin/posts/${postId}/visibility`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hidden: !hidden,
          reason,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        window.alert(payload.error || "Could not update this meetup.");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Admin post visibility update failed", error);
      window.alert("Could not update this meetup.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${APP_BUTTON_SECONDARY_CLASS}`}
    >
      {submitting ? "Saving..." : label}
    </button>
  );
}
