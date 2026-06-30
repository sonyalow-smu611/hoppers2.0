import api from "../../api";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import CafeCard from "./CafeCard";
const mockCafes = [
  {
    img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y2FmZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
    cafeName: "Cafe name",
    address: "This is a simple presentational card built from plain HTML tags.",
    reviews: "5 stars",
    tags: ["cozy", "wifi", "outdoor seating"],
    priceRange: "$$",
    openingHours: "8:00 AM - 10:00 PM",
  },
];

export default async function CafeSheet() {
  const response = await api.get("http://localhost:4000/cafes");

  // console.log(response.data);

  // this is an array of objects, tags is a string separated by commas
  const cafeList = response.data.cafes;
  console.log(cafeList);

  const formattedCafeList = cafeList.map((cafe) => ({
    ...cafe,
    tags: cafe.tags.split(",").map((tag) => tag.trim()),
  }));
  return (
    <>
      {formattedCafeList.map((cafe) => (
        <Sheet key={cafe.id}>
          <SheetTrigger asChild>
            <Button variant="outline">{cafe.name}</Button>
          </SheetTrigger>
          <SheetContent>
            <CafeCard cafe={cafe} />
          </SheetContent>
        </Sheet>
      ))}
    </>
  );
}
