"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { Star, Pencil, Save } from "lucide-react";

type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
};

type Stats = {
  average_rating: number;
  review_count: number;
  completed_meetups: number;
};

type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ProfilePage() {
  const { id } = useParams();
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<Stats>({
    average_rating: 0,
    review_count: 0,
    completed_meetups: 0,
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [isOwner, setIsOwner] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        // 현재 유저
        const {
          data: { user },
        } = await supabase.auth.getUser();

        setIsOwner(user?.id === id);

        // 프로필
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .single();

        setProfile(profileData);
        setName(profileData?.display_name || "");
        setBio(profileData?.bio || "");

        // 통계
        const { data: statsData } = await supabase.rpc("get_profile_stats", {
          p_user_id: id,
        });

        if (statsData) {
          setStats({
            average_rating: statsData.average_rating || 0,
            review_count: statsData.review_count || 0,
            completed_meetups: statsData.completed_meetups || 0,
          });
        }

        // 후기
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("*")
          .eq("reviewee_id", id)
          .order("created_at", { ascending: false })
          .limit(10);

        setReviews(reviewData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, supabase]);

  const handleSave = async () => {
    await supabase
      .from("profiles")
      .update({
        display_name: name,
        bio: bio,
      })
      .eq("id", id);

    setEditMode(false);
  };

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-5">
        
        {/* 프로필 카드 */}
        <div className="rounded-[28px] border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-xl font-bold border-b"
              />
            ) : (
              <h1 className="text-2xl font-bold">
                {profile?.display_name || "No Name"}
              </h1>
            )}

            {isOwner && (
              <button
                onClick={() => {
                  if (editMode) handleSave();
                  else setEditMode(true);
                }}
                className="flex items-center gap-1 text-sm"
              >
                {editMode ? <Save size={16} /> : <Pencil size={16} />}
                {editMode ? "Save" : "Edit"}
              </button>
            )}
          </div>

          {/* 별점 */}
          <div className="mt-3 flex items-center gap-2">
            <Star className="text-[#a48f7a]" />
            <span className="font-semibold">
              {stats.average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-[#8b7f74]">
              ({stats.review_count})
            </span>
          </div>

          {/* 완료 횟수 */}
          <div className="mt-1 text-sm text-[#8b7f74]">
            {stats.completed_meetups} meetups completed
          </div>

          {/* Bio */}
          <div className="mt-4">
            {editMode ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border rounded p-2"
              />
            ) : (
              <div className="text-[#5a5149]">
                {profile?.bio || "No introduction yet."}
              </div>
            )}
          </div>
        </div>

        {/* 후기 */}
        <div className="rounded-[28px] border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3">Reviews</h2>

          {reviews.length === 0 ? (
            <div className="text-sm text-[#8b7f74]">No reviews yet</div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border-b pb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-[#a48f7a]" />
                    {r.rating}
                  </div>
                  <div className="text-sm mt-1">{r.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}