"use client";

import { useEffect, useRef, useState } from "react";
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

export default function HomePostsMap({ posts }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [selectedPost, setSelectedPost] = useState<MapPost | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const getStatusBadgeClass = (status: string | null) => {
      if (!status) return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";

      const normalized = status.toLowerCase();

      if (normalized === "matched") {
        return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
      }

      if (normalized === "accepted") {
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

    const initMap = () => {
      if (!window.google || !window.google.maps || !mapRef.current) {
        return false;
      }

      if (!mapInstanceRef.current) {
        const center =
          posts.length > 0
            ? { lat: posts[0].latitude, lng: posts[0].longitude }
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

      posts.forEach((post) => {
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
    };
  }, [posts]);

  const badgeClass = (status: string | null) => {
    if (!status) return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";

    const normalized = status.toLowerCase();

    if (normalized === "matched") {
      return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
    }

    if (normalized === "accepted") {
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