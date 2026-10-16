import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { MapPin, Search, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TrustRing } from "@/components/TrustRing";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categories, discoveryProducers, filterProducers, type CategoryId } from "@/lib/discovery";
import { discoveryAvatars } from "@/lib/discovery-avatars";

const DiscoveryMap = lazy(() => import("@/components/DiscoveryMap"));

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — QPi.money" },
      { name: "description", content: "Explore nearby producers, category maps, available offers and transparent Trust scores." },
      { property: "og:title", content: "Discover — QPi.money" },
      { property: "og:description", content: "Explore nearby producers, category maps, available offers and transparent Trust scores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Discover,
});

function Discover() {
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const producers = useMemo(() => filterProducers(discoveryProducers, category, search), [category, search]);
  const selected = producers.find(producer => producer.id === selectedId);
  const selectedCategory = categories.find(c => c.id === selected?.category);
  const selectProducer = useCallback((id: string) => setSelectedId(id), []);
  function changeCategory(next: CategoryId | "all") { setCategory(next); setSelectedId(null); }
  return (
    <AppShell title="Discover" spatial>
      <div className="discovery-layout">
        <section className="discovery-stories" aria-label="Nearby producer stories">
          <div className="px-4"><label className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input aria-label="Search producers and offers" value={search} onChange={event => { setSearch(event.target.value); setSelectedId(null); }} placeholder="Search producers & offers" className="min-w-0 w-full bg-transparent text-sm outline-none" />{search && <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Clear search" onClick={() => setSearch("")}><X /></Button>}</label></div>
          <div className="flex items-center justify-between gap-2 px-4"><h2 className="text-sm font-semibold">Around Shoreditch</h2><span className="text-[11px] text-muted-foreground">{producers.length} producers · Demo listings</span></div>
          <div className="story-scroll">
            {producers.map(producer => <div key={producer.id} className="producer-story"><TrustRing name={producer.name} initials={producer.initials} input={producer.trust} avatar={discoveryAvatars[producer.id]} onSelect={() => selectProducer(producer.id)} selected={producer.id === selectedId} /><span className="w-full text-center text-xs font-medium leading-snug">{producer.name}</span></div>)}
            {!producers.length && <div className="flex min-h-28 w-full flex-col items-center justify-center gap-2"><p className="text-sm text-muted-foreground">No matching producers</p><Button variant="link" onClick={() => { setSearch(""); changeCategory("all"); }}>Clear filters</Button></div>}
          </div>
        </section>
        <section className="discovery-map-region" aria-label="Producer map">
          <ClientOnly fallback={<MapLoading />}><Suspense fallback={<MapLoading />}><DiscoveryMap producers={producers} selectedId={selectedId} onSelect={selectProducer} /></Suspense></ClientOnly>
          <div className="map-filters" aria-label="Category filters">
            <Button variant={category === "all" ? "default" : "outline"} size="sm" aria-pressed={category === "all"} onClick={() => changeCategory("all")}><CategoryIcon category="all" />All</Button>
            {categories.map(c => <Button key={c.id} variant={category === c.id ? "default" : "outline"} size="sm" aria-pressed={category === c.id} onClick={() => changeCategory(c.id)}><CategoryIcon category={c.id} />{c.label}</Button>)}
          </div>
          {selected && <article className="map-offer-summary" aria-label={`${selected.name} offer summary`}>
            <div className="flex items-start gap-3"><TrustRing name={selected.name} initials={selected.initials} input={selected.trust} avatar={discoveryAvatars[selected.id]} /><div className="min-w-0 flex-1"><h3 className="pr-6 text-base font-semibold leading-snug">{selected.name}</h3><p className="mt-1 text-xs text-muted-foreground">{selectedCategory?.label} · MCC {selectedCategory?.mcc}</p><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{selected.distance} away · Trust score</p></div><Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7" aria-label="Close offer summary" onClick={() => setSelectedId(null)}><X /></Button></div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{selected.description}</p>
            <h4 className="mt-3 text-xs font-semibold">Available offers</h4>
            <ul className="mt-1 divide-y divide-border">{selected.offers.map(offer => <li key={offer.name} className="py-2"><div className="flex items-start justify-between gap-3 text-sm"><span className="font-medium">{offer.name}</span><span className="shrink-0 font-semibold text-primary">{offer.price}</span></div><p className="mt-1 text-xs text-muted-foreground">{offer.detail}</p></li>)}</ul>
          </article>}
        </section>
      </div>
    </AppShell>
  );
}

function MapLoading() { return <div className="grid h-full place-items-center text-sm text-muted-foreground" role="status">Loading map…</div>; }
