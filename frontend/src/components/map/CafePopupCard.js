"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1554118811-1e0d58224f24";

function getPhotoUrl(photoName) {
  return `/cafes/photo?name=${encodeURIComponent(photoName)}`;
}

export default function CafePopupCard({ cafe, onClose }) {
  return (
    <>
      <div className="absolute inset-0 z-10 bg-black/20" onClick={onClose} />

      <div className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2">
        <Card className="w-80 overflow-hidden rounded-3xl border-0 p-0 shadow-2xl">
          <div className="relative">
            <img
              src={
                cafe.photos?.[0]?.name
                  ? getPhotoUrl(cafe.photos[0].name)
                  : PLACEHOLDER
              }
              alt="Cafe"
              className="h-80 w-full object-cover"
            />

            <button
              onClick={onClose}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-2xl font-bold text-white shadow-lg transition hover:bg-black"
            >
              ×
            </button>
          </div>

          <div className="px-5 pb-3">
            <CardTitle className="text-2xl font-bold leading-tight">
              {cafe.displayName?.text ?? "Cafe"}
            </CardTitle>

            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="h-7 rounded-full px-4 text-sm">
                ⭐ {cafe.rating ?? "No rating"}
              </Badge>

              <Badge variant="outline" className="h-7 rounded-full px-4 text-sm">
                ☕ Cafe
              </Badge>
            </div>

            <p className="mt-2 text-sm text-muted-foreground">
              {cafe.userRatingCount ?? 0} reviews
            </p>

            <p className="mt-2 text-sm leading-snug text-muted-foreground">
              📍 {cafe.formattedAddress ?? "No address available"}
            </p>

            <div className="mt-3 flex justify-center">
              <Button variant="outline" className="h-8 rounded-full px-4 text-sm">
                More Info
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
