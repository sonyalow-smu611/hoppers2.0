import Map from "@/components/map/Map";
import SearchBar from "@/components/map/SearchBar";

export default function MapPage() {
  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <SearchBar/>

        {/* <Map /> */}
      </div>
    </main>
  );
}