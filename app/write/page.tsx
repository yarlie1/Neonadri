"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [targetAgeGroup, setTargetAgeGroup] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);
    };

    checkUser();
  }, [router, supabase]);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        fields: ["formatted_address", "name", "geometry"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (place?.formatted_address) {
        setLocation(place.formatted_address);
      } else if (place?.name) {
        setLocation(place.name);
      }
    });

    return () => {
      if (window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  const handleCreatePost = async () => {
    setMessage("");

    if (
      !title.trim() ||
      !content.trim() ||
      !location.trim() ||
      !meetingTime.trim() ||
      !targetGender.trim() ||
      !targetAgeGroup.trim()
    ) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      title,
      content,
      location,
      meeting_time: new Date(meetingTime).toISOString(),
      target_gender: targetGender,
      target_age_group: targetAgeGroup,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
          Neonadri
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
          Write a Post
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#6f655c]">
          Share who you want to meet, where, and when.
        </p>

        <div className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            ref={inputRef}
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            placeholder="Search location"
            defaultValue={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            type="datetime-local"
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />

          <select
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            value={targetGender}
            onChange={(e) => setTargetGender(e.target.value)}
          >
            <option value="">Select target gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Any">Any</option>
          </select>

          <select
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            value={targetAgeGroup}
            onChange={(e) => setTargetAgeGroup(e.target.value)}
          >
            <option value="">Select target age group</option>
            <option value="20s">20s</option>
            <option value="30s">30s</option>
            <option value="40s">40s</option>
            <option value="50s+">50s+</option>
            <option value="Any">Any</option>
          </select>

          <textarea
            className="min-h-[220px] w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            placeholder="Write your content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleCreatePost}
            disabled={loading || !userId}
            className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Post"}
          </button>

          <a
            href="/"
            className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
          >
            Back to Home
          </a>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}