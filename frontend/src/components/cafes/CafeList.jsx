import CafeCard from "./CafeCard";
import ShowcaseCard from "../ui/ShowcaseCard";

export default function CafeList({ cafes }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cafes.map((cafe) => (
                <ShowcaseCard name={cafe.cafeName} description={cafe.description} key={cafe.cafeName}>
                    <CafeCard key={cafe.cafeName} cafe={cafe} />
                </ShowcaseCard>
                
            ))}
        </div>
    );
}