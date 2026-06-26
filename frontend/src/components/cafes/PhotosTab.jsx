"use client";
import { useState } from "react";

const mockImages = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1491895200222-0fc4a4c35e18?auto=format&fit=crop&w=800&q=80",
];

export default function PhotosCard({ images = mockImages }) {
  const [current, setCurrent] = useState(0);
  return (
    <div className="relative w-full max-w-xl">
      <h2 className="text-2xl font-bold text-[#14345B] mb-4">Cafe Photos</h2>
      <img 
        src={images[current]} 
        className="w-full h-auto rounded-lg" />
      
      {current > 0 && (
        <button
          onClick={() => setCurrent(current - 1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10"
        >
          ←
        </button>
      )}

      {current < images.length - 1 && (
        <button
          onClick={() => setCurrent(current + 1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white shadow rounded-full w-10 h-10"
        >
          →
        </button>
      )}
    </div>
  );
}
