import Map from "@/components/map/Map";

export default function MapPage() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <input
          placeholder="Search for cafes..."
          className="w-full rounded-full border px-5 py-3 text-sm shadow-sm"
        />

        <Map />
      </div>
    </main>
  );
}