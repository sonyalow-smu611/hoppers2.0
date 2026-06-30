import Image from "next/image";
import api from "../api";
import Dashboard from "../app/Dashboard/page";
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
    <>
      <h1>Insert map here</h1>
      <Dashboard />
    </>
  );
}
