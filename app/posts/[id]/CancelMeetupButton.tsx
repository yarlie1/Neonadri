"use client";

import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_BUTTON_SECONDARY_CLASS } from "../../designSystem";

export default function CancelMeetupButton({ postId }: { postId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (loading) return;

    const confirmed = window.confirm(
      "Cancel this meetup?\n\nThis meetup will stop accepting requests, and chat will become read-only for matched participants."
    );

    if (!confirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/cancel`, {
        method: "POST",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        window.alert(payload?.error || "Failed to cancel meetup.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${APP_BUTTON_SECONDARY_CLASS}`}
    >
      <Ban className="h-4 w-4" />
      {loading ? "Cancelling..." : "Cancel Meetup"}
    </button>
  );
}
