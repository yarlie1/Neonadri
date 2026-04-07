"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

const PURPOSE_OPTIONS = [
  {
    value: "Coffee Chat",
    icon: "☕",
    baseClass:
      "border-[#d8c2a8] bg-[#f8efe6] text-[#6b4f3a] hover:bg-[#f3e4d6]",
    selectedClass: "border-[#8b5e3c] bg-[#8b5e3c] text-white",
  },
  {
    value: "Meal",
    icon: "🍽",
    baseClass:
      "border-[#e3c9b6] bg-[#fbf3ec] text-[#7a5a42] hover:bg-[#f5e7dc]",
    selectedClass: "border-[#9a6a44] bg-[#9a6a44] text-white",
  },
  {
    value: "Dessert",
    icon: "🍰",
    baseClass:
      "border-[#efd2cb] bg-[#fdf2ef] text-[#8a5a52] hover:bg-[#fae7e1]",
    selectedClass: "border-[#b86b5d] bg-[#b86b5d] text-white",
  },
  {
    value: "Walk",
    icon: "🚶",
    baseClass:
      "border-[#bfd8c3] bg-[#edf7ef] text-[#466b4d] hover:bg-[#e2f1e5]",
    selectedClass: "border-[#4f8a5b] bg-[#4f8a5b] text-white",
  },
  {
    value: "Jogging",
    icon: "🏃",
    baseClass:
      "border-[#c6ddd1] bg-[#eef8f2] text-[#42705d] hover:bg-[#e1f0e7]",
    selectedClass: "border-[#46856b] bg-[#46856b] text-white",
  },
  {
    value: "Yoga",
    icon: "🧘",
    baseClass:
      "border-[#d8cde8] bg-[#f6f1fb] text-[#6a5687] hover:bg-[#eee6f8]",
    selectedClass: "border-[#7d65a8] bg-[#7d65a8] text-white",
  },
  {
    value: "Movie",
    icon: "🎬",
    baseClass:
      "border-[#c7cedd] bg-[#f3f5fa] text-[#505c74] hover:bg-[#e8edf6]",
    selectedClass: "border-[#5c6f94] bg-[#5c6f94] text-white",
  },
  {
    value: "Karaoke",
    icon: "🎤",
    baseClass:
      "border-[#e5c7d4] bg-[#fbf1f5] text-[#8a5167] hover:bg-[#f5e3ea]",
    selectedClass: "border-[#b45d82] bg-[#b45d82] text-white",
  },
  {
    value: "Board Games",
    icon: "🎲",
    baseClass:
      "border-[#d7d0c5] bg-[#f8f5f1] text-[#6b5f52] hover:bg-[#f1ebe5]",
    selectedClass: "border-[#8a7a68] bg-[#8a7a68] text-white",
  },
  {
    value: "Gaming",
    icon: "🎮",
    baseClass:
      "border-[#c9cfe6] bg-[#f2f4fb] text-[#535f89] hover:bg-[#e7ebf8]",
    selectedClass: "border-[#6373ad] bg-[#6373ad] text-white",
  },
  {
    value: "Bowling",
    icon: "🎳",
    baseClass:
      "border-[#d9c9bf] bg-[#faf4ef] text-[#7c5d4f] hover:bg-[#f3e8df]",
    selectedClass: "border-[#9a6b55] bg-[#9a6b55] text-white",
  },
  {
    value: "Arcade",
    icon: "🎯",
    baseClass:
      "border-[#e7d2bd] bg-[#fcf5ed] text-[#886245] hover:bg-[#f7eadc]",
    selectedClass: "border-[#b67a47] bg-[#b67a47] text-white",
  },
  {
    value: "Study",
    icon: "📚",
    baseClass:
      "border-[#bfd3e8] bg-[#eef5fb] text-[#46627c] hover:bg-[#e2eef8]",
    selectedClass: "border-[#4c78a8] bg-[#4c78a8] text-white",
  },
  {
    value: "Work Together",
    icon: "💻",
    baseClass:
      "border-[#c7d6df] bg-[#f1f7fa] text-[#486270] hover:bg-[#e5f0f5]",
    selectedClass: "border-[#53798d] bg-[#53798d] text-white",
  },
  {
    value: "Book Talk",
    icon: "📖",
    baseClass:
      "border-[#d8d2c4] bg-[#f8f6f0] text-[#6f6654] hover:bg-[#f0ece2]",
    selectedClass: "border-[#8f8265] bg-[#8f8265] text-white",
  },
  {
    value: "Photo Walk",
    icon: "📷",
    baseClass:
      "border-[#c8d7d9] bg-[#f1f8f8] text-[#4f6e72] hover:bg-[#e4efef]",
    selectedClass: "border-[#5e868c] bg-[#5e868c] text-white",
  },
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
  Bowling: "Meet and enjoy a bowling game together.",
  Arcade: "Have fun with arcade games together.",
  Study: "Focus together in a quiet place.",
  "Work Together": "Work side by side in a cafe or shared space.",
  "Book Talk": "Read or talk about books together.",
  "Photo Walk": "Walk around and take photos together.",
};

export default function EditWritePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

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

  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUserAndPost = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, user_id, meeting_purpose, meeting_time, duration_minutes, location, place_name, latitude, longitude, target_gender, target_age_group, benefit_amount"
        )
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }

      setMeetingPurpose(data.meeting_purpose || "");

      if (data.meeting_time) {
        setMeetingTime(new Date(data.meeting_time).toISOString().slice(0, 16));
      } else {
        const now = new Date();
        now.setHours(now.getHours() + 3);
        now.setSeconds(0, 0);
        setMeetingTime(now.toISOString().slice(0, 16));
      }

      setDurationMinutes(
        data.duration_minutes ? String(data.duration_minutes) : ""
      );
      setLocation(data.location || "");
      setPlaceName(data.place_name || "");
      setLatitude(data.latitude ?? null);
      setLongitude(data.longitude ?? null);
      setLocationConfirmed(
        !!data.location && data.latitude !== null && data.longitude !== null
      );
      setTargetGender(data.target_gender || "");
      setTargetAgeGroup(data.target_age_group || "");
      setBenefitAmount(data.benefit_amount || "");
      setLoading(false);
    };

    loadUserAndPost();
  }, [params.id, router, supabase]);

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
    }
  }, []);

  const purposeHelpText = useMemo(() => {
    if (!meetingPurpose) {
      return "Choose the kind of meetup you want, and a short description will appear here.";
    }
    return PURPOSE_HELP_TEXT[meetingPurpose] || "";
  }, [meetingPurpose]);

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPlaceName("");
    setLocation(e.target.value);
    setLatitude(null);
    setLongitude(null);
    setLocationConfirmed(false);
  };

  const handleOpenMapPicker = () => {
    router.push(`/write/location?returnTo=/write/${params.id}`);
  };

  const handleSave = async () => {
    setMessage("");

    if (
      !meetingTime.trim() ||
      !durationMinutes.trim() ||
      !targetGender.trim() ||
      !targetAgeGroup.trim() ||
      !meetingPurpose.trim() ||
      !benefitAmount.trim()
    ) {
      setMessage("Please fill in all required fields.");
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
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("posts")
      .update({
        meeting_purpose: meetingPurpose,
        meeting_time: new Date(meetingTime).toISOString(),
        duration_minutes: Number(durationMinutes),
        location,
        place_name: placeName || location,
        latitude,
        longitude,
        target_gender: targetGender,
        target_age_group: targetAgeGroup,
        benefit_amount: benefitAmount,
      })
      .eq("id", params.id)
      .eq("user_id", userId);

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-6 py-8">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
          Edit Meetup
        </h1>

        <div className="mt-8 space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PURPOSE_OPTIONS.map((item) => {
                const isSelected = meetingPurpose === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setMeetingPurpose(item.value)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                      isSelected ? item.selectedClass : item.baseClass
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.value}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              <p className="mt-1">{purposeHelpText}</p>
            </div>
          </div>

          <input
            type="datetime-local"
            className="sr-only"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
            id="hidden-edit-datetime-input"
          />

          <div
            onClick={() => {
              const input = document.getElementById(
                "hidden-edit-datetime-input"
              ) as HTMLInputElement | null;
              if (input) {
                input.showPicker ? input.showPicker() : input.click();
              }
            }}
            className="w-full cursor-pointer rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
          >
            {meetingTime && new Date(meetingTime).toLocaleString()}
          </div>

          <select
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
          >
            <option value="">Select meeting duration</option>
            <option value="30">30 min</option>
            <option value="60">1 hour</option>
            <option value="90">1 hour 30 min</option>
            <option value="120">2 hours</option>
            <option value="180">3 hours</option>
            <option value="240">4 hours</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              ref={searchInputRef}
              className="flex-1 rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Search exact place or address"
              value={location}
              onChange={handleLocationInputChange}
            />

            <button
              type="button"
              onClick={handleOpenMapPicker}
              aria-label="Pick on map"
              title="Pick on map"
              className="shrink-0 rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-3 text-lg text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              🗺️
            </button>
          </div>

          {location && (
            <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              <p className="font-medium text-[#2f2a26]">Selected place</p>
              <p className="mt-1 text-base font-semibold text-[#2f2a26]">
                {placeName || location}
              </p>
              <p className="mt-1 text-sm text-[#6b5f52]">{location}</p>

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

          <select
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            value={benefitAmount}
            onChange={(e) => setBenefitAmount(e.target.value)}
          >
            <option value="">Select benefit amount</option>
            <option value="$0">$0</option>
            <option value="$10">$10</option>
            <option value="$20">$20</option>
            <option value="$30">$30</option>
            <option value="$50">$50</option>
            <option value="$100">$100</option>
            <option value="$200+">$200+</option>
          </select>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Meetup"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
          >
            Cancel
          </button>
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