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

  const formattedCafeList = cafeList.map((cafe) => ({
    ...cafe,
    tags: cafe.tags.split(",").map((tag) => tag.trim()),
  }));
  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-4 text-center">Cafes Near you</h1>
      <CafeList cafes={formattedCafeList} />
    </div>
  );
}
