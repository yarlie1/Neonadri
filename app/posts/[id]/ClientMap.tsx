"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export default function ClientMap({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initMap = () => {
      if (!window.google || !window.google.maps || !mapRef.current) {
        return false;
      }

      const position = { lat: latitude, lng: longitude };

      const map = new window.google.maps.Map(mapRef.current, {
        center: position,
        zoom: 16,
      });

      new window.google.maps.Marker({
        position,
        map,
      });

      return true;
    };

    if (!initMap()) {
      interval = setInterval(() => {
        if (initMap()) clearInterval(interval);
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [latitude, longitude]);

  return <div ref={mapRef} className="h-[22rem] w-full" />;
}