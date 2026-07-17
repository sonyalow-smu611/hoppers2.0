"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

import CafeSidebar from "./CafeSidebar";

const defaultCenter = {
  lat: 1.296568,
  lng: 103.852119,
};

export default function MapComponent() {
  const [center, setCenter] = useState(null);
  const [cafes, setCafes] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);

  const [allCafes, setAllCafes] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredCafe, setFilteredCafe] = useState(null);

  // Load the full cafe list once
  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((json) => setAllCafes(json));
  }, []);

  const filteredCafes = query
    ? allCafes.filter((cafe) =>
        cafe.displayName?.text?.toLowerCase().includes(query.toLowerCase()),
      )
    : allCafes;

  async function fetchNearbyCafes(lat, lng) {
    const response = await fetch(
      "https://places.googleapis.com/v1/places:searchNearby",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.formattedAddress,places.photos",
        },
        body: JSON.stringify({
          includedTypes: ["cafe"],
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: lat,
                longitude: lng,
              },
              radius: 1200,
            },
          },
        }),
      },
    );

    const data = await response.json();
    console.log("Places API response:", data);
    setCafes(data.places || []);
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setCenter(defaultCenter);
      fetchNearbyCafes(defaultCenter.lat, defaultCenter.lng);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCenter({ lat, lng });
        fetchNearbyCafes(lat, lng);
      },
      (error) => {
        console.log("Location error:", error);
        setCenter(defaultCenter);
        fetchNearbyCafes(defaultCenter.lat, defaultCenter.lng);
      },
    );
  }, []);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <input
        type="text"
        placeholder="Search cafes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-lg border p-2"
      />
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
                defaultCenter={center}
                defaultZoom={15}
                gestureHandling="greedy"
                mapId="DEMO_MAP_ID"
                fullscreenControl={false}
                streetViewControl={false}
                mapTypeControl={false}
              >
                <AdvancedMarker position={center}>
                  <div className="h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-lg" />
                </AdvancedMarker>

                {cafes.map((cafe) => {
                  const isSelected = selectedCafe?.id === cafe.id;

                  return (
                    <AdvancedMarker
                      key={cafe.id}
                      position={{
                        lat: cafe.location.latitude,
                        lng: cafe.location.longitude,
                      }}
                      onClick={() => setSelectedCafe(cafe)}
                    />
                  );
                })}
              </Map>
            </div>
          )}
        </div>
      </div>
    </APIProvider>
  );
}
