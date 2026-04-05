"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

type ClientMapProps = {
  latitude: number;
  longitude: number;
};

export default function ClientMap({
  latitude,
  longitude,
}: ClientMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initMap = () => {
      if (!window.google || !window.google.maps || !mapRef.current) {
        return false;
      }

      const center = { lat: latitude, lng: longitude };

      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 15,
        clickableIcons: false,
      });

      new window.google.maps.Marker({
        position: center,
        map,
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
    };
  }, [latitude, longitude]);

  return <div ref={mapRef} className="h-72 w-full rounded-[1rem]" />;
}