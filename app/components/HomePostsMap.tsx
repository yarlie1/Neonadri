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

      <div ref={mapRef} className="h-[30rem] w-full rounded-[1.5rem]" />

      {selectedPost && (
        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-5 shadow-sm">
          <div className="text-base font-medium">
            📍 {selectedPost.place_name || "No place"}
          </div>

          {selectedPost.location && (
            <div className="mt-1 text-sm text-[#6f655c]">
              {selectedPost.location}
            </div>
          )}

          <div className="mt-3 space-y-2 text-sm text-[#6f655c]">
            <div>🧑 Host: {selectedPost.host_name}</div>

            {selectedPost.is_my_post && <div>📝 This is your meetup post.</div>}

            {!selectedPost.is_my_post && selectedPost.my_match_status && (
              <div className="flex items-center gap-2">
                <span>🤝 My Match Status:</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(
                    selectedPost.my_match_status
                  )}`}
                >
                  {selectedPost.my_match_status}
                </span>
              </div>
            )}

            {selectedPost.meeting_time && (
              <div>
                ⏰ {new Date(selectedPost.meeting_time).toLocaleString()}
              </div>
            )}

            {selectedPost.meeting_purpose && (
              <div>🎯 {selectedPost.meeting_purpose}</div>
            )}

            {selectedPost.benefit_amount && (
              <div className="font-medium text-[#2f2a26]">
                🎁 {selectedPost.benefit_amount}
              </div>
            )}
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
  );
}