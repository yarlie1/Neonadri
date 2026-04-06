"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

type MapPost = {
  id: number;
  place_name?: string | null;
  location: string | null;
  meeting_time: string | null;
  latitude: number | null;
  longitude: number | null;
  meeting_purpose?: string | null;
  target_gender?: string | null;
  target_age_group?: string | null;
  benefit_amount?: string | null;
};

type Props = {
  posts: MapPost[];
};

export default function HomePostsMap({ posts }: Props) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initMap = () => {
      if (!window.google || !window.google.maps || !mapRef.current) {
        return false;
      }

      const validPosts = posts.filter(
        (post) =>
          typeof post.latitude === "number" &&
          typeof post.longitude === "number"
      );

      const defaultCenter = { lat: 34.0522, lng: -118.2437 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 10,
        clickableIcons: false,
      });

      if (validPosts.length === 0) {
        return true;
      }

      const bounds = new window.google.maps.LatLngBounds();
      const infoWindow = new window.google.maps.InfoWindow();

      validPosts.forEach((post) => {
        const position = {
          lat: post.latitude as number,
          lng: post.longitude as number,
        };

        const title = post.place_name || post.location || "Meetup";

        const marker = new window.google.maps.Marker({
          position,
          map,
          title,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          },
        });

        bounds.extend(position);

        const timeText = post.meeting_time
          ? new Date(post.meeting_time).toLocaleString()
          : "";

        const content = `
          <div style="
            width:220px;
            font-family:Arial,sans-serif;
            border-radius:12px;
            padding:12px;
          ">
            <div style="font-weight:700; font-size:14px; margin-bottom:6px;">
              📍 ${title}
            </div>

            ${
              post.location && post.location !== title
                ? `<div style="font-size:12px; color:#666; margin-bottom:6px;">${post.location}</div>`
                : ""
            }

            ${
              timeText
                ? `<div style="font-size:12px; color:#666; margin-bottom:4px;">⏰ ${timeText}</div>`
                : ""
            }

            ${
              post.meeting_purpose
                ? `<div style="font-size:12px; color:#555; margin-bottom:4px;">🎯 ${post.meeting_purpose}</div>`
                : ""
            }

            ${
              post.target_gender || post.target_age_group
                ? `<div style="font-size:12px; color:#555; margin-bottom:4px;">👤 ${post.target_gender || "Any"} / ${post.target_age_group || "Any"}</div>`
                : ""
            }

            ${
              post.benefit_amount
                ? `<div style="font-size:12px; color:#555; margin-bottom:8px;">🎁 ${post.benefit_amount}</div>`
                : ""
            }

            <a href="/posts/${post.id}" style="
              display:block;
              margin-top:8px;
              font-size:12px;
              color:#8d7763;
              text-decoration:none;
              font-weight:600;
            ">
              View →
            </a>
          </div>
        `;

        marker.addListener("click", () => {
          infoWindow.setContent(content);
          infoWindow.open(map, marker);
        });
      });

      map.fitBounds(bounds);

      if (validPosts.length === 1) {
        map.setZoom(15);
      }
      if (validPosts.length > 1) {
        map.setZoom(Math.min(map.getZoom() || 13, 13));
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
    };
  }, [posts]);

  return <div ref={mapRef} className="h-80 w-full rounded-[1.5rem]" />;
}