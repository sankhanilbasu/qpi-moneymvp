import { Car, Bike, CookingPot, Guitar, Palette, Compass, Flower2, Sparkles, HeartHandshake, Dumbbell, Flower } from "lucide-react";
import type { CategoryId } from "@/lib/discovery";

export function CategoryIcon({ category, className = "h-4 w-4" }: { category: CategoryId | "all"; className?: string }) {
  const Icon = { kitchen: CookingPot, courier: Bike, cab: Car, music: Guitar, crafts: Palette, yoga: Flower2, beauty: Sparkles, therapy: HeartHandshake, fitness: Dumbbell, florist: Flower, all: Compass }[category];
  return <Icon className={className} aria-hidden="true" />;
}
