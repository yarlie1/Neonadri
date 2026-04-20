"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Map,
  MapPin,
  Clock,
  User,
  Coins,
  CheckCircle,
} from "lucide-react";
import { useCreateMeetupDraft } from "./useCreateMeetupDraft";
import {
  combineDateAndTime,
  getDatePart,
  getDefaultMeetingTime,
  getTimePart,
  PURPOSE_HELP_TEXT,
  PURPOSE_OPTIONS,
} from "./meetupFormShared";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_INNER_PANEL_CLASS,
  APP_MUTED_TEXT_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

declare global {
  interface Window {
    google: any;
  }
}

export default function WriteForm({ userId }: { userId: string }) {
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const [meetingPurpose, setMeetingPurpose] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTimeSlot, setMeetingTimeSlot] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [location, setLocation] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [confirmedAddress, setConfirmedAddress] = useState("");
  const [targetGender, setTargetGender] = useState("");
  const [targetAgeGroup, setTargetAgeGroup] = useState("");
  const [benefitAmount, setBenefitAmount] = useState("");
  const [benefitConfirmed, setBenefitConfirmed] = useState(false);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationConfirmed, setLocationConfirmed] = useState(false);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const fieldClass =
    "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] px-4 py-3 pl-12 text-sm text-[#24323f] outline-none transition focus:border-[#c3cfd7] focus:ring-4 focus:ring-[#cfd8de]/35";

  const applyDraft = useCallback(
    (draft: {
      meetingPurpose?: string;
      meetingTime?: string;
      meetingDate?: string;
      meetingTimeSlot?: string;
      durationMinutes?: string;
      location?: string;
      placeName?: string;
      confirmedAddress?: string;
      targetGender?: string;
      targetAgeGroup?: string;
      benefitAmount?: string;
      latitude?: number | null;
      longitude?: number | null;
      locationConfirmed?: boolean;
    }) => {
      setMeetingPurpose(draft.meetingPurpose || "");
      setMeetingTime(draft.meetingTime || "");
      setMeetingDate(draft.meetingDate || "");
      setMeetingTimeSlot(draft.meetingTimeSlot || "");
      setDurationMinutes(draft.durationMinutes || "");
      setLocation(draft.location || "");
      setPlaceName(draft.placeName || "");
      setConfirmedAddress(draft.confirmedAddress || "");
      setTargetGender(draft.targetGender || "");
      setTargetAgeGroup(draft.targetAgeGroup || "");
      setBenefitAmount(draft.benefitAmount || "");
      setLatitude(typeof draft.latitude === "number" ? draft.latitude : null);
      setLongitude(typeof draft.longitude === "number" ? draft.longitude : null);
      setLocationConfirmed(Boolean(draft.locationConfirmed));
    },
    []
  );

  const applyMapSelection = useCallback(
    ({
      placeName: nextPlaceName,
      address,
      latitude: nextLat,
      longitude: nextLng,
    }: {
      placeName: string;
      address: string;
      latitude: number;
      longitude: number;
    }) => {
      setPlaceName(nextPlaceName);
      setLocation(nextPlaceName);
      setConfirmedAddress(address);
      setLatitude(nextLat);
      setLongitude(nextLng);
      setLocationConfirmed(true);
      setMessage("");
    },
    []
  );

  const draftState = useMemo(
    () => ({
      meetingPurpose,
      meetingTime,
      meetingDate,
      meetingTimeSlot,
      durationMinutes,
      location,
      placeName,
      confirmedAddress,
      targetGender,
      targetAgeGroup,
      benefitAmount,
      latitude,
      longitude,
      locationConfirmed,
    }),
    [
      benefitAmount,
      confirmedAddress,
      durationMinutes,
      latitude,
      location,
      locationConfirmed,
      longitude,
      meetingDate,
      meetingPurpose,
      meetingTime,
      meetingTimeSlot,
      placeName,
      targetAgeGroup,
      targetGender,
    ]
  );

  const { markReturnFromMap, clearDraft } = useCreateMeetupDraft({
    draft: draftState,
    applyDraft,
    applyMapSelection,
  });

  useEffect(() => {
    if (!meetingTime) {
      setMeetingTime(getDefaultMeetingTime());
    }
  }, [meetingTime]);

  useEffect(() => {
    setBenefitConfirmed(false);
  }, [benefitAmount]);

  useEffect(() => {
    if (!meetingTime) return;
    setMeetingDate(getDatePart(meetingTime));
    setMeetingTimeSlot(getTimePart(meetingTime));
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
          return;
        }

        setPlaceName(name);
        setLocation(name);
        setConfirmedAddress(address);
        setLatitude(nextLat);
        setLongitude(nextLng);
        setLocationConfirmed(true);
        setMessage("");
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

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPlaceName("");
    setLocation(e.target.value);
    setConfirmedAddress("");
    setLatitude(null);
    setLongitude(null);
    setLocationConfirmed(false);
  };

  const handleOpenMapPicker = () => {
    markReturnFromMap();
    router.push("/write/location?returnTo=/write");
  };

  const handleMeetingDateChange = (value: string) => {
    setMeetingDate(value);
    setMeetingTime(combineDateAndTime(value, meetingTimeSlot || "00:00"));
  };

  const handleMeetingTimeSlotChange = (value: string) => {
    setMeetingTimeSlot(value);
    setMeetingTime(combineDateAndTime(meetingDate, value));
  };

  const handleCreate = async () => {
    setMessage("");
    if (!userId) {
      setMessage("Please sign in first.");
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
      return;
    }

    if (
      !location.trim() ||
      !confirmedAddress.trim() ||
      latitude === null ||
      longitude === null ||
      !locationConfirmed
    ) {
      setMessage(
        "Please choose one exact location from the dropdown or map picker."
      );
      return;
    }

    if (benefitAmount && !benefitConfirmed) {
      setMessage("Please confirm the host payment note before creating the meetup.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        place_name: placeName || location,
        location: confirmedAddress || location,
        meeting_time: meetingTime,
        duration_minutes: Number(durationMinutes),
        target_gender: targetGender,
        target_age_group: targetAgeGroup,
        meeting_purpose: meetingPurpose,
        benefit_amount: benefitAmount,
        latitude,
        longitude,
      };

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
        return;
      }

      clearDraft();
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      setSaving(false);
      setMessage(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <main className={`min-h-screen overflow-x-hidden ${APP_PAGE_BG_CLASS} px-4 py-5`}>
      <div className="mx-auto max-w-2xl space-y-4">
        <section className={`relative overflow-hidden ${APP_SURFACE_CARD_CLASS} px-5 py-6 sm:px-6 sm:py-7`}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/42 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#cfd8de]/35 blur-2xl" />
          <div className="relative">
            <div className={`inline-flex items-center rounded-full ${APP_INNER_PANEL_CLASS} px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7b84]`}>
              Create meetup
            </div>
            <h1 className="mt-4 max-w-md text-[32px] font-black leading-[0.98] tracking-[-0.05em] text-[#24323f] sm:text-[38px]">
              Make the first step feel easy.
            </h1>
            <p className={`mt-3 max-w-lg text-sm leading-6 sm:text-[15px] ${APP_MUTED_TEXT_CLASS}`}>
              Pick a vibe, set a clear place and time, and give people enough context to say yes without hesitation.
            </p>
          </div>
        </section>

        <div className={`${APP_SURFACE_CARD_CLASS} p-4 sm:p-6`}>
        <div className="flex items-start gap-4">
          <div>
            <div className={APP_EYEBROW_CLASS}>
              New post
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323f]">
              Create your meetup
            </h2>
          </div>
        </div>

        <div className={`mt-4 flex items-start gap-2 ${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm ${APP_MUTED_TEXT_CLASS}`}>
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {meetingPurpose
              ? PURPOSE_HELP_TEXT[meetingPurpose] ||
                "Select details to create your meetup."
              : "Select details to create your meetup."}
          </p>
        </div>

        <div className="mt-6">
          <h2 className={`mb-3 text-sm font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
                  className={`flex min-h-[52px] items-center gap-2 rounded-[20px] border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? `${APP_BUTTON_PRIMARY_CLASS} border-transparent`
                      : "border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] text-[#52616a] hover:bg-[#f5f8fa]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <h2 className={`mt-6 text-sm font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
          Meetup Details
        </h2>

        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="flex overflow-hidden rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] focus-within:border-[#c3cfd7] focus-within:ring-4 focus-within:ring-[#cfd8de]/35">
              <div className="flex h-[50px] w-12 shrink-0 items-center justify-center text-[#71828c]">
                <Clock className="h-4 w-4" />
              </div>
              <input
                type="date"
                className="h-[50px] w-full min-w-0 appearance-none !border-0 bg-transparent !px-4 !py-0 text-sm text-[#24323f] !shadow-none !outline-none !ring-0"
                value={meetingDate}
                onChange={(e) => handleMeetingDateChange(e.target.value)}
              />
            </div>

            <div className="flex overflow-hidden rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] focus-within:border-[#c3cfd7] focus-within:ring-4 focus-within:ring-[#cfd8de]/35">
              <div className="flex h-[50px] w-12 shrink-0 items-center justify-center text-[#71828c]">
                <Clock className="h-4 w-4" />
              </div>
              <select
                className="h-[50px] w-full min-w-0 bg-transparent px-4 pr-10 text-sm text-[#24323f] outline-none"
                value={meetingTimeSlot}
                onChange={(e) => handleMeetingTimeSlotChange(e.target.value)}
              >
                <option value="">Select time</option>
                {Array.from({ length: 48 }, (_, index) => {
                  const hours = String(Math.floor(index / 2)).padStart(2, "0");
                  const minutes = index % 2 === 0 ? "00" : "30";
                  const value = `${hours}:${minutes}`;
                  return (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex overflow-hidden rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] focus-within:border-[#c3cfd7] focus-within:ring-4 focus-within:ring-[#cfd8de]/35">
            <div className="flex h-[50px] w-12 shrink-0 items-center justify-center text-[#71828c]">
              <Clock className="h-4 w-4" />
            </div>
            <select
              className="h-[50px] w-full min-w-0 bg-transparent px-4 pr-10 text-sm text-[#24323f] outline-none"
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
            <div className="flex flex-1 overflow-hidden rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] focus-within:border-[#c3cfd7] focus-within:ring-4 focus-within:ring-[#cfd8de]/35">
              <div className="flex h-[50px] w-12 shrink-0 items-center justify-center text-[#71828c]">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                ref={searchInputRef}
                className="h-[50px] w-full min-w-0 appearance-none !border-0 bg-transparent !px-4 !py-0 pr-5 text-sm text-[#24323f] !shadow-none !outline-none !ring-0"
                placeholder="Search exact place or address"
                value={location}
                onChange={handleLocationInputChange}
                autoComplete="off"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenMapPicker}
              className={`inline-flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[18px] ${APP_BUTTON_SECONDARY_CLASS} transition`}
              aria-label="Pick on map"
              title="Pick on map"
            >
              <Map className="h-[18px] w-[18px]" strokeWidth={2.2} />
            </button>
          </div>

          {location && (
            <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm ${APP_MUTED_TEXT_CLASS}`}>
              <p className="font-medium text-[#24323f]">
                {placeName || location}
              </p>
              <p className="mt-1 break-words">{confirmedAddress || location}</p>

              {latitude !== null && longitude !== null && (
                <p className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
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

        <h2 className={`mt-6 text-sm font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
          Target & Benefit
        </h2>

        <div className="mt-3 space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-4 h-4 w-4 text-[#71828c]" />
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
            <User className="absolute left-4 top-4 h-4 w-4 text-[#71828c]" />
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
            <Coins className="absolute left-4 top-4 h-4 w-4 text-[#71828c]" />
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

          {benefitAmount && (
            <label
              className={`${APP_SOFT_CARD_CLASS} grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 px-4 py-3 text-sm ${APP_MUTED_TEXT_CLASS}`}
            >
              <input
                type="checkbox"
                checked={benefitConfirmed}
                onChange={(e) => setBenefitConfirmed(e.target.checked)}
                className="!mt-0.5 !h-4 !w-4 !appearance-auto !rounded !border-[#c7d2d9] !p-0 !shadow-none !outline-none !ring-0 accent-[#8fa1ac]"
              />
              <span className="min-w-0 flex-1 leading-6">
                I understand that I will pay{" "}
                <span className="font-semibold text-[#24323f]">{benefitAmount}</span>{" "}
                directly to my guest after the meetup.
              </span>
            </label>
          )}
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={saving || (!!benefitAmount && !benefitConfirmed)}
          className={`mt-6 w-full rounded-[24px] ${APP_BUTTON_PRIMARY_CLASS} py-4 text-base font-semibold disabled:opacity-50`}
        >
          {saving ? "Creating..." : "Create Meetup"}
        </button>

        {message && (
          <p className="mt-4 rounded-[20px] border border-[#e8cfd3] bg-[#fff6f7] px-4 py-3 text-sm text-[#b44f5b]">
            {message}
          </p>
        )}

        </div>
      </div>
    </main>
  );
}
