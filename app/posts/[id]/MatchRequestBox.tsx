"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
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
  const [messageType, setMessageType] = useState<"success" | "info">("info");

  const handleRequestMatch = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in first.");
        setMessageType("info");
        return;
      }

      if (user.id === postOwnerUserId) {
        setMessage("You cannot request your own meetup.");
        setMessageType("info");
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
        setMessageType("info");
        return;
      }

      if (existing) {
        const status = String(existing.status || "").toLowerCase();

        if (status === "pending") {
          setMessage("Your request has already been sent.");
        } else if (status === "accepted") {
          setMessage("Your request was already accepted.");
        } else if (status === "rejected") {
          setMessage("This request was previously declined.");
        } else {
          setMessage(`Request already exists: ${existing.status}`);
        }

        setMessageType("info");
        return;
      }

      const { error } = await supabase.from("match_requests").insert({
        post_id: postId,
        requester_user_id: user.id,
        post_owner_user_id: postOwnerUserId,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          setMessage("Your request has already been sent.");
          setMessageType("info");
          return;
        }

        setMessage(error.message);
        setMessageType("info");
        return;
      }

      setMessage("Match request sent successfully.");
      setMessageType("success");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 px-6 py-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6eee6]">
          <Send className="h-5 w-5 text-[#8a7f74]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
            Join this meetup
          </div>
          <h2 className="mt-2 text-[1.7rem] font-black tracking-[-0.04em] text-[#2f2a26]">
            Request Match
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6f655c]">
            Send a request to the host if you want to join this meetup.
          </p>
        </div>
        </div>

        <div className="rounded-full bg-[#f6eee6] px-3 py-1.5 text-xs font-medium text-[#7a6b61]">
          Host approval
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-4 text-sm leading-6 text-[#6b5f52]">
        Once you send a request, the host can review your profile and accept or decline from their dashboard.
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRequestMatch}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {loading ? "Sending..." : "Send Request"}
        </button>
      </div>

      {message && (
        <div
          className={`mt-5 rounded-[22px] border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-[#dccfc2] bg-[#efe7dc] text-[#5f5347]"
              : "border-[#e7ddd2] bg-[#f4ece4] text-[#6b5f52]"
          }`}
        >
          <div className="flex items-start gap-2">
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
