"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

const PURPOSES = [
  "Coffee Chat",
  "Meal",
  "Walk",
  "Movie",
  "Study",
  "Work Together",
];

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [duration, setDuration] = useState("");
  const [location, setLocation] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ 기본 시간 = 현재 +3시간
  useEffect(() => {
    const now = new Date();
    now.setHours(now.getHours() + 3);
    setMeetingTime(now.toISOString().slice(0, 16));
  }, []);

  // ✅ 로그인 체크
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);
    };

    getUser();
  }, []);

  // ✅ Google Autocomplete
  useEffect(() => {
    if (!window.google || !searchInputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      searchInputRef.current,
      {
        fields: ["formatted_address", "name", "geometry"],
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();

      const address = place.formatted_address || "";
      const name = place.name || address;
      const lat = place.geometry?.location?.lat();
      const lng = place.geometry?.location?.lng();

      if (!lat || !lng) return;

      setPlaceName(name);
      setLocation(address);
      setLat(lat);
      setLng(lng);
    });
  }, []);

  // ✅ 생성
  const handleCreate = async () => {
    if (!meetingPurpose || !duration || !location) return;

    setLoading(true);

    await supabase.from("posts").insert({
      user_id: userId,
      meeting_purpose: meetingPurpose,
      meeting_time: new Date(meetingTime).toISOString(),
      duration_minutes: Number(duration),
      location,
      place_name: placeName || location,
      latitude: lat,
      longitude: lng,
    });

    setLoading(false);
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8">
      <div className="mx-auto max-w-xl rounded-3xl bg-white p-6 shadow">

        {/* PURPOSE */}
        <div className="mb-5 grid grid-cols-2 gap-2">
          {PURPOSES.map((p) => (
            <button
              key={p}
              onClick={() => setMeetingPurpose(p)}
              className={`rounded-xl border px-3 py-2 text-sm ${
                meetingPurpose === p
                  ? "bg-[#6b5f52] text-white"
                  : "bg-[#f4ece4]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {/* TIME */}
        <div
          onClick={() => {
            const el = document.getElementById(
              "datetime"
            ) as HTMLInputElement;
            el.showPicker?.();
          }}
          className="mb-3 cursor-pointer rounded-xl border px-4 py-3"
        >
          {new Date(meetingTime).toLocaleString()}
        </div>

        <input
          id="datetime"
          type="datetime-local"
          className="hidden"
          value={meetingTime}
          onChange={(e) => setMeetingTime(e.target.value)}
        />

        {/* DURATION */}
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mb-3 w-full rounded-xl border px-4 py-3"
        >
          <option value="">Duration</option>
          <option value="30">30 min</option>
          <option value="60">1 hour</option>
          <option value="120">2 hours</option>
        </select>

        {/* LOCATION */}
        <div className="flex gap-2">
          <input
            ref={searchInputRef}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Search place"
            className="flex-1 rounded-xl border px-4 py-3"
          />

          <button
            onClick={() => router.push("/write/location")}
            className="rounded-xl border px-4"
          >
            🗺️
          </button>
        </div>

        {/* CREATE */}
        <button
          onClick={handleCreate}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-black py-3 text-white"
        >
          {loading ? "Creating..." : "Create Meetup"}
        </button>
      </div>
    </main>
  );
}