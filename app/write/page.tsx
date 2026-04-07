"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  Coffee,
  UtensilsCrossed,
  CakeSlice,
  Footprints,
  PersonStanding,
  Clapperboard,
  Mic2,
  Gamepad2,
  BookOpen,
  BriefcaseBusiness,
  Book,
  Camera,
  Clock3,
  MapPin,
  UserRound,
  Coins,
  Map,
  CheckCircle2,
} from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

const PURPOSE_OPTIONS = [
  { value: "Coffee Chat", icon: Coffee },
  { value: "Meal", icon: UtensilsCrossed },
  { value: "Dessert", icon: CakeSlice },
  { value: "Walk", icon: Footprints },
  { value: "Jogging", icon: PersonStanding },
  { value: "Yoga", icon: PersonStanding },
  { value: "Movie", icon: Clapperboard },
  { value: "Karaoke", icon: Mic2 },
  { value: "Board Games", icon: Gamepad2 },
  { value: "Gaming", icon: Gamepad2 },
  { value: "Bowling", icon: Gamepad2 },
  { value: "Arcade", icon: Gamepad2 },
  { value: "Study", icon: BookOpen },
  { value: "Work Together", icon: BriefcaseBusiness },
  { value: "Book Talk", icon: Book },
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
  Bowling: "Meet and enjoy a bowling game together.",
  Arcade: "Have fun with arcade games together.",
  Study: "Focus together in a quiet place.",
  "Work Together": "Work side by side in a cafe or shared space.",
  "Book Talk": "Read or talk about books together.",
  "Photo Walk": "Walk around and take photos together.",
};

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

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
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const qName = params.get("name");
    const qLocation = params.get("location");
    const qLat = params.get("lat");
    const qLng = params.get("lng");

    if (qLocation && qLat && qLng) {
      setPlaceName(qName || qLocation);
      setLocation(qLocation);
      setLatitude(Number(qLat));
      setLongitude(Number(qLng));
      setLocationConfirmed(true);
      setMessage("");
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initAutocomplete = () => {
      if (
        !window.google ||
        !window.google.maps ||
        !window.google.maps.places ||
        !searchInputRef.current
      ) {
        return false;
      }

      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      if (!autocompleteRef.current) {
        autocompleteRef.current =
          new window.google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ["formatted_address", "name", "geometry"],
          });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          const formattedAddress =
            place?.formatted_address || place?.name || "";
          const selectedName = place?.name || formattedAddress;
          const lat = place?.geometry?.location?.lat?.();
          const lng = place?.geometry?.location?.lng?.();

          if (
            !formattedAddress ||
            typeof lat !== "number" ||
            typeof lng !== "number"
          ) {
            setLocationConfirmed(false);
            return;
          }

          setPlaceName(selectedName);
          setLocation(formattedAddress);
          setLatitude(lat);
          setLongitude(lng);
          setLocationConfirmed(true);
          setMessage("");
        });
      }

      return true;
    };

    if (!initAutocomplete()) {
      interval = setInterval(() => {
        if (initAutocomplete()) {
          clearInterval(interval);
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
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
    router.push("/write/location?returnTo=/write");
  };

  const handleCreatePost = async () => {
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

  const fieldClass =
    "w-full rounded-[20px] border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#b8a591]";

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-4">
        <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm sm:p-7">
          <h1 className="text-3xl font-bold tracking-[-0.02em] text-[#2f2a26] sm:text-4xl">
            Create Meetup
          </h1>

          <p className="mt-2 text-sm text-[#8a7f74]">
            Pick a purpose, set the time, and choose one exact place.
          </p>

          <div className="mt-7 space-y-6">
            <section>
              <div className="mb-3 text-sm font-medium text-[#6b5f52]">
                Purpose
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PURPOSE_OPTIONS.map((item) => {
                  const isSelected = meetingPurpose === item.value;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setMeetingPurpose(item.value)}
                      className={`rounded-[20px] border px-4 py-4 text-left transition ${
                        isSelected
                          ? "border-[#a48f7a] bg-[#a48f7a] text-white shadow-sm"
                          : "border-[#e7ddd2] bg-[#fcfaf7] text-[#5f5449] hover:bg-[#f6f1ea]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className={`h-4 w-4 ${
                            isSelected ? "text-white" : "text-[#7b7067]"
                          }`}
                        />
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 rounded-[20px] border border-[#e7ddd2] bg-[#f8f3ed] px-4 py-3 text-sm text-[#6b5f52]">
                <div className="flex items-start gap-2">
                  {selectedPurpose ? (
                    <selectedPurpose.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                  )}
                  <span>{purposeHelpText}</span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="text-sm font-medium text-[#6b5f52]">
                Meetup Details
              </div>

              <input
                type="datetime-local"
                className="sr-only"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                id="hidden-datetime-input"
              />

              <div
                onClick={() => {
                  const input = document.getElementById(
                    "hidden-datetime-input"
                  ) as HTMLInputElement | null;
                  if (input) input.showPicker ? input.showPicker() : input.click();
                }}
                className={`${fieldClass} flex cursor-pointer items-center gap-2`}
              >
                <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                <span>
                  {meetingTime && new Date(meetingTime).toLocaleString()}
                </span>
              </div>

              <div className="relative">
                <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
                <select
                  className={`${fieldClass} appearance-none pl-11`}
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
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
                  <input
                    ref={searchInputRef}
                    className={`${fieldClass} pl-11`}
                    placeholder="Search exact place or address"
                    value={location}
                    onChange={handleLocationInputChange}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleOpenMapPicker}
                  aria-label="Pick on map"
                  title="Pick on map"
                  className="inline-flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-[20px] border border-[#dccfc2] bg-[#f8f3ed] text-[#5a5149] transition hover:bg-[#f1e8de]"
                >
                  <Map className="h-5 w-5" />
                </button>
              </div>

              {location && (
                <div className="rounded-[20px] border border-[#e7ddd2] bg-[#f8f3ed] px-4 py-3 text-sm text-[#6b5f52]">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <div className="min-w-0">
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
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="text-sm font-medium text-[#6b5f52]">
                Target & Benefit
              </div>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
                <select
                  className={`${fieldClass} appearance-none pl-11`}
                  value={targetGender}
                  onChange={(e) => setTargetGender(e.target.value)}
                >
                  <option value="">Select target gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
                <select
                  className={`${fieldClass} appearance-none pl-11`}
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
              </div>

              <div className="relative">
                <Coins className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a7f74]" />
                <select
                  className={`${fieldClass} appearance-none pl-11`}
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
            </section>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={handleCreatePost}
              disabled={loading || !userId}
              className="rounded-full bg-[#a48f7a] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Meetup"}
            </button>
          </div>

          {message && (
            <p className="mt-5 rounded-[20px] border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
