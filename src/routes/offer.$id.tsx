import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { MapPin, MessageCircle } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { TrustRing } from "@/components/TrustRing";
import { Button } from "@/components/ui/button";
import { LazyMap } from "@/components/maps/LazyMap";
import { categories, formatPrice } from "@/lib/discovery";
import { discoveryAvatars } from "@/lib/discovery-avatars";
import { useProducers } from "@/lib/marketplace";
import { openThread } from "@/lib/sandbox-store";

export const Route = createFileRoute("/offer/$id")({
  head: () => ({
    meta: [
      { title: "Storefront — QPi.money" },
      { name: "description", content: "Producer offers, location and Trust score on QPi.money." },
      { property: "og:title", content: "Storefront — QPi.money" },
      { property: "og:description", content: "Producer offers, location and Trust score on QPi.money." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OfferPage,
});

function OfferPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const navigate = useNavigate();
  const producer = useProducers().find(p => p.id === id);
  if (!producer) return <AppShell title="Storefront" back={() => router.history.back()}><Card><p className="text-sm">This storefront isn't available.</p><Button asChild variant="link" className="px-0"><Link to="/discover">Back to Discover</Link></Button></Card></AppShell>;
  const category = categories.find(c => c.id === producer.category);
  const own = producer.kind === "own";
  function chat(offerId?: string) {
    const threadId = openThread(producer!.id, producer!.name);
    navigate({ to: "/chat/$id", params: { id: threadId }, search: offerId ? { offer: offerId } : {} });
  }
  return (
    <AppShell title={producer.name} back={() => router.history.back()}>
      <section className="flex items-center gap-4">
        <TrustRing name={producer.name} initials={producer.initials} input={producer.trust} avatar={discoveryAvatars[producer.id] ?? producer.offers[0]?.photo} source={own ? "Your sandbox activity" : "Illustrative transaction history"} />
        <div className="min-w-0"><p className="text-xs text-muted-foreground">{category?.label} · MCC {category?.mcc}</p><p className="mt-1 text-sm">{producer.description}</p><p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{producer.distance}{own ? "" : " · Demo listing"}</p></div>
      </section>
      <LazyMap className="mt-4 h-40" center={producer.position} zoom={15} markers={[{ id: producer.id, position: producer.position, label: producer.name, tone: "primary" }]} />
      <h2 className="mb-2 mt-5 text-sm font-semibold">Offers</h2>
      <div className="flex flex-col gap-2">
        {producer.offers.map(offer => (
          <Card key={offer.id} className="flex gap-3">
            {offer.photo && <img src={offer.photo} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />}
            <div className="min-w-0 flex-1">
              <div className="flex justify-between gap-2"><p className="font-medium">{offer.name}</p><p className="font-semibold text-primary">{formatPrice(offer.price)}</p></div>
              <p className="text-xs text-muted-foreground">{offer.detail}</p>
              {!own && <Button size="sm" className="mt-2 rounded-full" onClick={() => chat(offer.id)}>Request</Button>}
            </div>
          </Card>
        ))}
      </div>
      {own ? <Button asChild variant="outline" className="mt-5 h-12 w-full rounded-xl"><Link to="/profile">Manage storefront</Link></Button>
        : <Button variant="outline" className="mt-5 h-12 w-full rounded-xl" onClick={() => chat()}><MessageCircle />Message {producer.name}</Button>}
    </AppShell>
  );
}
