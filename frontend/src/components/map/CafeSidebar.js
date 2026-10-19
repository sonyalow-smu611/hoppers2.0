"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/api";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24";

function getPhotoUrl(photoName) {
  return `/cafes/photo?name=${encodeURIComponent(photoName)}`;
}

export default function CafeSidebar({ cafes, selectedCafe, onSelectCafe }) {
  const itemRefs = useRef({});
  const router = useRouter();

  // resolve a Google Places cafe (by name) to a DB cafe and open its review page
  async function goToReviews(cafe, event) {
    event.stopPropagation();
    const name = cafe?.displayName?.text;
    if (!name) return;
    try {
      const res = await api.get("/cafes");
      const match = (res.data.cafes || []).find(
        (c) => (c.name || "").toLowerCase() === name.toLowerCase(),
      );
      if (match) {
        router.push(`/cafes/${match.id}`);
      } else {
        alert(`No reviews for "${name}" yet. Be the first to review it on the feed!`);
      }
    } catch (e) {
      console.error("Failed to load reviews:", e);
      alert("Could not load reviews right now.");
    }
  }

  useEffect(() => {
    if (!selectedCafe) return;

    itemRefs.current[selectedCafe.id]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [selectedCafe]);

  // console.log(cafes);

  return (
    <aside className="h-[600px] overflow-y-auto rounded-2xl border bg-card shadow-sm">
      <div className="sticky top-0 z-10 border-b bg-card p-4">
        <h2 className="text-lg font-bold">Nearby Cafes</h2>
        <p className="text-sm text-muted-foreground">
          {cafes.length} places found
        </p>
      </div>

      <div className="divide-y">
        {cafes.map((cafe) => {
          const isSelected = selectedCafe?.id === cafe.id;

          return (
            <div
              key={cafe.id}
              ref={(el) => {
                itemRefs.current[cafe.id] = el;
              }}
              onClick={() => onSelectCafe(cafe)}
              className={`w-full p-4 text-left transition ${isSelected ? "bg-accent" : "bg-card hover:bg-muted"
                }`}
            >
              <h3 className="font-semibold leading-snug">
                {cafe.displayName?.text ?? "Cafe"}
              </h3>

              <div className="mt-2 flex items-center gap-2">
                <Badge variant="secondary">
                  ⭐ {cafe.rating ?? "No rating"}
                </Badge>

                <Badge variant="outline">☕ Cafe</Badge>
              </div>

              {/* <p className="mt-2 text-sm text-muted-foreground">
                {cafe.userRatingCount ?? 0} reviews
              </p> */}

              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                📍 {cafe.formattedAddress ?? "No address available"}
              </p>

              {isSelected && (
                <div className="mt-4 rounded-xl bg-background p-3 shadow-sm">
                  <img
                    src={
                      cafe.photos?.[0]?.name
                        ? getPhotoUrl(cafe.photos[0].name)
                        : PLACEHOLDER
                    }
                    alt="Cafe"
                    className="h-40 w-full rounded-lg object-cover"
                  />

                  {/* <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">WiFi</Badge>
                    <Badge variant="secondary">Power</Badge>
                    <Badge variant="secondary">Quiet</Badge>
                  </div> */}

                  <Button
                    variant="outline"
                    className="mt-3 h-8 w-full rounded-full text-sm"
                    onClick={(event) => {
                      event.stopPropagation();
                      const mapsUrl =
                        cafe.googleMapsUri ??
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          cafe.displayName?.text ?? "Cafe"
                        )}&query_place_id=${cafe.id}`;
                      window.open(mapsUrl, "_blank", "noopener,noreferrer");
                    }}

                  >
                    More Info
                  </Button>

                  <Button
                    variant="outline"
                    className="mt-2 h-8 w-full rounded-full text-sm"
                    onClick={(e) => goToReviews(cafe, e)}
                  >
                    Read all reviews
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
