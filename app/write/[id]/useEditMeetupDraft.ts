"use client";

import { useEffect, useState } from "react";

type EditMeetupDraft = {
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

type UseEditMeetupDraftParams = {
  postId: string;
  draft: EditMeetupDraft;
  applyDraft: (draft: Partial<EditMeetupDraft>) => void;
  applyMapSelection: (selection: {
    placeName: string;
    address: string;
    latitude: number;
    longitude: number;
  }) => void;
};

const getDraftKey = (postId: string) => `neonadri:edit-meetup-draft:${postId}`;
const getReturnKey = (postId: string) =>
  `neonadri:edit-meetup-restore-once:${postId}`;

export function useEditMeetupDraft({
  postId,
  draft,
  applyDraft,
  applyMapSelection,
}: UseEditMeetupDraftParams) {
  const [draftReady, setDraftReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const draftKey = getDraftKey(postId);
    const returnKey = getReturnKey(postId);
    const params = new URLSearchParams(window.location.search);
    const savedDraft = window.sessionStorage.getItem(draftKey);
    const shouldRestoreDraft =
      params.has("location") || window.sessionStorage.getItem(returnKey) === "1";

    if (!shouldRestoreDraft) {
      window.sessionStorage.removeItem(draftKey);
      window.sessionStorage.removeItem(returnKey);
      setDraftReady(true);
      return;
    }

    window.sessionStorage.removeItem(returnKey);

    if (savedDraft) {
      try {
        applyDraft(JSON.parse(savedDraft));
      } catch {
        window.sessionStorage.removeItem(draftKey);
      }
    }

    setDraftReady(true);
  }, [applyDraft, postId]);

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
        nextQuery ? `/write/${postId}?${nextQuery}` : `/write/${postId}`
      );
    }
  }, [applyMapSelection, postId]);

  useEffect(() => {
    if (typeof window === "undefined" || !draftReady) return;
    window.sessionStorage.setItem(getDraftKey(postId), JSON.stringify(draft));
  }, [draft, draftReady, postId]);

  const markReturnFromMap = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(getReturnKey(postId), "1");
    window.sessionStorage.setItem(getDraftKey(postId), JSON.stringify(draft));
  };

  const clearDraft = () => {
    if (typeof window === "undefined") return;
    window.sessionStorage.removeItem(getDraftKey(postId));
    window.sessionStorage.removeItem(getReturnKey(postId));
  };

  return {
    draftReady,
    markReturnFromMap,
    clearDraft,
  };
}
