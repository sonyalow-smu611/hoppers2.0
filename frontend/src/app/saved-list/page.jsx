"use client";

import { useEffect, useState } from "react";
import api from "@/api";
import { useUser, useAuth } from "@clerk/nextjs";
import SavedCafeCard from "@/components/cafes/SavedCafeCard";
import { Loading } from "@/components/loading-ui/loading";

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

  if (loading) {
    return (
      <Loading />
    );
  }

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
            <SavedCafeCard
              key={place.list_id}
              place={place}
              getToken={getToken}
              onRemove={() =>
                setSavedPlaces((prev) =>
                  prev.filter((p) => p.list_id !== place.list_id),
                )
              }
              onVisitChange={(visited) =>
                setSavedPlaces((prev) =>
                  prev.map((p) =>
                    p.list_id === place.list_id
                      ? { ...p, visit_type: visited }
                      : p,
                  ),
                )
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}
