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
import Navbar from "@/components/general/Navbar";
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
