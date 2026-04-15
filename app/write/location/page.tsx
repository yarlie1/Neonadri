"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

type LatLng = {
  lat: number;
  lng: number;
};

function isAddressLikeName(name: string) {
  return /^\d/.test(name.trim());
}

export default function WriteLocationPage() {
  const router = useRouter();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  const [returnTo, setReturnTo] = useState("/write");
  const [query, setQuery] = useState("");
  const [selectedLatLng, setSelectedLatLng] = useState<LatLng | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [loadingMap, setLoadingMap] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const defaultCenter = useMemo<LatLng>(
    () => ({ lat: 34.0522, lng: -118.2437 }),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get("returnTo") || "/write");
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initMap = () => {
      if (!window.google || !window.google.maps || !mapContainerRef.current) {
        return false;
      }

      if (!mapRef.current) {
        mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 12,
          clickableIcons: false,
          gestureHandling: "greedy",
        });

        geocoderRef.current = new window.google.maps.Geocoder();
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          mapRef.current
        );

        mapRef.current.addListener("click", (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();

          setResults([]);
          setMessage("");

          updateMarker({ lat, lng });
          reverseGeocode(lat, lng);
        });
      }

      setLoadingMap(false);
      return true;
    };

    if (!initMap()) {
      interval = setInterval(() => {
        if (initMap()) clearInterval(interval);
      }, 400);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [defaultCenter]);

  const updateMarker = (position: LatLng) => {
    setSelectedLatLng(position);

    if (!window.google || !mapRef.current) return;

    if (!markerRef.current) {
      markerRef.current = new window.google.maps.Marker({
        map: mapRef.current,
        position,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      markerRef.current.setPosition(position);
    }

    mapRef.current.panTo(position);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (geocodeResults: any[], status: string) => {
        if (status === "OK" && geocodeResults && geocodeResults[0]) {
          const fallbackAddress = geocodeResults[0].formatted_address || "";
          const fallbackName = fallbackAddress || "Selected Location";

          setSelectedAddress(fallbackAddress);
          setSelectedPlaceName(fallbackName);

          if (placesServiceRef.current && window.google?.maps?.places) {
            const updateFromNearbyResults = (placeResults: any[]) => {
              if (!placeResults || placeResults.length === 0) return false;

              const preferredPlace =
                placeResults.find(
                  (item) =>
                    item?.name &&
                    !isAddressLikeName(item.name) &&
                    (item.types || []).includes("establishment")
                ) ||
                placeResults.find(
                  (item) =>
                    item?.name &&
                    !isAddressLikeName(item.name) &&
                    (item.types || []).includes("point_of_interest")
                ) ||
                placeResults.find(
                  (item) => item?.name && !isAddressLikeName(item.name)
                );

              if (preferredPlace?.name) {
                setSelectedPlaceName(preferredPlace.name);
                return true;
              }

              return false;
            };

            placesServiceRef.current.nearbySearch(
              {
                location: { lat, lng },
                radius: 120,
                type: "establishment",
              },
              (placeResults: any[], placeStatus: string) => {
                if (
                  placeStatus === window.google.maps.places.PlacesServiceStatus.OK &&
                  updateFromNearbyResults(placeResults)
                ) {
                  return;
                }

                placesServiceRef.current.nearbySearch(
                  {
                    location: { lat, lng },
                    radius: 180,
                    type: "point_of_interest",
                  },
                  (poiResults: any[], poiStatus: string) => {
                    if (
                      poiStatus ===
                      window.google.maps.places.PlacesServiceStatus.OK
                    ) {
                      updateFromNearbyResults(poiResults);
                    }
                  }
                );
              }
            );
          }
        } else {
          setSelectedAddress("");
          setSelectedPlaceName("Selected Location");
          setMessage("Could not read the address for this point.");
        }
      }
    );
  };

  const handleSearch = () => {
    if (!query.trim()) {
      setMessage("Enter a place or address.");
      return;
    }

    if (!placesServiceRef.current || !mapRef.current || !window.google) {
      setMessage("Map is still loading.");
      return;
    }

    setSearching(true);
    setMessage("");
    setResults([]);

    const request = {
      query,
      fields: ["name", "formatted_address", "geometry"],
    };

    const service = placesServiceRef.current;
    service.textSearch(request, (searchResults: any[], status: string) => {
      setSearching(false);

      if (
        status !== window.google.maps.places.PlacesServiceStatus.OK ||
        !searchResults ||
        searchResults.length === 0
      ) {
        setMessage("No results found.");
        return;
      }

      setResults(searchResults);

      const first = searchResults[0];
      const location = first.geometry?.location;

      if (location) {
        mapRef.current.panTo(location);
        mapRef.current.setZoom(14);
      }
    });
  };

  const handleChooseResult = (item: any) => {
    const lat = item.geometry?.location?.lat?.();
    const lng = item.geometry?.location?.lng?.();

    if (typeof lat !== "number" || typeof lng !== "number") {
      setMessage("Could not use this result.");
      return;
    }

    updateMarker({ lat, lng });
    setSelectedPlaceName(item.name || item.formatted_address || "Selected Place");
    setSelectedAddress(item.formatted_address || "");
    setResults([]);
    setQuery(item.formatted_address || item.name || "");
    setMessage("");
  };

  const handleConfirm = () => {
    if (!selectedLatLng || !selectedAddress) {
      setMessage("Choose one exact location first.");
      return;
    }

    const params = new URLSearchParams({
      location: selectedAddress,
      name: selectedPlaceName || selectedAddress,
      lat: String(selectedLatLng.lat),
      lng: String(selectedLatLng.lng),
    });

    router.push(`${returnTo}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f7ede2_42%,#f5efe7_100%)] px-4 py-5 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-[#ece0d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f7eee6_100%)] p-5 shadow-[0_16px_38px_rgba(92,69,52,0.08)] sm:p-7">
        <div className="inline-flex items-center rounded-full bg-[#fbf4ed] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
          Pick on Map
        </div>
        <h1 className="mt-4 text-[30px] font-black tracking-[-0.04em] text-[#2f2a26] sm:text-[34px]">
          Choose an exact meetup spot.
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#6b5f52]">
          Search for a place or tap the map once. We keep the exact address and
          try to use the nearest recognizable place name.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter place or address"
              className="flex-1 rounded-[22px] border border-[#ded1c4] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="rounded-[22px] bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_18px_rgba(92,69,52,0.10)] transition hover:bg-[#927d69] disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {results.length > 0 && (
            <div className="rounded-[24px] border border-[#ece0d4] bg-[#fffdfa] p-2 shadow-[0_10px_20px_rgba(92,69,52,0.05)]">
              <div className="max-h-64 overflow-y-auto">
                {results.map((item, index) => (
                  <button
                    key={`${item.place_id || item.name}-${index}`}
                    type="button"
                    onClick={() => handleChooseResult(item)}
                    className="block w-full rounded-xl px-3 py-3 text-left transition hover:bg-[#f4ece4]"
                  >
                    <div className="text-sm font-medium text-[#2f2a26]">
                      {item.name || "Unnamed place"}
                    </div>
                    <div className="mt-1 text-xs text-[#6f655c]">
                      {item.formatted_address || ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-[28px] border border-[#ece0d4] bg-[#fffdfa] shadow-[0_12px_24px_rgba(92,69,52,0.06)]">
            <div ref={mapContainerRef} className="h-[22rem] w-full sm:h-[24rem]" />
          </div>

          {loadingMap && (
            <p className="text-sm text-[#6f655c]">Loading map...</p>
          )}

          {(selectedAddress || selectedLatLng) && (
            <div className="rounded-[24px] border border-[#ece0d4] bg-[linear-gradient(180deg,#fbf4ed_0%,#f3e7dc_100%)] px-4 py-4 text-sm text-[#6b5f52]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                Selected place
              </p>

              {selectedPlaceName && (
                <p className="mt-2 text-base font-semibold text-[#2f2a26]">
                  {selectedPlaceName}
                </p>
              )}

              {selectedAddress && <p className="mt-1">{selectedAddress}</p>}

              {selectedLatLng && (
                <p className="mt-1 text-xs text-[#8b7f74]">
                  Lat: {selectedLatLng.lat.toFixed(6)}, Lng:{" "}
                  {selectedLatLng.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}

          {message && (
            <div className="rounded-[22px] border border-[#ece0d4] bg-[#f7eee6] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push(returnTo)}
              className="rounded-[22px] border border-[#ded1c4] bg-[#f6eee5] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-[22px] bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_18px_rgba(92,69,52,0.10)] transition hover:bg-[#5b5046]"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
