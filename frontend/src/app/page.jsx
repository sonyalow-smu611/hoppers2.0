import Image from "next/image";
import api from "../api";
import { Button } from "@/components/ui/button";
// export default function Home() {
//   return (
//     <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">

//     </div>
//   );
// }

export default async function HomePage() {
  
  const response = await api.get("http://localhost:4000/cafes");

  console.log(response.data);

  const cafeList = response.data.cafes;


  return (
    <div className="flex flex-wrap items-center gap-2 md:flex-row">
      <Button variant="outline">Button</Button>
    </div>
  );
};