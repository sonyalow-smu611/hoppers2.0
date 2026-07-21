"use client";

import api from "@/api";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

const FALLBACK_CAFE_IMAGE =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800";

export default function SavedListPage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function fetchSavedPlaces() {
      try {
        const token = await getToken();
        const res = await api.get("/lists/saved-list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSavedPlaces(res.data.savedPlaces);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSavedPlaces();
  }, [getToken, isLoaded, isSignedIn]);

  // Wait for Clerk to finish checking auth state
  if (!isLoaded) return null;

  // Block the page entirely if not signed in
  if (!isSignedIn) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">
          Please sign in to view your saved lists.
        </p>
      </main>
    );
  }

  if (loading)
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved Cafes</h1>
        <p className="text-sm text-muted-foreground">
          Your saved cafe places
        </p>
      </div>

      {savedPlaces.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved cafes yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {savedPlaces.map((place) => (
            <SavedCafeCard key={place.list_id} cafe={place.cafes} />
          ))}
        </div>
      )}
    </main>
  );
}

function SavedCafeCard({ cafe }) {
  const image = cafe?.picture || FALLBACK_CAFE_IMAGE;
  const name = cafe?.name ?? "Unknown cafe";
  const mapsQuery = [name, cafe?.address].filter(Boolean).join(" ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  return (
    <article className="group space-y-2">
      <a href={mapsUrl} target="_blank" rel="noreferrer" className="block">
        <div className="aspect-[5/4] overflow-hidden rounded-2xl bg-muted">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>

        <div className="px-0.5 pt-2">
          <h2 className="font-semibold leading-tight group-hover:underline">
            {name}
          </h2>
        </div>
      </a>
    </article>
  );
}
