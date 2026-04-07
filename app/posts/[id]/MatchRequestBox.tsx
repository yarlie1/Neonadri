"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";

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
      <h2 className="text-2xl font-semibold text-[#2f2a26]">Request Match</h2>

      <div className="mt-5">
        <button
          type="button"
          onClick={handleRequestMatch}
          disabled={loading}
          className="rounded-2xl bg-[#a48f7a] px-6 py-3 text-base font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
        >
          {loading ? "Requesting..." : "Request Match"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          {message}
        </p>
      )}
    </div>
  );
}