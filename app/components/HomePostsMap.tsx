"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { MapPost } from "../map/page";
import { getPublicLocationLabel } from "../../lib/locationPrivacy";
import { Coins } from "lucide-react";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

declare global {
  interface Window {
    google: any;
  }
}

type Props = {
  posts: MapPost[];
};

type RadiusOption = "all" | 1 | 3 | 5 | 10;

function milesBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
}

const getPurposeIcon = (purpose: string | null) => {
  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return "\u2615";
    case "Meal":
      return "\ud83c\udf7d";
    case "Lunch":
      return "\u2600\ufe0f";
    case "Dinner":
      return "\ud83c\udf19";
    case "Dessert":
      return "\ud83c\udf70";
    case "Walk":
      return "\ud83d\udeb6";
    case "Jogging":
      return "\ud83c\udfc3";
    case "Yoga":
      return "\ud83e\uddd8";
    case "Movie":
    case "Theater":
      return "\ud83c\udfac";
    case "Karaoke":
      return "\ud83c\udfa4";
    case "Board Games":
      return "\ud83c\udfb2";
    case "Gaming":
      return "\ud83c\udfae";
    case "Bowling":
      return "\ud83c\udfb3";
    case "Arcade":
      return "\ud83c\udfaf";
    case "Study":
      return "\ud83d\udcda";
    case "Work Together":
    case "Work":
      return "\ud83d\udcbb";
    case "Book Talk":
    case "Book":
      return "\ud83d\udcd6";
    case "Photo Walk":
    case "Photo":
      return "\ud83d\udcf7";
    default:
      return "\u2728";
  }
};

const formatTime = (meetingTime: string | null) => {
  if (!meetingTime) return null;

  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const formatDuration = (minutes: number | null) => {
  if (!minutes) return null;
  if (minutes === 60) return "1H";
  if (minutes === 90) return "1.5H";
  if (minutes === 120) return "2H";
  return `${minutes}m`;
};

export default function HomePostsMap({ posts }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const myLocationMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  const [selectedPost, setSelectedPost] = useState<MapPost | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<RadiusOption>("all");
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);

  const filteredPosts = useMemo(() => {
    if (!myLocation || radius === "all") return posts;

    return posts.filter((post) => {
      const distance = milesBetween(
        myLocation.lat,
        myLocation.lng,
        post.latitude,
        post.longitude
      );
      return distance <= radius;
    });
  }, [posts, myLocation, radius]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initMap = () => {
      if (!window.google || !window.google.maps || !mapRef.current) {
        return false;
      }

      if (!mapInstanceRef.current) {
        const center =
          filteredPosts.length > 0
            ? { lat: filteredPosts[0].latitude, lng: filteredPosts[0].longitude }
            : { lat: 34.0522, lng: -118.2437 };

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 12,
          clickableIcons: false,
          gestureHandling: "greedy",
        });
      }

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      filteredPosts.forEach((post) => {
        const marker = new window.google.maps.Marker({
          position: { lat: post.latitude, lng: post.longitude },
          map: mapInstanceRef.current,
          title: post.place_name || post.location || "Meetup",
        });

        marker.addListener("click", () => {
          setSelectedPost(post);
          mapInstanceRef.current.panTo({
            lat: post.latitude,
            lng: post.longitude,
          });
        });

        markersRef.current.push(marker);
      });

      if (myLocation) {
        if (!myLocationMarkerRef.current) {
          myLocationMarkerRef.current = new window.google.maps.Marker({
            map: mapInstanceRef.current,
            title: "My Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
        }

        myLocationMarkerRef.current.setPosition(myLocation);
        myLocationMarkerRef.current.setMap(mapInstanceRef.current);

        if (circleRef.current) {
          circleRef.current.setMap(null);
          circleRef.current = null;
        }

        if (radius !== "all") {
          circleRef.current = new window.google.maps.Circle({
            map: mapInstanceRef.current,
            center: myLocation,
            radius: radius * 1609.34,
            fillColor: "#2563eb",
            fillOpacity: 0.08,
            strokeColor: "#2563eb",
            strokeOpacity: 0.35,
            strokeWeight: 1,
          });
        }

        mapInstanceRef.current.panTo(myLocation);
        mapInstanceRef.current.setZoom(radius === "all" ? 12 : 11);
      } else {
        if (myLocationMarkerRef.current) {
          myLocationMarkerRef.current.setMap(null);
        }
        if (circleRef.current) {
          circleRef.current.setMap(null);
          circleRef.current = null;
        }
      }

      if (
        selectedPost &&
        !filteredPosts.some((post) => post.id === selectedPost.id)
      ) {
        setSelectedPost(null);
      }

      return true;
    };

    if (!initMap()) {
      interval = setInterval(() => {
        if (initMap()) {
          clearInterval(interval);
        }
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
      markersRef.current.forEach((marker) => marker.setMap(null));
      if (myLocationMarkerRef.current) myLocationMarkerRef.current.setMap(null);
      if (circleRef.current) circleRef.current.setMap(null);
    };
  }, [filteredPosts, myLocation, radius, selectedPost]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Geolocation is not supported on this device.");
      return;
    }

    setLocating(true);
    setLocationMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        setMyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setLocationMessage("Could not get your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const badgeClass = (status: string | null) => {
    if (!status) return APP_PILL_INACTIVE_CLASS;

    const normalized = status.toLowerCase();

    if (normalized === "matched" || normalized === "accepted") {
      return APP_PILL_ACTIVE_CLASS;
    }

    if (normalized === "pending") {
      return APP_PILL_INACTIVE_CLASS;
    }

    if (normalized === "rejected") {
      return "border border-[#d8e1e7] bg-[linear-gradient(180deg,#f8fbfd_0%,#eef3f6_100%)] text-[#7a8790]";
    }

    return `border ${APP_PILL_INACTIVE_CLASS}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
        >
          {locating ? "Finding..." : "Use Current Location"}
        </button>

        {([1, 3, 5, 10] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRadius(value)}
            className={`rounded-xl px-4 py-2 text-sm transition ${
              radius === value
                ? APP_PILL_ACTIVE_CLASS
                : APP_PILL_INACTIVE_CLASS
            }`}
          >
            {value} mi
          </button>
        ))}

        <button
          type="button"
          onClick={() => setRadius("all")}
          className={`rounded-xl px-4 py-2 text-sm transition ${
            radius === "all"
              ? APP_PILL_ACTIVE_CLASS
              : APP_PILL_INACTIVE_CLASS
          }`}
        >
          All
        </button>

        <span className={`text-sm ${APP_SUBTLE_TEXT_CLASS}`}>
          Showing {filteredPosts.length} meetup{filteredPosts.length === 1 ? "" : "s"}
        </span>
      </div>

      {locationMessage && (
        <div className={`rounded-2xl px-4 py-3 text-sm ${APP_SOFT_CARD_CLASS} ${APP_BODY_TEXT_CLASS}`}>
          {locationMessage}
        </div>
      )}

      <div className="relative">
        <div ref={mapRef} className="h-[30rem] w-full rounded-[1.5rem]" />

        {selectedPost && (
          <div className={`absolute bottom-4 left-4 right-4 z-10 px-5 py-4 ${APP_SURFACE_CARD_CLASS}`}>
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className={`absolute right-3 top-3 text-sm ${APP_SUBTLE_TEXT_CLASS}`}
            >
              Close</button>

            <div className="flex items-start justify-between gap-4 pr-6">
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold text-[#26343d]">
                  {getPurposeIcon(selectedPost.meeting_purpose)}{" "}
                  {selectedPost.meeting_purpose || "Meetup"} ·{" "}
                  {formatDuration(selectedPost.duration_minutes)}
                </div>

                <div className="mt-1 truncate text-lg font-semibold text-[#1f2e38]">
                  {selectedPost.place_name ||
                    getPublicLocationLabel(
                      selectedPost.place_name,
                      selectedPost.location
                    ) ||
                    "Meetup"}
                </div>
              </div>

                {selectedPost.benefit_amount && (
                  <div className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${APP_PILL_ACTIVE_CLASS}`}>
                    <Coins className="h-4 w-4" />
                    {selectedPost.benefit_amount}
                  </div>
                )}
            </div>

            <div className="mt-3">
              {selectedPost.meeting_time && (
                <div className={`text-sm ${APP_BODY_TEXT_CLASS}`}>
                  Time: {formatTime(selectedPost.meeting_time)}
                </div>
              )}

              {selectedPost.location && (
                <div className={`mt-1 line-clamp-1 text-sm ${APP_BODY_TEXT_CLASS}`}>
                  Location:{" "}
                  {selectedPost.place_name ||
                    getPublicLocationLabel(
                      selectedPost.place_name,
                      selectedPost.location
                    )}
                </div>
              )}

              <div className={`mt-1 text-sm ${APP_BODY_TEXT_CLASS}`}>
                Target: {selectedPost.target_gender || "Any"} /{" "}
                {selectedPost.target_age_group || "Any"}
              </div>

              <div className={`mt-2 flex flex-wrap items-center justify-between gap-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
                <span>Host: {selectedPost.host_name}</span>

                {selectedPost.is_my_post ? (
                  <span className={`rounded-full px-3 py-1 text-xs ${APP_PILL_INACTIVE_CLASS}`}>
                    My meetup
                  </span>
                ) : selectedPost.my_match_status ? (
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${badgeClass(
                      selectedPost.my_match_status
                    )}`}
                  >
                    {selectedPost.my_match_status}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/posts/${selectedPost.id}`}
                className={`inline-flex rounded-xl px-4 py-2 text-sm font-medium transition ${APP_BUTTON_PRIMARY_CLASS}`}
              >
                View Meetup
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

