"use client";

import { useEffect, useState } from "react";

const CREATE_DRAFT_KEY = "neonadri:create-meetup-draft";
const CREATE_DRAFT_RETURN_KEY = "neonadri:create-meetup-restore-once";

type CreateMeetupDraft = {
  meetingPurpose: string;
  meetingTime: string;
  meetingDate: string;
  meetingTimeSlot: string;
  durationMinutes: string;
  location: string;
  placeName: string;
  confirmedAddress: string;
  targetGender: string;
  targetAgeGroup: string;
  benefitAmount: string;
  latitude: number | null;
  longitude: number | null;
  locationConfirmed: boolean;
};

type UseCreateMeetupDraftParams = {
  draft: CreateMeetupDraft;
  applyDraft: (draft: Partial<CreateMeetupDraft>) => void;
  applyMapSelection: (selection: {
    placeName: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
};

export function useCreateMeetupDraft({
  draft,
  applyDraft,
  applyMapSelection,
}: UseCreateMeetupDraftParams) {
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const savedDraft = window.sessionStorage.getItem(CREATE_DRAFT_KEY);
    const shouldRestoreDraft =
      params.has("location") ||
      window.sessionStorage.getItem(CREATE_DRAFT_RETURN_KEY) === "1";

    if (!shouldRestoreDraft) {
      window.sessionStorage.removeItem(CREATE_DRAFT_KEY);
      window.sessionStorage.removeItem(CREATE_DRAFT_RETURN_KEY);
      setDraftReady(true);
      return;
    }

    window.sessionStorage.removeItem(CREATE_DRAFT_RETURN_KEY);

    if (savedDraft) {
      try {
        applyDraft(JSON.parse(savedDraft));
      } catch {
        window.sessionStorage.removeItem(CREATE_DRAFT_KEY);
      }
    }

    setDraftReady(true);
  }, [applyDraft]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = new URLSearchParams(window.location.search);
    const qName = query.get("name");
    const qLocation = query.get("location");
    const qLat = query.get("lat");
    const qLng = query.get("lng");

    if (qLocation && qLat && qLng) {
      applyMapSelection({
        placeName: qName || qLocation,
        address: qLocation,
        latitude: Number(qLat),
        longitude: Number(qLng),
      });

      query.delete("name");
      query.delete("location");
      query.delete("lat");
      query.delete("lng");
      const nextQuery = query.toString();
      window.history.replaceState(
        {},
        "",
        nextQuery ? `/write?${nextQuery}` : "/write"
      );
    }
  }, [applyMapSelection]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftReady) return;
    window.sessionStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(draft));
  }, [draft, draftReady]);

  const markReturnFromMap = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(CREATE_DRAFT_RETURN_KEY, "1");
    window.sessionStorage.setItem(CREATE_DRAFT_KEY, JSON.stringify(draft));
  };

  const clearDraft = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(CREATE_DRAFT_KEY);
    window.sessionStorage.removeItem(CREATE_DRAFT_RETURN_KEY);
  };

  return {
    draftReady,
    markReturnFromMap,
    clearDraft,
  };
}
