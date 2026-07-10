"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CafeCard from "@/components/cafes/CafeCard";
import { Button } from "@/components/ui/button";
import api from "@/api"; // adjust path to your axios instance

export default function BoardCafeCard({ cafe }) {
  const router = useRouter();
  const [visited, setVisited] = useState(cafe.visit_type);

  async function handleToggleVisited() {
    const next = !visited;
    setVisited(next);
    await api.patch(`/lists/${cafe.list_id}`, { visit_type: next });
  }

  async function handleRemove() {
    await api.delete(`/lists/${cafe.list_id}`);
    router.refresh();
  }

  return (
    <div>
      <CafeCard cafe={cafe} />
      <div className="flex gap-2 px-4 pb-4">
        <Button
          className="flex-1"
          variant={visited ? "default" : "outline"}
          onClick={handleToggleVisited}
        >
          {visited ? "✓ Been there" : "Been there"}
        </Button>
        <Button className="flex-1" variant="destructive" onClick={handleRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}