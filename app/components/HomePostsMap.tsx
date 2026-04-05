"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

type MapPost = {
  id: number;
  title: string;
  location: string | null;
  meeting_time: string | null;
  latitude: number | null;
  longitude: number | null;
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
        (post) => post.latitude !== null && post.longitude !== null
      );

      const defaultCenter = { lat: 34.0522, lng: -118.2437 };

      const map = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 10,
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

        const marker = new window.google.maps.Marker({
          position,
          map,
          title: post.title,
        });

        bounds.extend(position);

        const timeText = post.meeting_time
          ? new Date(post.meeting_time).toLocaleString()
          : "";

        const content = `
          <div style="max-width:220px; font-family:Arial,sans-serif;">
            <div style="font-weight:700; margin-bottom:6px;">${post.title}</div>
            ${
              post.location
                ? `<div style="font-size:13px; color:#555; margin-bottom:4px;">${post.location}</div>`
                : ""
            }
            ${
              timeText
                ? `<div style="font-size:12px; color:#777; margin-bottom:8px;">${timeText}</div>`
                : ""
            }
            <a href="/posts/${post.id}" style="font-size:13px; color:#8d7763; text-decoration:none;">
              View post
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
        map.setZoom(14);
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