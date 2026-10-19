"use client";

import { useState } from "react";
import api from "@/api";

const FALLBACK_CAFE_IMAGE =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800";

export default function SavedCafeCard({ place, getToken, onRemove, onVisitChange }) {
  const cafe = place.cafes;
  const [removing, setRemoving] = useState(false);
  const [updatingVisit, setUpdatingVisit] = useState(false);
  const image = cafe?.picture || FALLBACK_CAFE_IMAGE;
  const name = cafe?.name ?? "Unknown cafe";
  const mapsQuery = [name, cafe?.address].filter(Boolean).join(" ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

  async function handleRemove() {
    if (removing) return;
    setRemoving(true);
    try {
      const id = place.notes || place.cafe_id;
      const token = await getToken();
      await api.delete(`/lists/saved-list/${encodeURIComponent(id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onRemove?.();
    } catch (err) {
      console.error(err);
      setRemoving(false);
    }
  }

  async function handleToggleVisited() {
    if (updatingVisit) return;
    const next = !place.visit_type;
    setUpdatingVisit(true);
    try {
      const token = await getToken();
      await api.patch(
        `/lists/${place.list_id}`,
        { visit_type: next },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      onVisitChange?.(next);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingVisit(false);
    }
  }

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
      <div className="flex items-center gap-3 px-0.5">
        <button
          type="button"
          onClick={handleToggleVisited}
          disabled={updatingVisit}
          className={`text-xs px-0.5 ${
            place.visit_type
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {place.visit_type ? "✓ Been there" : "Been there"}
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={removing}
          className="text-xs text-muted-foreground hover:text-destructive px-0.5"
        >
          {removing ? "Removing…" : "✕ Unsave"}
        </button>
      </div>
    </article>
  );
}
