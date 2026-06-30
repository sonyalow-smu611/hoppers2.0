"use client";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function CafeCard({ cafe }) {
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
  return (
    <div className="w-full">
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <img src={picture} alt={name} />
          </CarouselItem>
          <CarouselItem>
            <img src={picture} alt={name} />
          </CarouselItem>
          <CarouselItem>
            <img src={picture} alt={name} />
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

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          📍 {latitude}, {longitude}
        </p>

        <Button className="w-full" variant="outline">
          Save
        </Button>
      </div>
    </div>
  );
}
