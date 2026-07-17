"use client";

import { useEffect, useState } from "react";
import api from "@/api";
import BoardCollageCard from "./BoardCollageCard";

export default function SavedListPage() {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await api.get("/lists");
        setBoards(response.data.lists ?? []);
      } catch (error) {
        console.error("Failed to fetch saved lists:", error);
        setError("Unable to load your saved lists.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, []);

  if (isLoading) {
    return (
      <main className="space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          Loading saved lists...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6 p-6">
        <p className="text-sm text-red-500">{error}</p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved Lists</h1>
        <p className="text-sm text-muted-foreground">
          Your curated cafe boards
        </p>
      </div>

      {boards.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No saved lists yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {boards.map((board) => (
            <BoardCollageCard
              key={`${board.user_id}-${board.title}`}
              board={board}
            />
          ))}
        </div>
      )}
    </main>
  );
}