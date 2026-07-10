import {
  Sidebar,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function AppSidebar() {
  return (
    <div>
      <Sidebar>
        <SidebarHeader className="p-6">
          <SidebarGroup className="space-y-6">
            <SidebarGroupLabel className="text-xl font-semibold">
              Cafe Filters
            </SidebarGroupLabel>

            <SidebarGroupContent className="space-y-4">
              <div>
                <h4>Distance</h4>
                <Slider defaultValue={[33]} max={100} step={1} />
              </div>
              <div>
                <h4>Price</h4>
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="$">SGD20</SelectItem>
                      <SelectItem value="$$">SGD20 - SGD50</SelectItem>
                      <SelectItem value="$$$">SGD50+</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <h4>Tags</h4>
                <ToggleGroup
                  className="flex flex-wrap justify-start gap-2"
                  variant="outline"
                  type="multiple"
                >
                  <ToggleGroupItem value="aesthetic">Aesthetic</ToggleGroupItem>
                  <ToggleGroupItem value="quiet">Quiet</ToggleGroupItem>
                  <ToggleGroupItem value="pet-friendly">
                    Pet-friendly
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dessert">Dessert</ToggleGroupItem>
                </ToggleGroup>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarHeader>
      </Sidebar>
    </div>
  );
}
