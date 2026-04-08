"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function WriteReviewPage({
  params,
}: {
  params: { matchId: string };
}) {
  const supabase = createClient();
  const router = useRouter();

  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const handleSubmit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // match 정보 가져오기
    const { data: match } = await supabase
      .from("matches")
      .select("*")
      .eq("id", params.matchId)
      .single();

    if (!match) return;

    // 상대방 id 계산
    const reviewee =
      match.user1_id === user.id
        ? match.user2_id
        : match.user1_id;

    await supabase.from("match_reviews").insert({
      match_id: match.id,
      reviewer_user_id: user.id,
      reviewee_user_id: reviewee,
      rating,
      review_text: text,
    });

    alert("Review submitted!");

    router.push("/dashboard");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold">Leave Review</h1>

      <div>
        <label className="text-sm">Rating</label>
        <select
          className="border rounded w-full p-2"
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm">Comment</label>
        <textarea
          className="border rounded w-full p-2"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-black text-white w-full py-2 rounded"
      >
        Submit
      </button>
    </div>
  );
}