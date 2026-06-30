import CafeList from "../../components/cafes/CafeList";
import api from "../../api";

export default async function Cafes() {
  const response = await api.get("http://localhost:4000/cafes");
  const cafeList = response.data.cafes;
  console.log(cafeList);

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
