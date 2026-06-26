import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CafeCard({ cafe }) {
  const { img, cafeName, address, reviews, tags, priceRange, openingHours } =
    cafe;
  return (
    <div>
      <img src={img} alt={cafeName} />
      <h2 className="text-lg font-bold">{cafeName}</h2>
      <p className="text-gray-600">{address}</p>
      <p className="text-sm text-gray-500">{reviews}</p>
      <p className="text-sm text-gray-500">{priceRange}</p>
      <p className="text-sm text-gray-500">{openingHours}</p>
      <div className="flex gap-2">
        {tags.map((tag) => {
          return (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          );
        })}
      </div>
      <Button variant="outline">Save</Button>
    </div>
  );
}
