"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { MapPost } from "../map/page";

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
      return "☕";
    case "Meal":
      return "🍽";
    case "Dessert":
      return "🍰";
    case "Walk":
      return "🚶";
    case "Jogging":
      return "🏃";
    case "Yoga":
      return "🧘";
    case "Movie":
    case "Theater":
      return "🎬";
    case "Karaoke":
      return "🎤";
    case "Board Games":
      return "🎲";
    case "Gaming":
      return "🎮";
    case "Bowling":
      return "🎳";
    case "Arcade":
      return "🎯";
    case "Study":
      return "📚";
    case "Work Together":
    case "Work":
      return "💻";
    case "Book Talk":
    case "Book":
      return "📖";
    case "Photo Walk":
    case "Photo":
      return "📷";
    default:
      return "✨";
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
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
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
    if (!status) return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";

    const normalized = status.toLowerCase();

    if (normalized === "matched" || normalized === "accepted") {
      return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
    }

    if (normalized === "pending") {
      return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
    }

    if (normalized === "rejected") {
      return "bg-[#f7f1ea] text-[#9b8f84] border border-[#e7ddd2]";
    }

    return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locating}
          className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69] disabled:opacity-50"
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
                ? "bg-[#6b5f52] text-white"
                : "border border-[#dccfc2] bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
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
              ? "bg-[#6b5f52] text-white"
              : "border border-[#dccfc2] bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
          }`}
        >
          All
        </button>

        <span className="text-sm text-[#6f655c]">
          Showing {filteredPosts.length} meetup{filteredPosts.length === 1 ? "" : "s"}
        </span>
      </div>

      {locationMessage && (
        <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
          {locationMessage}
        </div>
      )}

      <div className="relative">
        <div ref={mapRef} className="h-[30rem] w-full rounded-[1.5rem]" />

        {selectedPost && (
          <div className="absolute bottom-4 left-4 right-4 z-10 rounded-[1.25rem] border border-[#e7ddd2] bg-white/95 px-5 py-4 shadow-[0_12px_28px_rgba(60,45,35,0.18)] backdrop-blur">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-3 top-3 text-sm text-[#8a7d71]"
            >
              ✕
            </button>

            <div className="flex items-start justify-between gap-4 pr-6">
              <div className="min-w-0 flex-1">
                <div className="text-base font-semibold">
                  {getPurposeIcon(selectedPost.meeting_purpose)}{" "}
                  {selectedPost.meeting_purpose || "Meetup"} ·{" "}
                  {formatDuration(selectedPost.duration_minutes)}
                </div>

                <div className="mt-1 truncate text-lg font-semibold">
                  {selectedPost.place_name || selectedPost.location}
                </div>
              </div>

              {selectedPost.benefit_amount && (
                <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#f6e7b2] to-[#e8c97a] px-4 py-2 text-sm font-semibold text-[#5a4a1f] shadow">
                  🪙 {selectedPost.benefit_amount}
                </div>
              )}
            </div>

            <div className="mt-3">
              {selectedPost.meeting_time && (
                <div className="text-sm text-[#6f655c]">
                  ⏰ {formatTime(selectedPost.meeting_time)}
                </div>
              )}

              {selectedPost.location && (
                <div className="mt-1 line-clamp-1 text-sm text-[#6f655c]">
                  📍 {selectedPost.location}
                </div>
              )}

              <div className="mt-1 text-sm text-[#6f655c]">
                👤 {selectedPost.target_gender || "Any"} /{" "}
                {selectedPost.target_age_group || "Any"}
              </div>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-[#6f655c]">
                <span>🧑 {selectedPost.host_name}</span>

                {selectedPost.is_my_post ? (
                  <span className="rounded-full border border-[#e7ddd2] bg-[#f4ece4] px-3 py-1 text-xs text-[#6b5f52]">
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
                className="inline-flex rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
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