import Image from "next/image";
import api from "../api";
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
    <main>
      <h1>Cafes</h1>
      <p>
        {cafeList.map((cafe) => (
          <div key={cafe.id}>
            <h2>{cafe.name}</h2>
            <p>{cafe.description}</p>
          </div>
        ))}
      </p>
      
    </main>
  );
}
