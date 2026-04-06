"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useParams, useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

export default function EditMeetupPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [userId, setUserId] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [location, setLocation] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [targetAgeGroup, setTargetAgeGroup] = useState("");
  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [benefitAmount, setBenefitAmount] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
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
          "id, user_id, place_name, location, meeting_time, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
        )
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setMessage("Could not load this meetup.");
        setLoading(false);
        return;
      }

      setPlaceName(data.place_name || "");
      setLocation(data.location || "");
      setMeetingTime(
        data.meeting_time
          ? new Date(data.meeting_time).toISOString().slice(0, 16)
          : ""
      );
      setTargetGender(data.target_gender || "");
      setTargetAgeGroup(data.target_age_group || "");
      setMeetingPurpose(data.meeting_purpose || "");
      setBenefitAmount(data.benefit_amount || "");
      setLatitude(data.latitude);
      setLongitude(data.longitude);
      setLocationConfirmed(
        data.location !== null &&
          data.latitude !== null &&
          data.longitude !== null
      );
      setLoading(false);
    };

    loadPost();
  }, [params.id, router, supabase]);

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
        if (initAutocomplete()) clearInterval(interval);
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

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPlaceName("");
    setLocation(e.target.value);
    setLatitude(null);
    setLongitude(null);
    setLocationConfirmed(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported on this device.");
      return;
    }

    setMessage("");
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results: any, status: string) => {
              setLocating(false);

              if (status === "OK" && results && results[0]) {
                const address = results[0].formatted_address;
                setPlaceName("Current Location");
                setLocation(address);
                setLatitude(lat);
                setLongitude(lng);
                setLocationConfirmed(true);
                setMessage("");
              } else {
                setMessage("Could not convert your location to an address.");
              }
            }
          );
        } else {
          setLocating(false);
          setMessage("Map service is still loading. Please try again.");
        }
      },
      () => {
        setLocating(false);
        setMessage("Could not get your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleOpenMapPicker = () => {
    router.push(`/write/location`);
  };

  const handleSave = async () => {
    setMessage("");

    if (
      !meetingTime.trim() ||
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
        "Please choose one exact location from the dropdown or current location."
      );
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("posts")
      .update({
        place_name: placeName || location,
        location,
        meeting_time: new Date(meetingTime).toISOString(),
        target_gender: targetGender,
        target_age_group: targetAgeGroup,
        meeting_purpose: meetingPurpose,
        benefit_amount: benefitAmount,
        latitude,
        longitude,
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
      <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center shadow-sm">
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

        <p className="mt-3 text-sm leading-7 text-[#6f655c]">
          Update your meetup details.
        </p>

        <div className="mt-8 space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="rounded-2xl bg-[#6b5f52] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046] disabled:opacity-50"
            >
              {locating ? "Finding..." : "Use Current Location"}
            </button>

            <button
              type="button"
              onClick={handleOpenMapPicker}
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              Pick on Map
            </button>
          </div>

          <input
            ref={searchInputRef}
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            placeholder="Search exact place or address"
            value={location}
            onChange={handleLocationInputChange}
          />

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
            </div>
          )}

          <input
            type="datetime-local"
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            value={meetingTime}
            onChange={(e) => setMeetingTime(e.target.value)}
          />

          <select
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            value={meetingPurpose}
            onChange={(e) => setMeetingPurpose(e.target.value)}
          >
            <option value="">Select meeting purpose</option>
            <option value="Coffee">Coffee</option>
            <option value="Meal">Meal</option>
            <option value="Conversation">Conversation</option>
            <option value="Dating">Dating</option>
            <option value="Friendship">Friendship</option>
            <option value="Networking">Networking</option>
            <option value="Study">Study</option>
            <option value="Walk">Walk</option>
            <option value="Drinks">Drinks</option>
            <option value="Other">Other</option>
          </select>

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
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <a
            href="/dashboard"
            className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
          >
            Cancel
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