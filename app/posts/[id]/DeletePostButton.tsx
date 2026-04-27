"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { APP_BUTTON_SECONDARY_CLASS } from "../../designSystem";

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this meetup?");
    if (!confirmed || deleting) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        window.alert(payload.error || "Could not delete this meetup.");
        return;
      }

      router.push("/dashboard?tab=posts");
      router.refresh();
    } catch (error) {
      console.error("Delete meetup request failed", error);
      window.alert("Could not delete this meetup right now.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${APP_BUTTON_SECONDARY_CLASS}`}
    >
      <Trash2 className="h-4 w-4" />
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
