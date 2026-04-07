"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
] as const;

const PURPOSE_HELP_TEXT: Record<string, string> = {
  "Coffee Chat": "Quick casual conversation over coffee.",
  Meal: "Enjoy food and conversation together.",
  Dessert: "Meet for dessert, cafe time, and easy conversation.",
  Walk: "Light walk and chat outdoors.",
  Jogging: "Go for a jog together and stay active.",
  Yoga: "Join a calm and healthy yoga session together.",
  Movie: "Watch a movie together and chat after.",
  Karaoke: "Sing and have fun together.",
  "Board Games": "Play board games and enjoy a relaxed meetup.",
  Gaming: "Play video games together.",
  Arcade: "Have fun with arcade games together.",
  Study: "Focus together in a quiet place.",
  "Work Together": "Work side by side in a cafe or shared space.",
  "Photo Walk": "Walk around and take photos together.",
};

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const [userId, setUserId] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [location, setLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [targetAgeGroup, setTargetAgeGroup] = useState("");
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [benefitAmount, setBenefitAmount] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const fieldClass =
    "w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 pl-14 text-sm text-[#2f2a26] focus:outline-none focus:ring-2 focus:ring-[#a48f7a]/40";

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
          fields: ["formatted_address", "name", "geometry"],
        });

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current.getPlace();

        if (!place?.formatted_address || !place?.geometry?.location) return;

        setPlaceName(place.name || place.formatted_address);
        setLocation(place.formatted_address);
        setLatitude(place.geometry.location.lat());
        setLongitude(place.geometry.location.lng());
        setLocationConfirmed(true);
      });
    }
  }, []);

  const purposeHelpText = useMemo(() => {
    if (!meetingPurpose) {
      return "Choose the kind of meetup you want, and a short description will appear here.";
    }
    return PURPOSE_HELP_TEXT[meetingPurpose] || "";
  }, [meetingPurpose]);

  const selectedPurpose = useMemo(
    () => PURPOSE_OPTIONS.find((item) => item.value === meetingPurpose),
    [meetingPurpose]
  );

  const handleCreatePost = async () => {
    setMessage("");

    if (!meetingPurpose) {
      setMessage("Please select a meetup type.");
      return;
    }

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

    if (!locationConfirmed || latitude === null || longitude === null) {
      setMessage("Please select a valid location.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      place_name: placeName || location,
      location,
      meeting_time: new Date(meetingTime).toISOString(),
      duration_minutes: Number(durationMinutes),
      target_gender: targetGender,
      target_age_group: targetAgeGroup,
      meeting_purpose: meetingPurpose,
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
    <main className="min-h-screen bg-[#f7f1ea] px-5 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-md rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
        <h1 className="text-2xl font-semibold">Create Meetup</h1>

        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{purposeHelpText}</p>
        </div>

        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-[#6b5f52]">
            Choose Activity
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {PURPOSE_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = meetingPurpose === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMeetingPurpose(item.value)}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? "border-[#a48f7a] bg-[#a48f7a] text-white"
                      : "border-[#e7ddd2] bg-white text-[#5a5149] hover:bg-[#f6f1ea]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <h2 className="mt-6 text-sm font-semibold text-[#6b5f52]">
          Meetup Details
        </h2>

        <div className="mt-3 space-y-3">
          <div className="relative">
            <Clock className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <input
              type="datetime-local"
              className={fieldClass}
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>

          <div className="relative">
            <Clock className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pr-10`}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option value="">Select meeting duration</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
              <input
                ref={searchInputRef}
                className={`${fieldClass} pr-4`}
                placeholder="Search exact place or address"
                value={location}
                onChange={(e) => {
                  setPlaceName("");
                  setLocation(e.target.value);
                  setLatitude(null);
                  setLongitude(null);
                  setLocationConfirmed(false);
                }}
              />
            </div>

            <button
              onClick={() => router.push("/write/location")}
              className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-[#f4ece4] text-[#6b5f52]"
              type="button"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>

          {location && (
            <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              <p className="font-medium text-[#2f2a26]">
                {placeName || location}
              </p>
              <p className="mt-1">{location}</p>
              {locationConfirmed ? (
                <p className="mt-1 text-xs text-[#8b7f74]">
                  Exact location selected.
                </p>
              ) : (
                <p className="mt-1 text-xs text-[#8b7f74]">
                  Select from the suggestion list.
                </p>
              )}
            </div>
          )}
        </div>

        <h2 className="mt-6 text-sm font-semibold text-[#6b5f52]">
          Target & Benefit
        </h2>

        <div className="mt-3 space-y-3">
          <div className="relative">
            <User className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pr-10`}
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
            <User className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pr-10`}
              value={targetAgeGroup}
              onChange={(e) => setTargetAgeGroup(e.target.value)}
            >
              <option value="">Select age</option>
              <option value="20s">20s</option>
              <option value="30s">30s</option>
              <option value="40s">40s</option>
              <option value="50s+">50s+</option>
              <option value="Any">Any</option>
            </select>
          </div>

          <div className="relative">
            <Coins className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pr-10`}
              value={benefitAmount}
              onChange={(e) => setBenefitAmount(e.target.value)}
            >
              <option value="">Select benefit</option>
              <option value="$0">$0</option>
              <option value="$10">$10</option>
              <option value="$30">$30</option>
              <option value="$50">$50</option>
              <option value="$100">$100</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleCreatePost}
          disabled={loading || !userId}
          className="mt-6 w-full rounded-2xl bg-[#a48f7a] py-4 text-base font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Meetup"}
        </button>

        {message && (
          <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}