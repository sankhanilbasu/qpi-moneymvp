import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { TrustRing } from "@/components/TrustRing";
import { demoProducers } from "@/lib/trust-demo";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — QPi.money" },
      { name: "description", content: "Find trusted producers and offers near you." },
      { property: "og:title", content: "Discover — QPi.money" },
      { property: "og:description", content: "Find trusted producers and offers near you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Discover,
});

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
      <div className="mb-2 mt-6 flex items-center justify-between"><h2 className="text-sm font-semibold text-muted-foreground">Nearby producers</h2><span className="text-xs text-muted-foreground">Demo Trust scores</span></div>
      <div className="flex flex-col gap-2">
        {demoProducers.map((n) => (
          <Card key={n.name} className="flex items-center gap-4">
            <TrustRing name={n.name} initials={n.initials} input={n.trust} />
            <div className="min-w-0">
              <p className="font-medium">{n.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.category} · {n.dist}</p>
              <p className="mt-2 text-xs text-muted-foreground">{n.trust.completedTransactions} completed transactions</p>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
