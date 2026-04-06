"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

type PendingLocation = {
  address: string;
  lat: number;
  lng: number;
};

export default function WriteLocationPage() {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const [pendingLocation, setPendingLocation] = useState<PendingLocation | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initMap = () => {
      if (
        !window.google ||
        !window.google.maps ||
        !window.google.maps.places ||
        !mapRef.current ||
        !searchInputRef.current
      ) {
        return false;
      }

      if (!mapInstanceRef.current) {
        const defaultCenter = { lat: 34.0522, lng: -118.2437 };

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 12,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        markerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          position: defaultCenter,
          visible: false,
        });

        geocoderRef.current = new window.google.maps.Geocoder();

        mapInstanceRef.current.addListener("click", (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          markerRef.current.setPosition({ lat, lng });
          markerRef.current.setVisible(true);

          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results: any, status: string) => {
              if (status === "OK" && results && results[0]) {
                setPendingLocation({
                  address: results[0].formatted_address,
                  lat,
                  lng,
                });
                setMessage("");
              } else {
                setPendingLocation(null);
                setMessage("Could not get address from that point.");
              }
            }
          );
        });
      }

      if (!autocompleteRef.current) {
        autocompleteRef.current =
          new window.google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ["formatted_address", "name", "geometry"],
          });

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          const formattedAddress =
            place?.formatted_address || place?.name || "";
          const lat = place?.geometry?.location?.lat?.();
          const lng = place?.geometry?.location?.lng?.();

          if (
            !formattedAddress ||
            typeof lat !== "number" ||
            typeof lng !== "number"
          ) {
            setPendingLocation(null);
            setMessage("Please choose a valid place from the dropdown.");
            return;
          }

          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);

          markerRef.current.setPosition({ lat, lng });
          markerRef.current.setVisible(true);

          setPendingLocation({
            address: formattedAddress,
            lat,
            lng,
          });
          setMessage("");
        });
      }

      return true;
    };

    if (!initMap()) {
      interval = setInterval(() => {
        if (initMap()) clearInterval(interval);
      }, 500);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported on this device.");
      return;
    }

    if (!geocoderRef.current || !mapInstanceRef.current || !markerRef.current) {
      setMessage("Map is still loading. Please try again.");
      return;
    }

    setMessage("");
    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        mapInstanceRef.current.setCenter({ lat, lng });
        mapInstanceRef.current.setZoom(15);

        markerRef.current.setPosition({ lat, lng });
        markerRef.current.setVisible(true);

        geocoderRef.current.geocode(
          { location: { lat, lng } },
          (results: any, status: string) => {
            setLocating(false);

            if (status === "OK" && results && results[0]) {
              const address = results[0].formatted_address;

              setPendingLocation({
                address,
                lat,
                lng,
              });

              if (searchInputRef.current) {
                searchInputRef.current.value = address;
              }

              setMessage("");
            } else {
              setPendingLocation(null);
              setMessage("Could not convert your current location to an address.");
            }
          }
        );
      },
      () => {
        setLocating(false);
        setMessage("Could not get your current location.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handleConfirm = () => {
    if (!pendingLocation) {
      setMessage("Choose a place from search, current location, or tap the map first.");
      return;
    }

    const params = new URLSearchParams({
      location: pendingLocation.address,
      lat: String(pendingLocation.lat),
      lng: String(pendingLocation.lng),
    });

    router.push(`/write?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-10 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
            Neonadri
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
            Pick on Map
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#6f655c]">
            Search a place, use your current location, or tap the map. Then confirm one exact location.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="rounded-2xl bg-[#6b5f52] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046] disabled:opacity-50"
            >
              {locating ? "Finding..." : "Use Current Location"}
            </button>
          </div>

          <div className="mt-4">
            <input
              ref={searchInputRef}
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Search exact place or address"
            />
          </div>

          <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#dccfc2] bg-white p-3">
            <div ref={mapRef} className="h-[28rem] w-full rounded-[1rem]" />
          </div>

          {pendingLocation && (
            <div className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              <p className="font-medium text-[#2f2a26]">Pending location</p>
              <p className="mt-1">{pendingLocation.address}</p>
              <p className="mt-1 text-xs text-[#8b7f74]">
                Lat: {pendingLocation.lat.toFixed(6)}, Lng:{" "}
                {pendingLocation.lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              Select This Location
            </button>

            <button
              type="button"
              onClick={() => router.push("/write")}
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              Back
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}