import CafeSheet from "@/components/cafes/CafeSheet";

export default function Dashboard() {
  return (
    <div className="grid h-screen grid-cols-[280px_1fr]">
      <main className="relative">
        <div>
          <CafeSheet />
        </div>
      </main>
    </div>
  );
}
