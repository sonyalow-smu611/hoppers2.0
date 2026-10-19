"use client";

import { useId } from "react";
import { InfinityTrack } from "@/components/loading-ui/infinity-track";

const PHRASES = [
  "Brewing something good...",
  "Warming up the espresso machine...",
  "Sniffing out the good stuff...",
  "On the hunt for hidden gems...",
  "Nosing around the neighbourhood...",
  "Good vibes and good coffee loading...",
  "Espresso-ly fetching your feed...",
  "Latte love coming your way...",
  "Filtering the good stuff...",
  "Percolating the perfect picks...",
  "Café hopping in progress...",
  "Scouting cosy corners...",
  "Good cups incoming ☕",
  "Worth the wait, promise.",
  "Almost there, don't spill your drink.",
];

// Map an SSR-stable id (useId() is the same on server and on the client's
// hydration pass) into a PHRASES index. Picked at render time so there's
// no post-hydration state churn.
function phraseForId(id, phrases) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return phrases[h % phrases.length];
}

export function Loading({ className = "min-h-[60vh]" }) {
  // useId() yields the same string on the server and on the client during
  // hydration, so phraseForId(...) returns the same phrase on both — no
  // hydration mismatch. Each new mount (route change etc.) gets its own
  // id and therefore its own phrase, preserving per-instance variety.
  const id = useId();
  const phrase = phraseForId(id, PHRASES);

  return (
    <div
      className={`flex ${className} flex-col items-center justify-center gap-4 text-blue-600`}
    >
      <InfinityTrack />
      <p className="text-sm text-muted-foreground">{phrase}</p>
    </div>
  );
}

export default Loading;
