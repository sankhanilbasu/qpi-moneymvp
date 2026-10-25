import { Car, Bike, CookingPot, Guitar, Palette, Compass } from "lucide-react";
import type { CategoryId } from "@/lib/discovery";

export function CategoryIcon({ category, className = "h-4 w-4" }: { category: CategoryId | "all"; className?: string }) {
  const Icon = { kitchen: CookingPot, courier: Bike, cab: Car, music: Guitar, crafts: Palette, all: Compass }[category];
  return <Icon className={className} aria-hidden="true" />;
}