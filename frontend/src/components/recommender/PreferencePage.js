"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

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

  function togglePurpose(id) {
    setPurposes((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSave() {
    const prefs = { budget, purposes, distance, notes };
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
              className={budget >= level ? "text-green-600 border-green-600" : "text-muted-foreground"}
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
                  ? "bg-secondary border-foreground"
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

      <Button className="w-full" onClick={handleSave}>
        Find my cafes ↗
      </Button>
    </div>
  );
}