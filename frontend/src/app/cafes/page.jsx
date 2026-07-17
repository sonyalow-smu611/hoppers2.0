"use client";

import { useEffect, useState } from "react";
import CafeList from "../../components/cafes/CafeList";
import api from "../../api";

export default function Cafes() {
  const [cafes, setCafes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCafes = async () => {
      try {
        const response = await api.get("/cafes");

        console.log(response);

        const cafeList = response.data.cafes ?? [];

        const formattedCafeList = cafeList.map((cafe) => ({
          ...cafe,
          tags:
            typeof cafe.tags === "string"
              ? cafe.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              : cafe.tags ?? [],
        }));

        setCafes(formattedCafeList);
      } catch (error) {
        console.error("Failed to fetch cafes:", error);
        setError("Unable to load cafes. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCafes();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full text-center">
        <p>Loading cafes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
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