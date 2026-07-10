"use client";

import { useEffect, useState } from "react";
import { cafes } from "@/data/mockcafe";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const BUDGET_LABELS = { 1: "Under $15 / pax", 2: "$15–$30 / pax", 3: "$30+ / pax" };
const PURPOSE_LABELS = {
  study: "📚 Studying", dining: "🍽️ Casual dining",
  meetup: "💬 Meetup", birthday: "🎂 Birthday", photo: "📸 Aesthetic",
};

function StarRating({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= score ? "text-amber-400" : "text-muted-foreground"}>
          {i <= score ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

function scoreCard(cafe, prefs) {
  let score = 0;
  if (prefs.budget && cafe.budget <= prefs.budget) score += 2;
  if (cafe.distance <= prefs.distance) score += 2;
  prefs.purposes.forEach((p) => { if (cafe.purposes.includes(p)) score += 1; });
  return Math.min(5, Math.round((score / (4 + prefs.purposes.length)) * 5));
}

export default function ResultsPage() {
  const [prefs, setPrefs] = useState(null);
  const [saved, setSaved] = useState([]);
  const [ranked, setRanked] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("cafePrefs");
    if (stored) {
      const p = JSON.parse(stored);
      setPrefs(p);
      const scored = cafes
        .map((c) => ({ ...c, score: scoreCard(c, p) }))
        .sort((a, b) => b.score - a.score);
      setRanked(scored);
    }
  }, []);

  function toggleSave(id) {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  if (!prefs) return <p className="p-8 text-muted-foreground">Loading...</p>;

  const top3 = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <h1 className="text-xl font-medium mb-1">Recommended cafes</h1>
      <p className="text-sm text-muted-foreground mb-4">Based on your preferences</p>

      {/* Preference pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {prefs.budget && <Badge variant="outline">{BUDGET_LABELS[prefs.budget]}</Badge>}
        {prefs.purposes.map((p) => <Badge key={p} variant="outline">{PURPOSE_LABELS[p]}</Badge>)}
        <Badge variant="outline">🗺️ Within {prefs.distance} km</Badge>
      </div>

      {/* Top 3 */}
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
        Top picks
      </p>
      {top3.map((cafe, i) => (
        <CafeResultCard
          key={cafe.id}
          cafe={cafe}
          rank={i + 1}
          isSaved={saved.includes(cafe.id)}
          onSave={() => toggleSave(cafe.id)}
        />
      ))}

      {/* Rest */}
      {rest.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-6 mb-3">
            More cafes
          </p>
          {rest.map((cafe) => (
            <CafeResultCard
              key={cafe.id}
              cafe={cafe}
              isSaved={saved.includes(cafe.id)}
              onSave={() => toggleSave(cafe.id)}
            />
          ))}
        </>
      )}
    </div>
  );
}

function CafeResultCard({ cafe, rank, isSaved, onSave }) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name + " cafe")}`;

  return (
    <Card className={`p-4 mb-3 flex gap-3 ${rank ? "border-2 border-blue-200" : ""}`}>
      {rank ? (
        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-sm font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
          {rank}
        </div>
      ) : (
        <div className="w-7 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="font-medium text-sm">{cafe.name}</p>
          <StarRating score={cafe.score} />
        </div>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{cafe.body}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSave}
            className={`text-xs h-7 ${isSaved ? "text-green-600 border-green-600" : ""}`}
          >
            {isSaved ? "♥ Saved" : "♡ Save"}
          </Button>
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs h-7">Directions ↗</Button>
          </a>
          <a href={mapsUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="text-xs h-7">Find more info ↗</Button>
          </a>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {"$".repeat(cafe.budget)} · {cafe.distance} km away
        </p>
      </div>
    </Card>
  );
}