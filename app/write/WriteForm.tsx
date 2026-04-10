"use client";

import { useEffect, useRef, useState } from "react";
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

export default function WriteForm({ userId }: { userId: string }) {
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
  const [debugInfo, setDebugInfo] = useState("");
  const [saving, setSaving] = useState(false);

  const fieldClass =
    "w-full rounded-xl border border-[#dccfc2] bg-white px-4 py-3 pl-12 text-sm text-[#2f2a26] focus:outline-none focus:ring-2 focus:ring-[#a48f7a]/40";

  useEffect(() => {
    if (!meetingTime) {
      const now = new Date();
      now.setHours(now.getHours() + 3);
      now.setSeconds(0, 0);
      setMeetingTime(now.toISOString().slice(0, 16));
    }
  }, [meetingTime]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const initAutocomplete = () => {
      if (
        typeof window === "undefined" ||
        !window.google ||
        !window.google.maps ||
        !window.google.maps.places ||
        !searchInputRef.current
      ) {
        return false;
      }

      if (autocompleteRef.current) return true;

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

        if (!address || nextLat == null || nextLng == null) {
          setLocationConfirmed(false);
          setDebugInfo("Place selected, but address or coordinates were missing.");
          return;
        }

        setPlaceName(name);
        setLocation(address);
        setLatitude(nextLat);
        setLongitude(nextLng);
        setLocationConfirmed(true);
        setMessage("");
        setDebugInfo("Exact location selected from Google autocomplete.");
      });

      return true;
    };

    if (!initAutocomplete()) {
      interval = setInterval(() => {
        if (initAutocomplete() && interval) {
          clearInterval(interval);
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = new URLSearchParams(window.location.search);
    const qName = query.get("name");
    const qLocation = query.get("location");
    const qLat = query.get("lat");
    const qLng = query.get("lng");

    if (qLocation && qLat && qLng) {
      setPlaceName(qName || qLocation);
      setLocation(qLocation);
      setLatitude(Number(qLat));
      setLongitude(Number(qLng));
      setLocationConfirmed(true);
      setMessage("");
      setDebugInfo("Exact location selected from map picker.");
    }
  }, []);

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPlaceName("");
    setLocation(e.target.value);
    setLatitude(null);
    setLongitude(null);
    setLocationConfirmed(false);
    setDebugInfo("Location text changed. Waiting for exact place selection.");
  };

  const handleOpenMapPicker = () => {
    router.push("/write/location?returnTo=/write");
  };

  const handleCreate = async () => {
    setMessage("");
    setDebugInfo("");

    if (!userId) {
      setMessage("Please sign in first.");
      setDebugInfo("No userId prop was provided to WriteForm.");
      return;
    }

    if (
      !meetingPurpose.trim() ||
      !meetingTime.trim() ||
      !durationMinutes.trim() ||
      !targetGender.trim() ||
      !targetAgeGroup.trim() ||
      !benefitAmount.trim()
    ) {
      setMessage("Please fill in all required fields.");
      setDebugInfo("Validation failed: one or more required fields are empty.");
      return;
    }

    if (
      !location.trim() ||
      latitude === null ||
      longitude === null ||
      !locationConfirmed
    ) {
      setMessage(
        "Please choose one exact location from the dropdown or map picker."
      );
      setDebugInfo(
        "Validation failed: location is not confirmed with latitude/longitude."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
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
      };

      setDebugInfo(
        [
          "Step 1: sending request to /api/posts/create",
          `server-passed userId: ${userId}`,
          "Step 2: request payload",
          JSON.stringify(payload, null, 2),
        ].join("\n")
      );

      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        setSaving(false);
        setMessage(result.error || "Failed to create meetup.");
        setDebugInfo(
          [
            "API error:",
            result.error || "",
            result.details || "",
            result.hint || "",
            result.code || "",
          ]
            .filter(Boolean)
            .join("\n")
        );
        return;
      }

      setDebugInfo(
        [
          "Step 3: insert success.",
          JSON.stringify(result.data, null, 2),
        ].join("\n")
      );

      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setSaving(false);
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
      setDebugInfo(
        e instanceof Error
          ? `Caught exception:\n${e.message}`
          : "Caught unknown exception."
      );
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f1ea] px-4 py-5 text-[#2f2a26]">
      <div className="mx-auto max-w-md rounded-xl border border-[#e7ddd2] bg-[#fffaf5] p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">Create Meetup</h1>

        <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {meetingPurpose
              ? PURPOSE_HELP_TEXT[meetingPurpose] ||
                "Select details to create your meetup."
              : "Select details to create your meetup."}
          </p>
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
                  className={`flex min-h-[48px] items-center gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? "border-[#a48f7a] bg-[#a48f7a] text-white"
                      : "border-[#e7ddd2] bg-white text-[#5a5149] active:bg-[#f6f1ea]"
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
            <Clock className="absolute left-4 top-4 h-4 w-4 text-[#8a7f74]" />
            <input
              type="datetime-local"
              className={fieldClass}
              value={meetingTime}
              onChange={(e) => setMeetingTime(e.target.value)}
            />
          </div>

          <div className="relative">
            <Clock className="absolute left-4 top-4 h-4 w-4 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pr-10`}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            >
              <option value="">Select duration</option>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="90">1 hour 30 min</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-[#8a7f74]" />
              <input
                ref={searchInputRef}
                className={`${fieldClass} pr-5`}
                placeholder="Search exact place or address"
                value={location}
                onChange={handleLocationInputChange}
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenMapPicker}
              className="inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-xl bg-[#f4ece4] text-[#6b5f52]"
              aria-label="Pick on map"
              title="Pick on map"
            >
              <MapPin className="h-5 w-5" />
            </button>
          </div>

          {location && (
            <div className="rounded-xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              <p className="font-medium text-[#2f2a26]">
                {placeName || location}
              </p>
              <p className="mt-1 break-words">{location}</p>

              {latitude !== null && longitude !== null && (
                <p className="mt-1 text-xs text-[#8b7f74]">
                  Lat: {latitude.toFixed(6)}, Lng: {longitude.toFixed(6)}
                </p>
              )}

              <p className="mt-1 text-xs">
                {locationConfirmed
                  ? "Exact location selected."
                  : "Select from dropdown or use the map picker."}
              </p>
            </div>
          )}
        </div>

        <h2 className="mt-6 text-sm font-semibold text-[#6b5f52]">
          Target & Benefit
        </h2>

        <div className="mt-3 space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-4 h-4 w-4 text-[#8a7f74]" />
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
            <User className="absolute left-4 top-4 h-4 w-4 text-[#8a7f74]" />
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
            <Coins className="absolute left-4 top-4 h-4 w-4 text-[#8a7f74]" />
            <select
              className={`${fieldClass} pr-10`}
              value={benefitAmount}
              onChange={(e) => setBenefitAmount(e.target.value)}
            >
              <option value="">Select benefit</option>
              <option value="$0">$0</option>
              <option value="$10">$10</option>
              <option value="$20">$20</option>
              <option value="$30">$30</option>
              <option value="$50">$50</option>
              <option value="$100">$100</option>
              <option value="$200+">$200+</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-[#a48f7a] py-4 text-base font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Meetup"}
        </button>

        {message && (
          <p className="mt-4 rounded-xl border border-[#f0d4d4] bg-[#fff5f5] px-4 py-3 text-sm text-[#c53030]">
            {message}
          </p>
        )}

        {debugInfo && (
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-[#d9d9d9] bg-white px-4 py-3 text-xs text-[#333]">
            {debugInfo}
          </pre>
        )}
      </div>
    </main>
  );
}