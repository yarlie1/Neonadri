"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    google: any;
  }
}

type PendingLocation = {
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type SearchResultItem = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

const PAGE_SIZE = 5;

export default function WriteLocationPage() {
  const router = useRouter();

  const mapRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  const [returnTo, setReturnTo] = useState("/write");
  const [pendingLocation, setPendingLocation] = useState<PendingLocation | null>(
    null
  );
  const [allSearchResults, setAllSearchResults] = useState<SearchResultItem[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const value = params.get("returnTo");

    if (value) {
      setReturnTo(value);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initMap = () => {
      if (
        !window.google ||
        !window.google.maps ||
        !window.google.maps.places ||
        !mapRef.current
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
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          mapInstanceRef.current
        );

        mapInstanceRef.current.addListener("click", (event: any) => {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          markerRef.current.setPosition({ lat, lng });
          markerRef.current.setVisible(true);

          geocoderRef.current.geocode(
            { location: { lat, lng } },
            (results: any, status: string) => {
              if (status === "OK" && results && results[0]) {
                const address = results[0].formatted_address;

                if (placesServiceRef.current) {
                  placesServiceRef.current.nearbySearch(
                    {
                      location: { lat, lng },
                      radius: 50,
                    },
                    (places: any, placesStatus: string) => {
                      const placeName =
                        placesStatus === "OK" && places && places[0]?.name
                          ? places[0].name
                          : address;

                      setPendingLocation({
                        name: placeName,
                        address,
                        lat,
                        lng,
                      });
                      setAllSearchResults([]);
                      setCurrentPage(1);
                      setMessage("");
                    }
                  );
                } else {
                  setPendingLocation({
                    name: address,
                    address,
                    lat,
                    lng,
                  });
                  setAllSearchResults([]);
                  setCurrentPage(1);
                  setMessage("");
                }
              } else {
                setPendingLocation(null);
                setMessage("Could not get address from that point.");
              }
            }
          );
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
    };
  }, []);

  const totalPages = Math.ceil(allSearchResults.length / PAGE_SIZE);

  const pagedResults = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return allSearchResults.slice(start, start + PAGE_SIZE);
  }, [allSearchResults, currentPage]);

  const getVisiblePages = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, "ellipsis", totalPages] as const;
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ] as const;
    }

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ] as const;
  };

  const handleSearchPlace = () => {
    const query = searchInputRef.current?.value?.trim();

    if (!query) {
      setMessage("Enter a place or address first.");
      return;
    }

    if (!placesServiceRef.current || !mapInstanceRef.current) {
      setMessage("Map is still loading. Please try again.");
      return;
    }

    setSearching(true);
    setMessage("");
    setAllSearchResults([]);
    setCurrentPage(1);

    placesServiceRef.current.textSearch(
      {
        query,
        location: mapInstanceRef.current.getCenter(),
        radius: 5000,
      },
      (results: any, status: string) => {
        setSearching(false);

        if (status !== "OK" || !results || results.length === 0) {
          setPendingLocation(null);
          setAllSearchResults([]);
          setCurrentPage(1);
          setMessage("No matching places found.");
          return;
        }

        const mappedResults: SearchResultItem[] = results
          .filter((place: any) => {
            const lat = place.geometry?.location?.lat?.();
            const lng = place.geometry?.location?.lng?.();
            return typeof lat === "number" && typeof lng === "number";
          })
          .map((place: any, index: number) => ({
            id: place.place_id || `${place.name}-${index}`,
            name: place.name || "Unnamed place",
            address: place.formatted_address || place.name || "No address",
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          }));

        if (mappedResults.length === 0) {
          setPendingLocation(null);
          setAllSearchResults([]);
          setCurrentPage(1);
          setMessage("Could not get valid search results.");
          return;
        }

        setAllSearchResults(mappedResults);
        setCurrentPage(1);
        setMessage("Choose one result below.");
      }
    );
  };

  const handleSelectSearchResult = (item: SearchResultItem) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    mapInstanceRef.current.setCenter({ lat: item.lat, lng: item.lng });
    mapInstanceRef.current.setZoom(15);

    markerRef.current.setPosition({ lat: item.lat, lng: item.lng });
    markerRef.current.setVisible(true);

    setPendingLocation({
      name: item.name,
      address: item.address,
      lat: item.lat,
      lng: item.lng,
    });

    if (searchInputRef.current) {
      searchInputRef.current.value = item.address;
    }

    setMessage("");
  };

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
    setAllSearchResults([]);
    setCurrentPage(1);

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
                name: "Current Location",
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
      setMessage(
        "Search, choose a result, use current location, or tap the map first."
      );
      return;
    }

    const params = new URLSearchParams({
      name: pendingLocation.name,
      location: pendingLocation.address,
      lat: String(pendingLocation.lat),
      lng: String(pendingLocation.lng),
    });

    router.push(`${returnTo}?${params.toString()}`);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-10 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
          <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
            Pick on Map
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#6f655c]">
            Search with the button, choose one result, use your current
            location, or tap the map. Then confirm one exact location.
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

          <div className="mt-4 flex gap-3">
            <input
              ref={searchInputRef}
              className="flex-1 rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Enter place or address"
            />

            <button
              type="button"
              onClick={handleSearchPlace}
              disabled={searching}
              className="rounded-2xl bg-[#a48f7a] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
            >
              {searching ? "Searching..." : "Search"}
            </button>
          </div>

          {pagedResults.length > 0 && (
            <div className="mt-4 space-y-2">
              {pagedResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(item)}
                  className="w-full rounded-2xl border border-[#e7ddd2] bg-white px-4 py-3 text-left transition hover:bg-[#f8f3ee]"
                >
                  <p className="text-sm font-medium text-[#2f2a26]">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-[#6f655c]">{item.address}</p>
                </button>
              ))}

              {totalPages > 1 && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-3 py-2 text-sm text-[#5a5149] transition hover:bg-[#ede3da] disabled:opacity-50"
                  >
                    Prev
                  </button>

                  {getVisiblePages().map((item, index) =>
                    item === "ellipsis" ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 py-2 text-sm text-[#8b7f74]"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`min-w-10 rounded-xl px-3 py-2 text-sm transition ${
                          currentPage === item
                            ? "bg-[#a48f7a] text-white"
                            : "border border-[#dccfc2] bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-3 py-2 text-sm text-[#5a5149] transition hover:bg-[#ede3da] disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[#dccfc2] bg-white p-3">
            <div ref={mapRef} className="h-[28rem] w-full rounded-[1rem]" />
          </div>

          {pendingLocation && (
            <div className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              <p className="font-medium text-[#2f2a26]">Selected place</p>
              <p className="mt-1 text-base font-semibold text-[#2f2a26]">
                {pendingLocation.name}
              </p>
              <p className="mt-1 text-sm text-[#6b5f52]">
                {pendingLocation.address}
              </p>
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
              onClick={() => router.push(returnTo)}
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