"use client";

import { useEffect, useState } from "react";
import api from "@/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

const BUDGET_LABELS = {
  1: "Under $15 / pax",
  2: "$15–$30 / pax",
  3: "$30+ / pax",
};
const PURPOSE_LABELS = {
  study: "📚 Studying",
  dining: "🍽️ Casual dining",
  meetup: "💬 Meetup",
  birthday: "🎂 Birthday",
  photo: "📸 Aesthetic",
};
const PRICE_LEVELS = {
  PRICE_LEVEL_FREE: 0,
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

function StarRating({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={i <= score ? "text-amber-400" : "text-muted-foreground"}
        >
          {i <= score ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function ResultsPage() {
  const [prefs, setPrefs] = useState(null);
  const [saved, setSaved] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [others, setOthers] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { isSignedIn, isLoaded, getToken } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      const stored = localStorage.getItem("cafePrefs");
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }

      const p = JSON.parse(stored);
      if (!cancelled) setPrefs(p);

      try {
        const res = await api.post("/api/recommend", { preferences: p });
        if (cancelled) return;

        setRecommended(res.data.recommended ?? []);
        setOthers(res.data.others ?? []);
        setMessage(res.data.message ?? null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err.response?.data?.error ??
            "Couldn't load recommendations. Please try again.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    async function fetchSavedPlaces() {
      try {
        const token = await getToken();
        const res = await api.get("/lists/saved-list", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const savedIds = res.data.savedPlaces
          .map((place) => place.notes || place.cafe_id || place.cafes?.id)
          .filter(Boolean);

        setSaved(savedIds);
      } catch (err) {
        console.error(err);
      }
    }

    fetchSavedPlaces();
  }, [getToken, isLoaded, isSignedIn]);

  async function toggleSave(id) {
    const isCurrentlySaved = saved.includes(id);

    setSaved((prev) =>
      isCurrentlySaved ? prev.filter((s) => s !== id) : [...prev, id],
    );

    if (!isSignedIn) {
      console.warn("User not signed in, save not persisted");
      setSaved((prev) =>
        isCurrentlySaved ? [...prev, id] : prev.filter((s) => s !== id),
      );
      return;
    }

    try {
      const token = await getToken();
      if (isCurrentlySaved) {
        await api.delete(`/lists/saved-list/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        const cafe = [...recommended, ...others].find((cafe) => cafe.id === id);
        await api.post(
          "/lists/saved-list",
          { cafe_id: id, cafe },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (err) {
      console.error(err);
      setSaved((prev) =>
        isCurrentlySaved ? [...prev, id] : prev.filter((s) => s !== id),
      );
    }
  }

  if (!prefs) return <p className="p-8 text-muted-foreground">Loading...</p>;
  if (loading)
    return (
      <p className="p-8 text-muted-foreground">Finding cafes near you...</p>
    );
  if (error) return <p className="p-8 text-red-600">{error}</p>;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-medium mb-1">Recommended cafes</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Based on your preferences
      </p>

      {/* Preference pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {prefs.budget && (
          <Badge variant="outline">{BUDGET_LABELS[prefs.budget]}</Badge>
        )}
        {prefs.purposes.map((p) => (
          <Badge key={p} variant="outline">
            {PURPOSE_LABELS[p]}
          </Badge>
        ))}
        <Badge variant="outline">🗺️ Within {prefs.distance} km</Badge>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground mb-6 p-3 rounded-md bg-muted">
          {message}
        </p>
      )}

      {/* Top picks */}
      {recommended.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
            Top picks
          </p>
          {recommended.map((cafe, i) => (
            <CafeResultCard
              key={cafe.id}
              cafe={cafe}
              rank={i + 1}
              isSaved={saved.includes(cafe.id)}
              onSave={() => toggleSave(cafe.id)}
            />
          ))}
        </>
      )}

      {/* Rest */}
      {others.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-6 mb-3">
            More cafes
          </p>
          {others.map((cafe) => (
            <CafeResultCard
              key={cafe.id}
              cafe={cafe}
              isSaved={saved.includes(cafe.id)}
              onSave={() => toggleSave(cafe.id)}
            />
          ))}
        </>
      )}

      {recommended.length === 0 && others.length === 0 && (
        <p className="text-sm text-muted-foreground">No cafes found.</p>
      )}
    </div>
  );
}

function CafeResultCard({ cafe, rank, isSaved, onSave }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.address || cafe.name)}`;
  const priceLevel = PRICE_LEVELS[cafe.priceLevel];

  return (
    <Card
      className={`p-4 mb-3 flex gap-3 ${rank ? "border-2 border-primary/20" : ""}`}
    >
      {rank ? (
        <div className="w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
          {rank}
        </div>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-medium text-sm">{cafe.name}</p>
          <StarRating score={Math.round(cafe.matchScore ?? cafe.rating ?? 0)} />
        </div>
        {cafe.summary && (
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            {cafe.summary}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            className={`text-xs h-7 ${isSaved ? "border-sunset-lagoon text-sunset-blue bg-accent" : ""}`}
          >
            {isSaved ? "♥ Saved" : "♡ Save"}
          </Button>
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs h-7">
              Directions ↗
            </Button>
          </a>
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs h-7">
              Find more info ↗
            </Button>
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {priceLevel != null ? "$".repeat(priceLevel) || "Free" : ""}
          {priceLevel != null && cafe.distanceKm != null ? " · " : ""}
          {cafe.distanceKm != null ? `${cafe.distanceKm} km away` : ""}
        </p>
      </div>
    </Card>
  );
}
