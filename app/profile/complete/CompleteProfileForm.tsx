"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { DISPLAY_NAME_MAX_LENGTH } from "../../../lib/displayName";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SUBTLE_TEXT_CLASS,
} from "../../designSystem";

const INPUT_CLASS =
  "w-full rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]";

export default function CompleteProfileForm({
  initialDisplayName,
  initialGender,
  initialAgeGroup,
  initialAdultConfirmed,
  nextPath,
}: {
  initialDisplayName: string;
  initialGender: string;
  initialAgeGroup: string;
  initialAdultConfirmed: boolean;
  nextPath: string;
}) {
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [gender, setGender] = useState(initialGender);
  const [ageGroup, setAgeGroup] = useState(initialAgeGroup);
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(initialAdultConfirmed);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const normalizedDisplayName = displayName.trim().replace(/\s+/g, " ");
  const canSubmit =
    normalizedDisplayName.length > 0 &&
    normalizedDisplayName.length <= DISPLAY_NAME_MAX_LENGTH &&
    gender.trim() &&
    ageGroup.trim() &&
    isAdultConfirmed;

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch("/api/profile/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          display_name: normalizedDisplayName,
          gender,
          age_group: ageGroup,
          is_adult_confirmed: isAdultConfirmed,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error || "We couldn't complete your profile.");
        return;
      }

      window.location.replace(nextPath);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[#333333]">
          Display name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          placeholder="How others will see you"
          className={INPUT_CLASS}
        />
        <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
          {normalizedDisplayName.length}/{DISPLAY_NAME_MAX_LENGTH}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#333333]">
            Gender
          </label>
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#333333]">
            Age group
          </label>
          <select
            value={ageGroup}
            onChange={(event) => setAgeGroup(event.target.value)}
            className={INPUT_CLASS}
          >
            <option value="">Select age group</option>
            <option value="20s">20s</option>
            <option value="30s">30s</option>
            <option value="40s">40s</option>
            <option value="50s+">50s+</option>
          </select>
        </div>
      </div>

      <label className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 rounded-[8px] border border-[#111111] bg-white px-4 py-4 text-sm text-[#55636b] shadow-none">
        <input
          type="checkbox"
          checked={isAdultConfirmed}
          onChange={(event) => setIsAdultConfirmed(event.target.checked)}
          className="!mt-0.5 !h-4 !w-4 !appearance-auto !rounded !border-[#111111] !p-0 !shadow-none !outline-none !ring-0 accent-[#8fa1ac]"
        />
        <span className="leading-6">
          I confirm that I am 18 or older and understand that Neonadri is for adults only.
        </span>
      </label>

      {!canSubmit ? (
        <p className={`text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
          Add a display name and complete all required fields to continue.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`inline-flex items-center gap-2 rounded-[8px] border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {submitting ? "Saving..." : "Save and continue"}
        </button>

        <a
          href="/api/auth/logout?redirect=%2Flogin"
          className={`rounded-[8px] px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
        >
          Log out
        </a>
      </div>

      {message ? (
        <p className={`rounded-[8px] px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
