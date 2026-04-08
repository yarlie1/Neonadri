import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const userId = params.id;

  // 프로필
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // 리뷰
  const { data: reviews } = await supabase
    .from("match_reviews")
    .select("*")
    .eq("reviewee_user_id", userId)
    .order("created_at", { ascending: false });

  // 평균 별점 계산
  const avg =
    reviews && reviews.length > 0
      ? (
          reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="p-4 space-y-6">

      {/* 프로필 */}
      <div className="bg-white rounded-2xl p-5 shadow">
        <h1 className="text-xl font-bold">{profile?.name || "User"}</h1>
        <p className="text-sm text-gray-500">{profile?.email}</p>

        <div className="mt-3 text-sm">
          ⭐ {avg} ({reviews?.length || 0} reviews)
        </div>

        <div className="mt-3 text-sm text-gray-600">
          {profile?.about_me}
        </div>
      </div>

      {/* 후기 리스트 */}
      <div className="bg-white rounded-2xl p-5 shadow space-y-3">
        <h2 className="font-semibold">Reviews</h2>

        {reviews?.length === 0 && (
          <p className="text-sm text-gray-400">No reviews yet</p>
        )}

        {reviews?.map((r) => (
          <div key={r.id} className="border-b pb-2">
            <div className="text-sm">⭐ {r.rating}</div>
            <div className="text-sm text-gray-600">{r.review_text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}