import api from "@/api";
import BoardCafeCard from "../BoardCafeCard";

export default async function BoardPage({ params }) {
  const { title } = await params;
  const decodedTitle = decodeURIComponent(title);

  const response = await api.get("/lists");
  const board = response.data.lists.find((l) => l.title === decodedTitle);

  if (!board) return <p className="p-6">List not found.</p>;

  const cafes = board.cafes.map((cafe) => ({
    ...cafe,
    tags: cafe.tags
      ? cafe.tags.split(",").map((t) => t.trim())
      : [],
  }));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">{board.title}</h1>
      <p className="text-muted-foreground mb-6">{board.notes}</p>

      <div className="space-y-6">
        {cafes.map((cafe) => (
          <BoardCafeCard key={cafe.list_id} cafe={cafe} />
        ))}
      </div>
    </div>
  );
}