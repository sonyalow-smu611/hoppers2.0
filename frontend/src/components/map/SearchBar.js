"use client";
import { useState, useEffect, useMemo } from "react";
import api from "@/api";

const defaultCenter = {
  lat: 1.296568,
  lng: 103.852119,
};

export default function SearchBar() {
  const [cafes, setCafes] = useState([]);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query) {
      return [];
    }

    return cafes.filter((cafe) =>
      cafe.displayName?.text?.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, cafes]);

  async function fetchNearbyCafes(lat, lng) {
    const { data } = await api.post("/cafes/sync", {
      latitude: lat,
      longitude: lng,
      radiusMeters: 1200,
    });

    // console.log("search bar:", data.cafes);
    setCafes(data.cafes || []);
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      async function loadDefaultCafes() {
        await fetchNearbyCafes(defaultCenter.lat, defaultCenter.lng);
      }

      loadDefaultCafes().catch(console.error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearbyCafes(position.coords.latitude, position.coords.longitude).catch(
          console.error,
        );
      },
      (error) => {
        // console.log("Location error:", error);
        fetchNearbyCafes(defaultCenter.lat, defaultCenter.lng).catch(console.error);
      },
    );
  }, []);

  return (
    <div>
      <input
        type="text"
        placeholder="Search cafes..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="font-medium">
        {results.map((cafe) => (
          <li key={cafe.id}>
            {cafe.displayName?.text ?? "Cafe"} —{" "}
            {cafe.formattedAddress ?? "No address available"} (⭐{" "}
            {cafe.rating ?? "No rating"})
          </li>
        ))}
      </ul>
    </div>
  );
}
