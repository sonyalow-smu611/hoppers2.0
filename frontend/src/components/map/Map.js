"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import api from "@/api";

import { JollySearchField } from "@/components/ui/search-field";
import CafeSidebar from "./CafeSidebar";

const defaultCenter = {
  lat: 1.296568,
  lng: 103.852119,
};

function withRating(cafe) {
  return {
    ...cafe,
    rating: cafe.rating ?? null,
  };
}

export default function MapComponent() {
  const [center, setCenter] = useState(defaultCenter);
  const [cafes, setCafes] = useState([]);
  const [allCafes, setAllCafes] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredCafe, setFilteredCafe] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [locationStatus, setLocationStatus] = useState("");

  const filteredCafes = (query
    ? allCafes.filter((cafe) =>
        cafe.displayName?.text?.toLowerCase().includes(query.toLowerCase()),
      )
    : allCafes
  ).map(withRating);

  async function fetchNearbyCafes(lat, lng) {
    setLoadError("");

    const { data } = await api.post("/cafes/sync", {
      latitude: lat,
      longitude: lng,
      radiusMeters: 1200,
    });

    // console.log("Places API response:", data);
    const places = (data.cafes || []).map(withRating);
    setAllCafes(places);
    setCafes(places);
  }

  function handleCafeLoadError(error) {
    console.error(error);
    setLoadError("Couldn't load nearby cafes.");
  }

  function applyPosition(lat, lng) {
    setCenter({ lat, lng });
    fetchNearbyCafes(lat, lng).catch(handleCafeLoadError);
  }

  function onPositionError(error) {
    console.log("Location error:", error);
    // once denied, the browser won't re-prompt; tell the user how to reset it
    setLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
    applyPosition(defaultCenter.lat, defaultCenter.lng);
  }

  const geoOptions = { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 };

  useEffect(() => {
    if (!navigator.geolocation) {
      (async () => {
        await fetchNearbyCafes(defaultCenter.lat, defaultCenter.lng);
      })().catch(handleCafeLoadError);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("");
        applyPosition(position.coords.latitude, position.coords.longitude);
      },
      onPositionError,
      geoOptions,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // triggered by the "Use my location" button — a real user gesture, so the
  // browser will reliably show the location prompt (and re-show it if allowed)
  function locateMe() {
    setLocationStatus("prompting");
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      applyPosition(defaultCenter.lat, defaultCenter.lng);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("");
        applyPosition(position.coords.latitude, position.coords.longitude);
      },
      onPositionError,
      geoOptions,
    );
  }

  // console.log("allcafes:", allCafes);
  // console.log("filtered", filteredCafes);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <JollySearchField
        aria-label="Search cafes"
        placeholder="Search cafes..."
        value={query}
        onChange={setQuery}
        className="mb-4 max-w-sm"
      />
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={locateMe}
          className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          📍 {locationStatus === "prompting" ? "Locating…" : "Use my location"}
        </button>
        {locationStatus === "denied" && (
          <span className="text-xs text-amber-600">
            Location blocked — allow this site in your browser&apos;s site settings (address bar
            → site permissions → location), then click again.
          </span>
        )}
        {locationStatus === "error" && (
          <span className="text-xs text-amber-600">
            Couldn&apos;t get your location. Showing the Singapore area.
          </span>
        )}
      </div>
      {loadError && <p className="text-sm text-red-600">{loadError}</p>}
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <CafeSidebar
          cafes={filteredCafes}
          selectedCafe={filteredCafe}
          onSelectCafe={setFilteredCafe}
        />

        <div className="relative h-[600px] w-full">
          {!center ? (
            <div className="flex h-full items-center justify-center rounded-2xl border text-sm text-muted-foreground">
              Loading map...
            </div>
          ) : (
            <div className="h-full w-full overflow-hidden rounded-2xl border">
              <Map
                style={{ width: "100%", height: "100%" }}
                center={center}
                defaultZoom={15}
                gestureHandling="greedy"
                mapId="DEMO_MAP_ID"
                fullscreenControl={false}
                streetViewControl={false}
                mapTypeControl={false}
              >
                <AdvancedMarker position={center}>
                  <div className="h-5 w-5 rounded-full border-4 border-background bg-primary shadow-lg" />
                </AdvancedMarker>

                {cafes.map((cafe) => (
                  <AdvancedMarker
                    key={cafe.id}
                    position={{
                      lat: cafe.location.latitude,
                      lng: cafe.location.longitude,
                    }}
                    onClick={() => setFilteredCafe(cafe)}
                  />
                ))}
              </Map>
            </div>
          )}
        </div>
      </div>
    </APIProvider>
  );
}
