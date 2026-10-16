import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — QPi.money" },
      { name: "description", content: "Find trusted producers and offers near you." },
      { property: "og:title", content: "Discover — QPi.money" },
      { property: "og:description", content: "Find trusted producers and offers near you." },
    ],
  }),
  component: Discover,
});

const nearby = [
  { name: "Riverside Bakery", dist: "0.4 km", score: 94 },
  { name: "Copperleaf Farm", dist: "1.2 km", score: 88 },
  { name: "Atlas Repair Co.", dist: "2.7 km", score: 91 },
];

function Discover() {
  return (
    <AppShell title="Discover">
      <label className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input placeholder="Search nearby producers & offers" className="w-full bg-transparent text-sm outline-none" />
      </label>
      <div className="relative mt-4 h-48 overflow-hidden rounded-2xl bg-gradient-copper">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(var(--primary-foreground)_1px,transparent_1px)] [background-size:16px_16px]" />
        {[["30%", "40%"], ["62%", "28%"], ["48%", "70%"]].map(([l, t], i) => (
          <MapPin key={i} className="absolute h-7 w-7 text-primary-foreground" style={{ left: l, top: t }} />
        ))}
        <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium">Within 5 km</span>
      </div>
      <h2 className="mb-2 mt-6 text-sm font-semibold text-muted-foreground">Nearby</h2>
      <div className="flex flex-col gap-2">
        {nearby.map((n) => (
          <Card key={n.name} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{n.name}</p>
              <p className="text-xs text-muted-foreground">{n.dist}</p>
            </div>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-primary">{n.score}</span>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
