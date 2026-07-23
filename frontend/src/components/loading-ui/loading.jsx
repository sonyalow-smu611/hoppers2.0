"use client";

import { useState } from "react";
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

export function Loading({ className = "min-h-[60vh]" }) {
  // pick once per mount so it's fresh each time a page enters its loading state
  const [phrase] = useState(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)],
  );

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
