"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type Props = {
  postId: number;
  postOwnerUserId: string;
};

export default function MatchRequestBox({
  postId,
  postOwnerUserId,
}: Props) {
  const supabase = createClient();

  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestMatch = async () => {
    setStatusMessage("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatusMessage("Please log in first.");
      setLoading(false);
      return;
    }

    if (user.id === postOwnerUserId) {
      setStatusMessage("You cannot request your own meetup.");
      setLoading(false);
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("match_requests")
      .select("id, status")
      .eq("post_id", postId)
      .eq("requester_user_id", user.id)
      .maybeSingle();

    if (existingError) {
      setStatusMessage(existingError.message);
      setLoading(false);
      return;
    }

    if (existing) {
      setStatusMessage(`Request already exists: ${existing.status}`);
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("match_requests").insert({
      post_id: postId,
      requester_user_id: user.id,
      post_owner_user_id: postOwnerUserId,
      message,
      status: "pending",
      updated_at: new Date().toISOString(),
    });

    setLoading(false);

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    setMessage("");
    setStatusMessage("Match request sent.");
  };

  return (
    <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#2f2a26]">Request Match</h2>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        placeholder="Write a short message"
        className="mt-4 w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
      />

      <div className="mt-4">
        <button
          onClick={handleRequestMatch}
          disabled={loading}
          className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
        >
          {loading ? "Sending..." : "Request Match"}
        </button>
      </div>

      {statusMessage && (
        <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          {statusMessage}
        </p>
      )}
    </div>
  );
}