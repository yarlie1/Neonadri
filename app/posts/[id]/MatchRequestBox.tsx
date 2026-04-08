"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2 } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

type Props = {
  postId: number;
  postOwnerUserId: string;
};

export default function MatchRequestBox({ postId, postOwnerUserId }: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequestMatch = async () => {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in first.");
        return;
      }

      if (user.id === postOwnerUserId) {
        setMessage("You cannot request your own meetup.");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("match_requests")
        .select("id, status")
        .eq("post_id", postId)
        .eq("requester_user_id", user.id)
        .eq("post_owner_user_id", postOwnerUserId)
        .maybeSingle();

      if (existingError) {
        setMessage(existingError.message);
        return;
      }

      if (existing) {
        setMessage(`Request already exists: ${existing.status}`);
        return;
      }

      const { error } = await supabase.from("match_requests").insert({
        post_id: postId,
        requester_user_id: user.id,
        post_owner_user_id: postOwnerUserId,
        status: "pending",
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Match request sent.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f4ece4]">
          <Send className="h-5 w-5 text-[#8a7f74]" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[1.5rem] font-bold text-[#2f2a26]">
            Request Match
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6f655c]">
            Send a match request to the host if you want to join this meetup.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRequestMatch}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-[1rem] bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? "Requesting..." : "Send Request"}
        </button>
      </div>

      {message && (
        <div className="mt-5 rounded-[1.25rem] border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}