"use client";

import { useEffect, useMemo, useState } from "react";
import { LocateFixed } from "lucide-react";
import { useDistanceUnit } from "../../useDistanceUnit";
import { APP_MUTED_TEXT_CLASS, APP_SOFT_CARD_CLASS, APP_SUBTLE_TEXT_CLASS } from "../../designSystem";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km: number, unit: "mi" | "km") {
  if (!Number.isFinite(km)) return "";
  if (unit === "mi") {
    const miles = km * 0.621371;
    if (miles < 0.2) return `About ${(miles * 5280).toFixed(0)} ft away`;
    return `About ${miles.toFixed(1)} mi away`;
  }
  if (km < 1) return `About ${(km * 1000).toFixed(0)} m away`;
  return `About ${km.toFixed(1)} km away`;
}

export default function PostDistanceNote({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const { distanceUnit } = useDistanceUnit();
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (latitude === null || longitude === null) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setUserLocation(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [latitude, longitude]);

  const distanceText = useMemo(() => {
    if (!userLocation || latitude === null || longitude === null) return "";

    return formatDistance(
      haversineKm(userLocation.lat, userLocation.lng, latitude, longitude),
      distanceUnit
    );
  }, [distanceUnit, latitude, longitude, userLocation]);

  if (!distanceText) return null;

  return (
    <div className={`mt-3 rounded-[16px] px-3 py-2.5 ${APP_SOFT_CARD_CLASS}`}>
      <div className={`flex items-start gap-2 text-sm ${APP_MUTED_TEXT_CLASS}`}>
        <LocateFixed className="mt-0.5 h-4 w-4 shrink-0 text-[#71828c]" />
        <div>
          <div className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${APP_SUBTLE_TEXT_CLASS}`}>
            Near you
          </div>
          <div className="mt-1">{distanceText}</div>
        </div>
      </div>
    </div>
  );
}
