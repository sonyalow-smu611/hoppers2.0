"use client";

import api from "@/api";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import SavedCafeCard from "@/components/cafes/SavedCafeCard";

export default function BeenTherePage() {
  const { isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [visitedPlaces, setVisitedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function fetchVisitedPlaces() {
      try {
        const token = await getToken();
        const res = await api.get("/lists/saved-list?visited=true", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVisitedPlaces(res.data.savedPlaces);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchVisitedPlaces();
  }, [getToken, isLoaded, isSignedIn]);

  if (!isLoaded) return null;

  if (!isSignedIn) {
    return (
      <main className="p-6">
        <p className="text-sm text-muted-foreground">
          Please sign in to view cafes you&apos;ve been to.
        </p>
      </main>
    );
  }

  if (loading)
    return <p className="p-6 text-sm text-muted-foreground">Loading...</p>;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Been There</h1>
        <p className="text-sm text-muted-foreground">
          Cafes you&apos;ve visited
        </p>
      </div>

      {visitedPlaces.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No visited cafes yet — mark one as &quot;Been there&quot; from your saved list.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {visitedPlaces.map((place) => (
            <SavedCafeCard
              key={place.list_id}
              place={place}
              getToken={getToken}
              onRemove={() =>
                setVisitedPlaces((prev) =>
                  prev.filter((p) => p.list_id !== place.list_id),
                )
              }
              onVisitChange={(visited) => {
                if (visited) return;
                // Unmarking "been there" here means it drops out of this filtered view.
                setVisitedPlaces((prev) =>
                  prev.filter((p) => p.list_id !== place.list_id),
                );
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
