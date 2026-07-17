import api from "@/api";
import BoardCollageCard from "./BoardCollageCard";

export default async function SavedListPage() {
  const response = await api.get("/lists");
  const boards = response.data.lists;

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved Lists</h1>
        <p className="text-sm text-muted-foreground">
          Your curated cafe boards
        </p>
      </div>

      {boards.length === 0 ? (
        <p className="text-sm text-muted-foreground">No saved lists yet.</p>
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
