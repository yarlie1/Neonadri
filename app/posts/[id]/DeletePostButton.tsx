"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { APP_BUTTON_SECONDARY_CLASS } from "../../designSystem";

export default function DeletePostButton({ postId }: { postId: number }) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this meetup?");
    if (!confirmed || deleting) return;

    setDeleting(true);
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      setDeleting(false);
      window.alert(error.message);
      return;
    }

    router.push("/dashboard?tab=posts");
    router.refresh();
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
