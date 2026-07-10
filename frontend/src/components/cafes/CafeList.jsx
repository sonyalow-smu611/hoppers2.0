import CafeCard from "./CafeCard";
import ShowcaseCard from "../ui/ShowcaseCard";

export default function CafeList({ cafes }) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {cafes.map((cafe) => (
        <ShowcaseCard key={cafe.id}>
          <CafeCard cafe={cafe} />
        </ShowcaseCard>
      ))}
    </div>
  );
}