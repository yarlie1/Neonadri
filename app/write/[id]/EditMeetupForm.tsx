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
  Check,
} from "lucide-react";
import { useEditMeetupDraft } from "./useEditMeetupDraft";
import {
  combineDateAndTime,
  formatDateTimeLocalValue,
  getDatePart,
  getDefaultMeetingTime,
  getTimePart,
  PURPOSE_HELP_TEXT,
  PURPOSE_OPTIONS,
} from "../meetupFormShared";
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
} from "../../designSystem";

declare global {
  interface Window {
    google: any;
  }
}

type EditMeetupFormProps = {
  postId: string;
  userId: string;
  initialPost: {
    meeting_purpose: string | null;
    meeting_time: string | null;
    duration_minutes: number | null;
    location: string | null;
    place_name: string | null;
    latitude: number | null;
    longitude: number | null;
    target_gender: string | null;
    target_age_group: string | null;
    benefit_amount: string | null;
  };
};

export default function EditMeetupForm({
  postId,
  userId,
  initialPost,
}: EditMeetupFormProps) {
  const router = useRouter();

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);

  const initialMeetingTime = initialPost.meeting_time
    ? formatDateTimeLocalValue(new Date(initialPost.meeting_time))
    : getDefaultMeetingTime();

  const [meetingPurpose, setMeetingPurpose] = useState(
    initialPost.meeting_purpose || ""
  );
  const [meetingTime, setMeetingTime] = useState(initialMeetingTime);
  const [meetingDate, setMeetingDate] = useState(getDatePart(initialMeetingTime));
  const [meetingTimeSlot, setMeetingTimeSlot] = useState(
    getTimePart(initialMeetingTime)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    initialPost.duration_minutes ? String(initialPost.duration_minutes) : ""
  );
  const [location, setLocation] = useState(initialPost.location || "");
  const [placeName, setPlaceName] = useState(initialPost.place_name || "");
  const [confirmedAddress, setConfirmedAddress] = useState(
    initialPost.location || ""
  );
  const [targetGender, setTargetGender] = useState(
    initialPost.target_gender || ""
  );
  const [targetAgeGroup, setTargetAgeGroup] = useState(
    initialPost.target_age_group || ""
  );
  const [benefitAmount, setBenefitAmount] = useState(
    initialPost.benefit_amount || ""
  );
  const [benefitConfirmed, setBenefitConfirmed] = useState(
    !!initialPost.benefit_amount
  );
  const [latitude, setLatitude] = useState(initialPost.latitude ?? null);
  const [longitude, setLongitude] = useState(initialPost.longitude ?? null);
  const [locationConfirmed, setLocationConfirmed] = useState(
    !!initialPost.location &&
      initialPost.latitude !== null &&
      initialPost.longitude !== null
  );

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const fieldClass =
    "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] px-4 py-3 pl-16 text-sm text-[#24323f] outline-none transition focus:border-[#c3cfd7] focus:ring-4 focus:ring-[#cfd8de]/35";

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

  const { markReturnFromMap, clearDraft } = useEditMeetupDraft({
    postId,
    draft: draftState,
    applyDraft,
    applyMapSelection,
  });

  useEffect(() => {
    if (!meetingTime) return;
    setMeetingDate(getDatePart(meetingTime));
    setMeetingTimeSlot(getTimePart(meetingTime));
  }, [meetingTime]);

  useEffect(() => {
    setBenefitConfirmed(!!benefitAmount && benefitAmount === (initialPost.benefit_amount || ""));
  }, [benefitAmount, initialPost.benefit_amount]);

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
        setLocation(name);
        setConfirmedAddress(address);
        setLatitude(nextLat);
        setLongitude(nextLng);
        setLocationConfirmed(true);
        setMessage("");
      });
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
    setConfirmedAddress("");
    setLatitude(null);
    setLongitude(null);
    setLocationConfirmed(false);
  };

  const handleOpenMapPicker = () => {
    markReturnFromMap();
    router.push(`/write/location?returnTo=/write/${postId}`);
  };

  const handleMeetingDateChange = (value: string) => {
    setMeetingDate(value);
    setMeetingTime(combineDateAndTime(value, meetingTimeSlot || "00:00"));
  };

  const handleMeetingTimeSlotChange = (value: string) => {
    setMeetingTimeSlot(value);
    setMeetingTime(combineDateAndTime(meetingDate, value));
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
      setMessage("Please confirm the cost support note before saving the meetup.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/posts/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          user_id: userId,
          meeting_purpose: meetingPurpose,
          meeting_time: meetingTime,
          duration_minutes: Number(durationMinutes),
          location: confirmedAddress || location,
          place_name: placeName || location,
          latitude,
          longitude,
          target_gender: targetGender,
          target_age_group: targetAgeGroup,
          benefit_amount: benefitAmount,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(result?.error || "Failed to save meetup.");
        setSaving(false);
        return;
      }

      clearDraft();
      window.location.replace(`/posts/${postId}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save meetup."
      );
      setSaving(false);
    }
  };

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-5 py-6`}>
      <div className="mx-auto max-w-2xl space-y-4">
        <section className={`relative overflow-hidden ${APP_SURFACE_CARD_CLASS} px-5 py-6 sm:px-6 sm:py-7`}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/42 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#cfd8de]/35 blur-2xl" />
          <div className="relative">
            <div className={`inline-flex items-center rounded-full ${APP_INNER_PANEL_CLASS} px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b7b84]`}>
              Edit meetup
            </div>
            <h1 className="mt-4 max-w-md text-[32px] font-black leading-[0.98] tracking-[-0.05em] text-[#24323f] sm:text-[38px]">
              Refine the plan without losing the vibe.
            </h1>
            <p className={`mt-3 max-w-lg text-sm leading-6 sm:text-[15px] ${APP_MUTED_TEXT_CLASS}`}>
              Update the details, keep the tone clear, and make sure the meetup still feels easy to say yes to.
            </p>
          </div>
        </section>

        <div className={`${APP_SURFACE_CARD_CLASS} p-6`}>
          <div className="flex items-start gap-4">
          <div>
            <div className={APP_EYEBROW_CLASS}>
              Edit post
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323f]">
              Update your meetup
            </h2>
          </div>
        </div>

        <div className={`mt-4 flex items-start gap-2 ${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm ${APP_MUTED_TEXT_CLASS}`}>
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{purposeHelpText}</p>
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
                  className={`flex items-center gap-2 rounded-[20px] border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? `${APP_BUTTON_PRIMARY_CLASS} border-[#b9c7d0] ring-2 ring-[#c5d0d7]/60 shadow-[0_14px_24px_rgba(118,126,133,0.16)]`
                      : "border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] text-[#52616a] hover:bg-[#f5f8fa]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{item.value}</span>
                  {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
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
              <p className="mt-1">{confirmedAddress || location}</p>

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
          Target & Cost Support
        </h2>

        <div className="mt-3 space-y-3">
          <div className="relative">
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71828c]" />
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
            <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71828c]" />
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
            <Coins className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#71828c]" />
            <select
              className={`${fieldClass} pr-10`}
              value={benefitAmount}
              onChange={(e) => setBenefitAmount(e.target.value)}
            >
              <option value="">Select cost support</option>
              <option value="$0">$0</option>
              <option value="$10">$10</option>
              <option value="$20">$20</option>
              <option value="$30">$30</option>
              <option value="$50">$50</option>
              <option value="$100">$100</option>
              <option value="$200+">$200+</option>
            </select>
          </div>

          <div className={`${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm leading-6 ${APP_MUTED_TEXT_CLASS}`}>
            Use cost support only for direct meetup costs such as food, tickets, or transport. Do not offer money for attendance, time, or companionship.
          </div>

          {benefitAmount && (
            <label className={`grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 ${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm ${APP_MUTED_TEXT_CLASS}`}>
              <input
                type="checkbox"
                checked={benefitConfirmed}
                onChange={(e) => setBenefitConfirmed(e.target.checked)}
                className="!mt-0.5 !h-4 !w-4 !appearance-auto !rounded !border-[#c7d2d9] !p-0 !shadow-none !outline-none !ring-0 accent-[#8fa1ac]"
              />
              <span className="min-w-0 flex-1 leading-6">
                I understand that{" "}
                <span className="font-semibold text-[#24323f]">{benefitAmount}</span>{" "}
                is only for direct meetup costs, not for attendance, time, or companionship.
              </span>
            </label>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving || (!!benefitAmount && !benefitConfirmed)}
            className={`flex-1 rounded-full ${APP_BUTTON_PRIMARY_CLASS} py-4 text-base font-semibold disabled:opacity-50`}
          >
            {saving ? "Saving..." : "Save Meetup"}
          </button>

            <button
              type="button"
              onClick={() => router.push(`/posts/${postId}`)}
              className={`rounded-full ${APP_BUTTON_SECONDARY_CLASS} px-5 py-4 text-sm font-medium transition`}
            >
              Cancel
          </button>
        </div>

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
