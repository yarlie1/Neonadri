"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_BODY_TEXT_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

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

const PLACE_TYPE_PRIORITY = [
  "restaurant",
  "cafe",
  "bakery",
  "meal_takeaway",
  "meal_delivery",
  "bar",
  "store",
  "shopping_mall",
  "gym",
  "park",
  "library",
  "movie_theater",
  "establishment",
  "point_of_interest",
];

function getPlacePriorityScore(types: string[] = []) {
  const matchedIndex = PLACE_TYPE_PRIORITY.findIndex((type) =>
    types.includes(type)
  );

  return matchedIndex === -1 ? Number.MAX_SAFE_INTEGER : matchedIndex;
}

export default function WriteLocationPage() {
  const router = useRouter();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const resultMarkersRef = useRef<Array<{ key: string; marker: any }>>([]);
  const geocoderRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const selectionRequestRef = useRef(0);

  const [returnTo, setReturnTo] = useState("/write");
  const [query, setQuery] = useState("");
  const [selectedLatLng, setSelectedLatLng] = useState<LatLng | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedPlaceName, setSelectedPlaceName] = useState("");
  const [loadingMap, setLoadingMap] = useState(true);
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selectedResultKey, setSelectedResultKey] = useState<string | null>(null);

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

          setSelectedResultKey(null);
          updateResultMarkerStyles(null);
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

  const getResultMarkerIcon = (active: boolean) => {
    if (!window.google?.maps) return undefined;

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: active ? "#d14c4c" : "#f6fafc",
      fillOpacity: 1,
      strokeColor: active ? "#b13d3d" : "#bccad3",
      strokeWeight: 2,
      scale: 13,
    };
  };

  const updateResultMarkerStyles = (activeKey: string | null) => {
    resultMarkersRef.current.forEach(({ key, marker }, index) => {
      const active = key === activeKey;
      marker.setIcon(getResultMarkerIcon(active));
      marker.setLabel({
        text: String(index + 1),
        color: active ? "#ffffff" : "#31424d",
        fontSize: "12px",
        fontWeight: "700",
      });
      marker.setZIndex(active ? 200 : 100);
    });
  };

  const updateMarker = (position: LatLng, showSelectionMarker = true) => {
    setSelectedLatLng(position);

    if (!window.google || !mapRef.current) return;

    if (!showSelectionMarker) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapRef.current.panTo(position);
      return;
    }

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

  const clearResultMarkers = () => {
    resultMarkersRef.current.forEach(({ marker }) => marker.setMap(null));
    resultMarkersRef.current = [];
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    const requestId = ++selectionRequestRef.current;

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (geocodeResults: any[], status: string) => {
        if (requestId !== selectionRequestRef.current) return;

        if (status === "OK" && geocodeResults && geocodeResults[0]) {
          const fallbackAddress = geocodeResults[0].formatted_address || "";
          const fallbackName = fallbackAddress || "Selected Location";

          if (placesServiceRef.current && window.google?.maps?.places) {
            const applySelection = (name: string) => {
              if (requestId !== selectionRequestRef.current) return;
              setSelectedAddress(fallbackAddress);
              setSelectedPlaceName(name);
            };

            const updateFromNearbyResults = (placeResults: any[]) => {
              if (!placeResults || placeResults.length === 0) return false;

              const preferredPlace = [...placeResults]
                .filter((item) => item?.name && !isAddressLikeName(item.name))
                .sort((a, b) => {
                  const aScore = getPlacePriorityScore(a.types || []);
                  const bScore = getPlacePriorityScore(b.types || []);

                  if (aScore !== bScore) return aScore - bScore;

                  const aRating =
                    typeof a.rating === "number" ? a.rating : -1;
                  const bRating =
                    typeof b.rating === "number" ? b.rating : -1;

                  if (aRating !== bRating) return bRating - aRating;

                  return 0;
                })[0];

              if (preferredPlace?.name) {
                applySelection(preferredPlace.name);
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
                      if (updateFromNearbyResults(poiResults)) {
                        return;
                      }
                    }
                    applySelection(fallbackName);
                  }
                );
              }
            );
            return;
          }

          setSelectedAddress(fallbackAddress);
          setSelectedPlaceName(fallbackName);
          return;
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
    setSelectedResultKey(null);
    clearResultMarkers();
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
      const bounds = new window.google.maps.LatLngBounds();

      resultMarkersRef.current = searchResults
        .map((item: any, index: number) => {
          const location = item.geometry?.location;
          if (!location) return null;

          bounds.extend(location);

          const marker = new window.google.maps.Marker({
            map: mapRef.current,
            position: location,
            label: {
              text: String(index + 1),
              color: "#31424d",
              fontSize: "12px",
              fontWeight: "700",
            },
            icon: getResultMarkerIcon(false),
          });

          marker.addListener("click", () => handleChooseResult(item, index));
          return {
            key: item.place_id || `${item.name || "result"}-${index}`,
            marker,
          };
        })
        .filter(Boolean);

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds);
      }
    });
  };

  const handleChooseResult = (item: any, index?: number) => {
    const lat = item.geometry?.location?.lat?.();
    const lng = item.geometry?.location?.lng?.();

    if (typeof lat !== "number" || typeof lng !== "number") {
      setMessage("Could not use this result.");
      return;
    }

    const resultKey = item.place_id || `${item.name || "result"}-${index ?? "x"}`;

    updateMarker({ lat, lng }, false);
    setSelectedPlaceName(item.name || item.formatted_address || "Selected Place");
    setSelectedAddress(item.formatted_address || "");
    setQuery(item.formatted_address || item.name || "");
    setSelectedResultKey(resultKey);
    updateResultMarkerStyles(resultKey);
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
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-5 sm:px-6 sm:py-8`}>
      <div className={`mx-auto max-w-3xl p-5 sm:p-7 ${APP_SURFACE_CARD_CLASS}`}>
        <div className={`inline-flex items-center rounded-full px-3 py-1.5 ${APP_EYEBROW_CLASS} ${APP_SOFT_CARD_CLASS}`}>
          Pick on Map
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter place or address"
              className="flex-1 rounded-[22px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30"
            />

            <button
              type="button"
              onClick={handleSearch}
              disabled={searching}
              className={`rounded-[22px] px-5 py-3 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {results.length > 0 && (
            <div className={`rounded-[24px] p-2 ${APP_SOFT_CARD_CLASS}`}>
              <div className="max-h-64 overflow-y-auto">
                {results.map((item, index) => (
                  (() => {
                    const resultKey =
                      item.place_id || `${item.name || "result"}-${index}`;
                    const active = selectedResultKey === resultKey;

                    return (
                  <button
                    key={resultKey}
                    type="button"
                    onClick={() => handleChooseResult(item, index)}
                    className={`block w-full rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? "bg-[#eef4f7] shadow-[inset_0_0_0_1px_rgba(191,203,211,0.9)]"
                        : "hover:bg-[#f5f8fa]"
                    }`}
                  >
                    <div className="text-sm font-medium text-[#24323c]">
                      {index + 1}. {item.name || "Unnamed place"}
                    </div>
                    <div className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                      {item.formatted_address || ""}
                    </div>
                  </button>
                    );
                  })()
                ))}
              </div>
            </div>
          )}

          <div className={`overflow-hidden rounded-[28px] ${APP_SOFT_CARD_CLASS}`}>
            <div ref={mapContainerRef} className="h-[22rem] w-full sm:h-[24rem]" />
          </div>

          {loadingMap && (
            <p className={`text-sm ${APP_BODY_TEXT_CLASS}`}>Loading map...</p>
          )}

          {(selectedAddress || selectedLatLng) && (
            <div className={`rounded-[24px] px-4 py-4 text-sm ${APP_SOFT_CARD_CLASS} ${APP_BODY_TEXT_CLASS}`}>
              <p className={APP_EYEBROW_CLASS}>
                Selected place
              </p>

              {selectedPlaceName && (
                <p className="mt-2 text-base font-semibold text-[#24323c]">
                  {selectedPlaceName}
                </p>
              )}

              {selectedAddress && <p className="mt-1">{selectedAddress}</p>}

              {selectedLatLng && (
                <p className={`mt-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                  Lat: {selectedLatLng.lat.toFixed(6)}, Lng:{" "}
                  {selectedLatLng.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}

          {message && (
            <div className="rounded-[22px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
              {message}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => router.push(returnTo)}
              className={`rounded-[22px] px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className={`rounded-[22px] px-5 py-3 text-sm font-medium transition ${APP_BUTTON_PRIMARY_CLASS}`}
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
