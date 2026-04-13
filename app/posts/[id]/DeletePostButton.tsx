"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";

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
      className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4] disabled:opacity-60"
    >
      <Trash2 className="h-4 w-4" />
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
