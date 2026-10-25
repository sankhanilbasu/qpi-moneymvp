import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card } from "@/components/AppShell";
import { CategoryIcon } from "@/components/CategoryIcon";
import { LocationPicker, type PickedLocation } from "@/components/maps/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Fulfilment } from "@/lib/commitments";
import { categories, formatPrice, SANDBOX_CENTER, type CategoryId } from "@/lib/discovery";
import { fileToDataUrl } from "@/lib/images";
import { getState, newId, saveOffer, saveStorefront } from "@/lib/sandbox-store";

export const Route = createFileRoute("/create")({
  validateSearch: (search: Record<string, unknown>): { edit?: string | undefined } => (typeof search["edit"] === "string" ? { edit: search["edit"] } : {}),
  head: () => ({
    meta: [
      { title: "Create — QPi.money" },
      { name: "description", content: "Set up your storefront and create offers." },
      { property: "og:title", content: "Create — QPi.money" },
      { property: "og:description", content: "Set up your storefront and create offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Create,
});

const steps = ["Storefront", "Offer", "Terms", "Review"];

function Create() {
  const { edit } = Route.useSearch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [shop, setShop] = useState({ name: "", category: "kitchen" as CategoryId, description: "" });
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [offer, setOffer] = useState({ title: "", price: 10, description: "", photo: undefined as string | undefined });
  const [terms, setTerms] = useState({ fulfilment: "pickup" as Fulfilment, schedule: "Weekdays 9am–5pm" });
  useEffect(() => {
    const s = getState();
    if (s.storefront) { setShop({ name: s.storefront.name, category: s.storefront.category, description: s.storefront.description }); setLocation({ position: s.storefront.position, label: "Saved storefront location" }); }
    else if (s.user?.home) setLocation({ position: s.user.home, label: "Your home location" });
    const existing = edit ? s.offers.find(o => o.id === edit) : undefined;
    if (existing) { setOffer({ title: existing.title, price: existing.price, description: existing.description, photo: existing.photo }); setTerms({ fulfilment: existing.fulfilment, schedule: existing.schedule }); if (s.storefront) setStep(1); }
  }, [edit]);

  const valid = [shop.name.trim() && shop.description.trim() && location, offer.title.trim() && offer.price > 0, terms.schedule.trim(), true];
  async function photo(file: File) { try { const p = await fileToDataUrl(file, 480); setOffer(o => ({ ...o, photo: p })); } catch (e) { toast.error((e as Error).message); } }
  function publish() {
    if (!location) return;
    try {
      saveStorefront({ ...shop, name: shop.name.trim(), position: location.position });
      const existing = edit ? getState().offers.find(o => o.id === edit) : undefined;
      saveOffer({ id: existing?.id ?? newId("o"), title: offer.title.trim(), price: offer.price, photo: offer.photo, description: offer.description.trim(), fulfilment: terms.fulfilment, schedule: terms.schedule.trim(), paused: existing?.paused ?? false, createdAt: existing?.createdAt ?? Date.now() });
      toast.success(existing ? "Offer updated" : "Offer published to Discover");
      navigate({ to: "/offer/$id", params: { id: "me" } });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <AppShell title={edit ? "Edit offer" : "Create"}>
      <div className="mb-5 flex gap-1.5">{steps.map((s, i) => <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
      <p className="text-xs text-muted-foreground">Step {step + 1} of {steps.length}</p>
      <h2 className="mb-4 text-xl font-semibold">{steps[step]}</h2>
      <Card className="flex flex-col gap-3">
        {step === 0 && <>
          <div className="flex flex-col gap-1.5"><Label htmlFor="shop">Storefront name</Label><Input id="shop" value={shop.name} onChange={e => setShop({ ...shop, name: e.target.value })} placeholder="e.g. Morgan's Kitchen" /></div>
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">{categories.map(c => <Button key={c.id} type="button" size="sm" variant={shop.category === c.id ? "default" : "outline"} onClick={() => setShop({ ...shop, category: c.id })}><CategoryIcon category={c.id} />{c.label}</Button>)}</div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="desc">Description</Label><Textarea id="desc" rows={3} value={shop.description} onChange={e => setShop({ ...shop, description: e.target.value })} placeholder="What do you offer?" /></div>
          <Label>Location</Label><LocationPicker value={location} onChange={setLocation} center={SANDBOX_CENTER} label="Storefront location" />
        </>}
        {step === 1 && <>
          <div className="flex flex-col gap-1.5"><Label htmlFor="title">Offer title</Label><Input id="title" value={offer.title} onChange={e => setOffer({ ...offer, title: e.target.value })} /></div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="oprice">Price (£)</Label><Input id="oprice" type="number" min={0.5} step={0.5} value={offer.price} onChange={e => setOffer({ ...offer, price: Number(e.target.value) })} /></div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
            {offer.photo ? <img src={offer.photo} alt="Offer" className="h-16 w-16 rounded-lg object-cover" /> : <ImagePlus className="h-6 w-6" />}{offer.photo ? "Change photo" : "Add a photo"}
            <input type="file" accept="image/*" className="sr-only" aria-label="Offer photo" onChange={e => { const f = e.target.files?.[0]; if (f) void photo(f); }} />
          </label>
          <div className="flex flex-col gap-1.5"><Label htmlFor="odesc">Description</Label><Textarea id="odesc" rows={3} value={offer.description} onChange={e => setOffer({ ...offer, description: e.target.value })} /></div>
        </>}
        {step === 2 && <>
          <Label>Fulfilment</Label>
          <div className="grid grid-cols-2 gap-2">{(["pickup", "delivery"] as const).map(f => <Button key={f} type="button" variant={terms.fulfilment === f ? "default" : "outline"} onClick={() => setTerms({ ...terms, fulfilment: f })}>{f === "pickup" ? "Pickup / in person" : "Delivery / ride"}</Button>)}</div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="sched">Schedule</Label><Input id="sched" value={terms.schedule} onChange={e => setTerms({ ...terms, schedule: e.target.value })} /></div>
        </>}
        {step === 3 && <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Storefront</dt><dd>{shop.name} · {categories.find(c => c.id === shop.category)?.label}</dd>
          <dt className="text-muted-foreground">Offer</dt><dd>{offer.title} · {formatPrice(offer.price)}</dd>
          <dt className="text-muted-foreground">Terms</dt><dd>{terms.fulfilment === "delivery" ? "Delivery" : "Pickup"} · {terms.schedule}</dd>
          <dt className="text-muted-foreground">Location</dt><dd className="truncate">{location?.label}</dd>
        </dl>}
      </Card>
      <div className="mt-5 flex gap-3">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)} className="h-12 flex-1 rounded-xl">Back</Button>
        <Button disabled={!valid[step]} onClick={() => (step === steps.length - 1 ? publish() : setStep(step + 1))} className="h-12 flex-1 rounded-xl">{step === steps.length - 1 ? (edit ? "Save" : "Publish") : "Next"}</Button>
      </div>
    </AppShell>
  );
}
