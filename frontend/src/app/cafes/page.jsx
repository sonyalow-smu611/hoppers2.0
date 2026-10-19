"use client";

import { useEffect, useState } from "react";
import CafeList from "../../components/cafes/CafeList";
import api from "../../api";

export default function Cafes() {
  const [cafes, setCafes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCafes() {
      try {
        const response = await api.get("/cafes");
        setCafes(response.data.cafes ?? []);
      } catch (err) {
        console.error("Failed to load cafes:", err.message);
        setError("Failed to load cafes.");
      } finally {
        setLoading(false);
      }
    }

    fetchCafes();
  }, []);

  if (loading) {
    return <p className="p-6 text-sm text-muted-foreground">Loading cafes...</p>;
  }

  if (error) {
    return <p className="p-6 text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="w-full">
      <h1 className="mb-4 text-center text-3xl font-bold">
        Cafes Near You
      </h1>

      <CafeList cafes={cafes} />
    </div>
  );
}
