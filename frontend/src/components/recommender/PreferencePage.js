"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { getUserLocation } from "@/utils/location";


const PURPOSES = [
  { id: "study", label: "Studying", emoji: "📚" },
  { id: "dining", label: "Casual dining", emoji: "🍽️" },
  { id: "meetup", label: "Meetup", emoji: "💬" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "photo", label: "Aesthetic / photos", emoji: "📸" },
];

const BUDGET_LABELS = {
  1: "Under $15 / pax",
  2: "$15 – $30 / pax",
  3: "$30+ / pax",
};

export default function PreferencePage() {
  const router = useRouter();
  const [budget, setBudget] = useState(null);
  const [purposes, setPurposes] = useState([]);
  const [distance, setDistance] = useState(10);
  const [notes, setNotes] = useState("");

  const [location, setLocation] = useState(null);      // holds { lat, lng }
  const [locError, setLocError] = useState(null);
  const [locLoading, setLocLoading] = useState(false);

  async function handleUseLocation() {
    setLocError(null);
    setLocLoading(true);
    try {
      const coords = await getUserLocation();
      setLocation(coords);
    } catch (err) {
      setLocError("Couldn't get your location. Please allow location access in your browser and try again.");
    } finally {
      setLocLoading(false);
    }
  }

  function togglePurpose(id) {
    setPurposes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSave() {
    if (!location) {
      setLocError("Please set your location before continuing.");
      return;
    }
    const prefs = { budget, purposes, distance, notes, location };
    localStorage.setItem("cafePrefs", JSON.stringify(prefs));
    router.push("/results");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-medium mb-1">Your preferences</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Help us find your perfect cafe match.
      </p>

      {/* Budget */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Budget
        </p>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((level) => (
            <Button
              key={level}
              variant="outline"
              onClick={() => setBudget(level)}
              className={budget >= level ? "border-sunset-lagoon bg-accent text-accent-foreground" : "text-muted-foreground"}
            >
              {"$".repeat(level)}
            </Button>
          ))}
          {budget && (
            <span className="text-xs text-muted-foreground ml-2">
              {BUDGET_LABELS[budget]}
            </span>
          )}
        </div>
      </div>

      {/* Purpose */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Purpose
        </p>
        <div className="flex flex-wrap gap-2">
          {PURPOSES.map((p) => (
            <Button
              key={p.id}
              variant="outline"
              onClick={() => togglePurpose(p.id)}
              className={`rounded-full ${
                purposes.includes(p.id)
                  ? "bg-secondary border-primary text-secondary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {p.emoji} {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Distance */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Distance
        </p>
        <div className="flex items-center gap-3">
          <span className="text-xl">🗺️</span>
          <Slider
            min={0}
            max={50}
            step={1}
            value={[distance]}
            onValueChange={(val) => setDistance(val[0])}
            className="flex-1"
          />
          <span className="text-sm font-medium w-14">{distance} km</span>
        </div>

        {/* Location capture — required for the distance filter to work */}
        <div className="mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseLocation}
            disabled={locLoading}
          >
            📍 {locLoading ? "Getting location…" : location ? "Location set ✓" : "Use my location"}
          </Button>
          {locError && <p className="text-xs text-red-600 mt-1">{locError}</p>}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
          Anything else?
        </p>
        <Textarea
          placeholder="e.g. must have outdoor seating, pet-friendly, good matcha…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="resize-none"
          rows={3}
        />
      </div>

      <Button className="w-full" onClick={handleSave} disabled={!location}>
        Find my cafes ↗
      </Button>
    </div>
  );
}
