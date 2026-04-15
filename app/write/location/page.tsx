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
          const fallbackName =
            geocodeResults[0].address_components?.[0]?.long_name ||
            geocodeResults[0].formatted_address ||
            "Selected Location";

          setSelectedAddress(fallbackAddress);
          setSelectedPlaceName(fallbackName);

          if (placesServiceRef.current && window.google?.maps?.places) {
            const preferredTypes = new Set([
              "establishment",
              "point_of_interest",
              "store",
              "restaurant",
              "cafe",
              "gym",
              "park",
              "school",
              "bar",
              "bakery",
              "library",
              "shopping_mall",
              "movie_theater",
            ]);

            placesServiceRef.current.nearbySearch(
              {
                location: { lat, lng },
                rankBy: window.google.maps.places.RankBy.DISTANCE,
              },
              (placeResults: any[], placeStatus: string) => {
                if (
                  placeStatus !== window.google.maps.places.PlacesServiceStatus.OK ||
                  !placeResults ||
                  placeResults.length === 0
                ) {
                  return;
                }

                const preferredPlace =
                  placeResults.find((item) =>
                    (item.types || []).some((type: string) =>
                      preferredTypes.has(type)
                    )
                  ) || placeResults[0];

                if (preferredPlace?.name) {
                  setSelectedPlaceName(preferredPlace.name);
                }
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
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
          Pick on Map
        </h1>

        <div className="mt-8 space-y-4">
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter place or address"
              className="flex-1 rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {results.length > 0 && (
            <div className="rounded-2xl border border-[#e7ddd2] bg-white p-2">
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

          <div className="overflow-hidden rounded-[2rem] border border-[#e7ddd2] bg-white">
            <div ref={mapContainerRef} className="h-[28rem] w-full" />
          </div>

          {loadingMap && (
            <p className="text-sm text-[#6f655c]">Loading map...</p>
          )}

          {(selectedAddress || selectedLatLng) && (
            <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-4 text-sm text-[#6b5f52]">
              <p className="font-medium text-[#2f2a26]">Selected place</p>

              {selectedPlaceName && (
                <p className="mt-1 text-base font-semibold text-[#2f2a26]">
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
            <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046]"
            >
              Confirm Location
            </button>

            <button
              type="button"
              onClick={() => router.push(returnTo)}
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
