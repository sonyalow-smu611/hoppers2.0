"use client";
import { useState, useEffect } from "react";

const defaultCenter = {
  lat: 1.296568,
  lng: 103.852119,
};

export default function SearchBar() {
  const [cafes, setCafes] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

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

    if (!response.ok) {
      throw new Error("Failed to fetch nearby cafes");
    }

    const data = await response.json();
    console.log("search bar:", data.places)
    setCafes(data.places || []);
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchNearbyCafes(defaultCenter.lat, defaultCenter.lng).catch(console.error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchNearbyCafes(position.coords.latitude, position.coords.longitude).catch(
          console.error,
        );
      },
      (error) => {
        console.log("Location error:", error);
        fetchNearbyCafes(defaultCenter.lat, defaultCenter.lng).catch(console.error);
      },
    );
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const filtered = cafes.filter((cafe) =>
      cafe.displayName?.text?.toLowerCase().includes(query.toLowerCase()),
    );
    setResults(filtered);
  }, [query, cafes]);

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