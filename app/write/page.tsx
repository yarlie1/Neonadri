"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Coffee,
  Utensils,
  Cake,
  Footprints,
  Dumbbell,
  Smile,
  Film,
  Mic,
  Dice5,
  Gamepad2,
  Target,
  BookOpen,
  Laptop,
  Camera,
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

const PURPOSE_OPTIONS = [
  { value: "Coffee Chat", icon: Coffee },
  { value: "Meal", icon: Utensils },
  { value: "Dessert", icon: Cake },
  { value: "Walk", icon: Footprints },
  { value: "Jogging", icon: Dumbbell },
  { value: "Yoga", icon: Smile },
  { value: "Movie", icon: Film },
  { value: "Karaoke", icon: Mic },
  { value: "Board Games", icon: Dice5 },
  { value: "Gaming", icon: Gamepad2 },
  { value: "Arcade", icon: Target },
  { value: "Study", icon: BookOpen },
  { value: "Work Together", icon: Laptop },
  { value: "Photo Walk", icon: Camera },
];

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [location, setLocation] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [targetAgeGroup, setTargetAgeGroup] = useState("");
  const [benefitAmount, setBenefitAmount] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [message, setMessage] = useState("");

  const fieldClass =
    "w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 pl-16 text-sm text-[#2f2a26] focus:outline-none focus:ring-2 focus:ring-[#a48f7a]/40";

  useEffect(() => {
    if (!window.google || !searchInputRef.current) return;

    if (!autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        searchInputRef.current,
        {
          fields: ["formatted_address", "name", "geometry"],
        }
      );

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        const address = place?.formatted_address || "";
        const name = place?.name || address;
        const nextLat = place?.geometry?.location?.lat?.();
        const nextLng = place?.geometry?.location?.lng?.();

        if (nextLat == null || nextLng == null) {
          setLocationConfirmed(false);
          return;
        }

        setPlaceName(name);
        setLocation(address);
        setLatitude(nextLat);
        setLongitude(nextLng);
        setLocationConfirmed(true);
        setMessage("");
      });
    }
  }, []);

  const handleCreate = async () => {
    if (
      !meetingPurpose ||
      !meetingTime ||
      !durationMinutes ||
      !locationConfirmed ||
      !targetGender ||
      !targetAgeGroup ||
      !benefitAmount
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    const { error } = await supabase.from("posts").insert({
      meeting_purpose: meetingPurpose,
      meeting_time: new Date(meetingTime).toISOString(),
      duration_minutes: Number(durationMinutes),
      location,
      place_name: placeName,
      latitude,
      longitude,
      target_gender: targetGender,
      target_age_group: targetAgeGroup,
      benefit_amount: benefitAmount,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-5 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-md rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
        <h1 className="text-2xl font-semibold">Create Meetup</h1>

        <div className="mt-4 flex gap-2 rounded-2xl bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          <CheckCircle className="h-4 w-4 mt-0.5" />
          Select details to create your meetup.
        </div>

        {/* 목적 */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {PURPOSE_OPTIONS.map((item) => {
            const Icon = item.icon;
            const isSelected = meetingPurpose === item.value;

            return (
              <button
                key={item.value}
                onClick={() => setMeetingPurpose(item.value)}
                className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
                  isSelected
                    ? "bg-[#a48f7a] text-white border-[#a48f7a]"
                    : "bg-white border-[#e7ddd2]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.value}
              </button>
            );
          })}
        </div>

        {/* 디테일 */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
            <input
              type="datetime-local"
              className={fieldClass}
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>

          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
            <select
              className={`${fieldClass} pr-10`}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option value="">Select duration</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
              <input
                ref={searchInputRef}
                className={`${fieldClass} pr-5`}
                placeholder="Search place"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button
              onClick={() => router.push("/write/location")}
              className="w-12 h-12 rounded-2xl bg-[#f4ece4] flex items-center justify-center"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 타겟 */}
        <div className="mt-6 space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
            <select
              className={`${fieldClass} pr-10`}
              value={targetGender}
              onChange={(e) => setTargetGender(e.target.value)}
            >
              <option value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Any</option>
            </select>
          </div>

          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
            <select
              className={`${fieldClass} pr-10`}
              value={targetAgeGroup}
              onChange={(e) => setTargetAgeGroup(e.target.value)}
            >
              <option value="">Age</option>
              <option>20s</option>
              <option>30s</option>
              <option>40s</option>
            </select>
          </div>

          <div className="relative">
            <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4" />
            <select
              className={`${fieldClass} pr-10`}
              value={benefitAmount}
              onChange={(e) => setBenefitAmount(e.target.value)}
            >
              <option value="">Benefit</option>
              <option>$10</option>
              <option>$20</option>
              <option>$30</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="mt-6 w-full rounded-2xl bg-[#a48f7a] py-4 text-white font-semibold"
        >
          Create Meetup
        </button>

        {message && (
          <p className="mt-4 text-sm text-red-500">{message}</p>
        )}
      </div>
    </main>
  );
}