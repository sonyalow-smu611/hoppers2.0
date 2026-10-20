"use client";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import api from "@/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function CafeCard({ cafe, showSave = true }) {
  const {
    address,
    description,
    id,
    latitude,
    longitude,
    name,
    picture,
    price_range,
    tags,
  } = cafe;
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const cafeTags = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

  async function handleSave() {
    if (!isLoaded || saving || saved) return;
    if (!isSignedIn) {
      router.push("/auth/login");
      return;
    }

    setSaving(true);
    setSaveError("");
    try {
      const token = await getToken();
      await api.post(
        "/lists/saved-list",
        { cafe_id: id, cafe },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSaved(true);
    } catch (error) {
      console.error("Failed to save cafe:", error);
      setSaveError(
        error.response?.data?.error ?? "Couldn't save this cafe. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            {picture ? (
              <img
                src={picture}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <p className="text-sm text-gray-500">No image available</p>
              </div>
            )} 
          </CarouselItem>
          <CarouselItem>
            {picture ? (
              <img
                src={picture}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <p className="text-sm text-gray-500">No image available</p>
              </div>
            )}
          </CarouselItem>
          <CarouselItem>
            {picture ? (
              <img
                src={picture}
                alt={name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-200">
                <p className="text-sm text-gray-500">No image available</p>
              </div>
            )}
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold">{name}</h2>

            <Badge variant="secondary">{"$".repeat(price_range)}</Badge>
          </div>

          <p className="text-sm text-muted-foreground">{address}</p>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        {cafeTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {cafeTags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          📍 {latitude}, {longitude}
        </p>

        {showSave && (
          <>
            <Button
              className="w-full"
              variant="outline"
              onClick={handleSave}
              disabled={!isLoaded || saving || saved}
            >
              {!isLoaded
                ? "Loading..."
                : saving
                  ? "Saving..."
                  : saved
                    ? "♥ Saved"
                    : isSignedIn
                      ? "♡ Save"
                      : "Sign in to save"}
            </Button>
            {saveError && (
              <p role="alert" className="text-sm text-red-600">
                {saveError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
