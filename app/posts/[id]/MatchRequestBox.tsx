"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { HeartHandshake } from "lucide-react";

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
        if (existing.status === "pending") {
          setMessage("You already requested this meetup.");
          return;
        }

        if (existing.status === "accepted") {
          setMessage("This meetup is already matched.");
          return;
        }

        if (existing.status === "rejected") {
          setMessage("This request was already rejected.");
          return;
        }

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
        const errorText = error.message.toLowerCase();

        if (
          errorText.includes("duplicate") ||
          errorText.includes("unique") ||
          errorText.includes("already exists")
        ) {
          setMessage("You already requested this meetup.");
          return;
        }

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
    <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#2f2a26]">Request Match</h2>

      <div className="mt-5">
        <button
          type="button"
          onClick={handleRequestMatch}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
        >
          <HeartHandshake className="h-4 w-4" />
          {loading ? "Requesting..." : "Request Match"}
        </button>
      </div>

      {message && (
        <p className="mt-4 rounded-[20px] border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          {message}
        </p>
      )}
    </div>
  );
}