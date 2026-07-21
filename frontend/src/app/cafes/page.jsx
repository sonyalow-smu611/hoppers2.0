"use client";

import { useEffect, useState } from "react";
import CafeList from "../../components/cafes/CafeList";
import api from "../../api";

export default async function Cafes() {
  let cafeList = [];

  try {
    const response = await api.get("/cafes");
    cafeList = response.data.cafes ?? [];
  } catch (err) {
    console.error("Failed to load cafes:", err.message);
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