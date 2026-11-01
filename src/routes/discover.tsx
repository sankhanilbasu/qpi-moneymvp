import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import { LayoutList, Map as MapIcon } from "lucide-react";
import { FeedPost } from "@/components/FeedPost";
import { useSandbox } from "@/lib/sandbox-store";
import { MapPin, Search, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TrustRing } from "@/components/TrustRing";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/CategoryIcon";
import { categories, filterProducers, type CategoryId } from "@/lib/discovery";
import { OfferPrice } from "@/components/OfferPrice";
import { useProducers } from "@/lib/marketplace";
import { Link } from "@tanstack/react-router";
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
  validateSearch: (s: Record<string, unknown>): { view?: "feed" | "map" } => (s["view"] === "map" ? { view: "map" } : {}),
  component: Discover,
});

function Discover() {
  const allProducers = useProducers();
  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const producers = useMemo(() => filterProducers(allProducers, category, search), [allProducers, category, search]);
  const selected = producers.find(producer => producer.id === selectedId);
  const selectedCategory = categories.find(c => c.id === selected?.category);
  const view = Route.useSearch().view ?? "feed";
  const navigate = Route.useNavigate();
  const likes = useSandbox().likes ?? [];
  const postRefs = useRef(new Map<string, HTMLElement>());
  const selectProducer = useCallback((id: string) => setSelectedId(id), []);
  function tapStory(id: string) { setSelectedId(id); if (view === "feed") postRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  const toggle = <div className="flex rounded-full border border-border p-0.5" role="group" aria-label="Discover view">
    <Button variant={view === "feed" ? "default" : "ghost"} size="icon" className="h-8 w-8 rounded-full" aria-label="Feed view" aria-pressed={view === "feed"} onClick={() => navigate({ search: {} })}><LayoutList /></Button>
    <Button variant={view === "map" ? "default" : "ghost"} size="icon" className="h-8 w-8 rounded-full" aria-label="Map view" aria-pressed={view === "map"} onClick={() => navigate({ search: { view: "map" } })}><MapIcon /></Button>
  </div>;
  const chips = <><Button variant={category === "all" ? "default" : "outline"} size="sm" aria-pressed={category === "all"} onClick={() => changeCategory("all")}><CategoryIcon category="all" />All</Button>
    {categories.map(c => <Button key={c.id} variant={category === c.id ? "default" : "outline"} size="sm" aria-pressed={category === c.id} onClick={() => changeCategory(c.id)}><CategoryIcon category={c.id} />{c.label}</Button>)}</>;
  function changeCategory(next: CategoryId | "all") { setCategory(next); setSelectedId(null); }
  return (
    <AppShell title="Discover" spatial actions={toggle}>
      <div className={view === "map" ? "discovery-layout" : "discovery-feed-layout"}>
        <section className="discovery-stories" aria-label="Nearby producer stories">
          <div className="px-4"><label className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5"><Search className="h-4 w-4 shrink-0 text-muted-foreground" /><input aria-label="Search producers and offers" value={search} onChange={event => { setSearch(event.target.value); setSelectedId(null); }} placeholder="Search producers & offers" className="min-w-0 w-full bg-transparent text-sm outline-none" />{search && <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Clear search" onClick={() => setSearch("")}><X /></Button>}</label></div>
          <div className="flex items-center justify-between gap-2 px-4"><h2 className="text-sm font-semibold">Around Bandra, Mumbai</h2><span className="text-[11px] text-muted-foreground">{producers.length} producers · Demo listings marked</span></div>
          <div className="story-scroll">
            {producers.map(producer => <div key={producer.id} className="producer-story"><TrustRing name={producer.name} initials={producer.initials} input={producer.trust} avatar={discoveryAvatars[producer.id] ?? producer.offers[0]?.photo} onSelect={() => tapStory(producer.id)} selected={producer.id === selectedId} /><span className="w-full text-center text-xs font-medium leading-snug">{producer.name}</span></div>)}
            {!producers.length && <div className="flex min-h-28 w-full flex-col items-center justify-center gap-2"><p className="text-sm text-muted-foreground">No matching producers</p><Button variant="link" onClick={() => { setSearch(""); changeCategory("all"); }}>Clear filters</Button></div>}
          </div>
        </section>
        {view === "feed" ? <section aria-label="Storefront feed"><div className="feed-chips" aria-label="Category filters">{chips}</div>
          {producers.map(p => <FeedPost key={p.id} ref={el => { if (el) postRefs.current.set(p.id, el); else postRefs.current.delete(p.id); }} producer={p} liked={likes.includes(p.id)} selected={p.id === selectedId} />)}
        </section> :
        <section className="discovery-map-region" aria-label="Producer map">
          <ClientOnly fallback={<MapLoading />}><Suspense fallback={<MapLoading />}><DiscoveryMap producers={producers} selectedId={selectedId} onSelect={selectProducer} /></Suspense></ClientOnly>
          <div className="map-filters" aria-label="Category filters">{chips}</div>
          {selected && <article className="map-offer-summary" aria-label={`${selected.name} offer summary`}>
            <div className="flex items-start gap-3"><TrustRing name={selected.name} initials={selected.initials} input={selected.trust} avatar={discoveryAvatars[selected.id]} /><div className="min-w-0 flex-1"><h3 className="pr-6 text-base font-semibold leading-snug">{selected.name}</h3><p className="mt-1 text-xs text-muted-foreground">{selectedCategory?.label} · MCC {selectedCategory?.mcc}</p><p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{selected.distance} away · Trust score</p></div><Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7" aria-label="Close offer summary" onClick={() => setSelectedId(null)}><X /></Button></div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{selected.description}</p>
            <h4 className="mt-3 text-xs font-semibold">Available offers</h4>
            <ul className="mt-1 divide-y divide-border">{selected.offers.map(offer => <li key={offer.id} className="py-2"><div className="flex flex-wrap items-start justify-between gap-3 text-sm"><span className="font-medium">{offer.name}</span><OfferPrice offer={offer} /></div><p className="mt-1 text-xs text-muted-foreground">{offer.detail}</p></li>)}</ul>
            <Button asChild className="mt-2 w-full rounded-full"><Link to="/offer/$id" params={{ id: selected.id }}>{selected.kind === "own" ? "View your storefront" : "View offers & message"}</Link></Button>
          </article>}
        </section>}
      </div>
    </AppShell>
  );
}

function MapLoading() { return <div className="grid h-full place-items-center text-sm text-muted-foreground" role="status">Loading map…</div>; }
