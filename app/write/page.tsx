"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Clock,
  User,
  Coins,
  CheckCircle,
} from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const [userId, setUserId] = useState("");
  const [location, setLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [targetAgeGroup, setTargetAgeGroup] = useState("");
  const [benefitAmount, setBenefitAmount] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fieldClass =
    "w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26] focus:outline-none focus:ring-2 focus:ring-[#a48f7a]/40";

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
    if (!meetingTime) {
      const now = new Date();
      now.setHours(now.getHours() + 3);
      now.setSeconds(0, 0);
      setMeetingTime(now.toISOString().slice(0, 16));
    }
  }, [meetingTime]);

  useEffect(() => {
    if (!window.google || !searchInputRef.current) return;

    if (!autocompleteRef.current) {
      autocompleteRef.current =
        new window.google.maps.places.Autocomplete(searchInputRef.current, {
          fields: ["formatted_address", "geometry"],
        });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place?.formatted_address) return;

        setLocation(place.formatted_address);
        setLatitude(place.geometry.location.lat());
        setLongitude(place.geometry.location.lng());
        setLocationConfirmed(true);
      });
    }
  }, []);

  const handleCreatePost = async () => {
    setMessage("");

    if (
      !meetingTime ||
      !durationMinutes ||
      !targetGender ||
      !targetAgeGroup ||
      !benefitAmount
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    if (!locationConfirmed) {
      setMessage("Please select a valid location.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      location,
      meeting_time: new Date(meetingTime).toISOString(),
      duration_minutes: Number(durationMinutes),
      target_gender: targetGender,
      target_age_group: targetAgeGroup,
      benefit_amount: benefitAmount,
      latitude,
      longitude,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-5 py-6">
      <div className="mx-auto max-w-md rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
        
        <h1 className="text-2xl font-semibold">Create Meetup</h1>

        {/* 설명 */}
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          <CheckCircle className="mt-0.5 h-4 w-4" />
          <p>Select details below to create your meetup.</p>
        </div>

        {/* Meetup Details */}
        <h2 className="mt-6 text-sm font-semibold text-[#6b5f52]">
          Meetup Details
        </h2>

        <div className="mt-3 space-y-3">

          {/* 날짜 */}
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <input
              type="datetime-local"
              className={`${fieldClass} pl-11`}
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>

          {/* duration */}
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pl-11`}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option value="">Select meeting duration</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          {/* 🔥 위치 (겹침 FIX 적용) */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
              <input
                ref={searchInputRef}
                className={`${fieldClass} pl-14 pr-4`}
                placeholder="Search exact place or address"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setLocationConfirmed(false);
                }}
              />
            </div>

            <button
              onClick={() => router.push("/write/location")}
              className="rounded-2xl bg-[#f4ece4] px-4 py-3"
            >
              🗺️
            </button>
          </div>
        </div>

        {/* Target */}
        <h2 className="mt-6 text-sm font-semibold text-[#6b5f52]">
          Target & Benefit
        </h2>

        <div className="mt-3 space-y-3">

          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pl-11`}
              value={targetGender}
              onChange={(e) => setTargetGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pl-11`}
              value={targetAgeGroup}
              onChange={(e) => setTargetAgeGroup(e.target.value)}
            >
              <option value="">Select age</option>
              <option value="20s">20s</option>
              <option value="30s">30s</option>
              <option value="40s">40s</option>
            </select>
          </div>

          <div className="relative">
            <Coins className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pl-11`}
              value={benefitAmount}
              onChange={(e) => setBenefitAmount(e.target.value)}
            >
              <option value="">Select benefit</option>
              <option value="$0">$0</option>
              <option value="$30">$30</option>
              <option value="$50">$50</option>
              <option value="$100">$100</option>
            </select>
          </div>
        </div>

        {/* 버튼 */}
        <button
          onClick={handleCreatePost}
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-[#a48f7a] py-3 text-white font-medium"
        >
          {loading ? "Creating..." : "Create Meetup"}
        </button>

        {message && (
          <p className="mt-4 text-sm text-red-500">{message}</p>
        )}
      </div>
    </main>
  );
}