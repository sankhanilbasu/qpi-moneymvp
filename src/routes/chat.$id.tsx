import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { FileSignature, MapPin, Navigation, Send } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LazyMap } from "@/components/maps/LazyMap";
import { LocationPicker, type PickedLocation } from "@/components/maps/LocationPicker";
import type { Commitment, CommitmentAction, Fulfilment } from "@/lib/commitments";
import { formatPrice, SANDBOX_CENTER } from "@/lib/discovery";
import { useProducers } from "@/lib/marketplace";
import { actOnCommitment, proposeCommitment, sendMessage, useSandbox } from "@/lib/sandbox-store";

export const Route = createFileRoute("/chat/$id")({
  validateSearch: (search: Record<string, unknown>): { offer?: string | undefined } => (typeof search["offer"] === "string" ? { offer: search["offer"] } : {}),
  head: () => ({
    meta: [
      { title: "Conversation — QPi.money" },
      { name: "description", content: "Chat, share locations and agree commitments with escrow." },
      { property: "og:title", content: "Conversation — QPi.money" },
      { property: "og:description", content: "Chat, share locations and agree commitments with escrow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Thread,
});

function act(id: string, action: CommitmentAction) {
  try { actOnCommitment(id, action); } catch (e) { toast.error((e as Error).message); }
}

function Thread() {
  const { id } = Route.useParams();
  const { offer: offerId } = Route.useSearch();
  const navigate = useNavigate();
  const s = useSandbox();
  const thread = s.threads.find(t => t.id === id);
  const producer = useProducers().find(p => p.id === thread?.producerId);
  const messages = useMemo(() => s.messages.filter(m => m.threadId === id), [s.messages, id]);
  const [text, setText] = useState("");
  const [sharing, setSharing] = useState(false);
  const [composing, setComposing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (offerId) setComposing(true); }, [offerId]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

  if (!thread) return <AppShell title="Chat" back={() => navigate({ to: "/chat" })}><p className="text-sm text-muted-foreground">Conversation not found.</p></AppShell>;
  const send = (e: React.FormEvent) => { e.preventDefault(); if (!text.trim()) return; sendMessage({ threadId: id, from: "me", text: text.trim() }); setText(""); };

  return (
    <AppShell title={thread.producerName} back={() => navigate({ to: "/chat" })}>
      <div className="flex flex-col gap-3 pb-20">
        {messages.map(m => {
          const c = m.commitmentId ? s.commitments.find(x => x.id === m.commitmentId) : undefined;
          if (m.from === "system") return <p key={m.id} className="text-center text-[11px] text-muted-foreground">{m.text}</p>;
          return (
            <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl ${c || m.location ? "w-full border border-border bg-card p-3" : m.from === "me" ? "bg-primary px-3 py-2 text-primary-foreground" : "bg-muted px-3 py-2"}`}>
                {m.text && <p className="text-sm">{m.text}</p>}
                {m.location && <><p className="mb-2 flex items-center gap-1 text-xs font-medium"><MapPin className="h-3 w-3" />{m.location.label}</p><LazyMap className="h-32" center={m.location.position} zoom={15} markers={[{ id: m.id, position: m.location.position, label: m.location.label, tone: "primary" }]} /></>}
                {c && <CommitmentCard c={c} />}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="fixed bottom-[calc(64px+env(safe-area-inset-bottom))] left-1/2 z-[550] flex w-full max-w-md -translate-x-1/2 items-center gap-1.5 border-t border-border bg-background px-3 py-2">
        <Button type="button" variant="ghost" size="icon" aria-label="Share location" onClick={() => setSharing(true)}><MapPin /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="New commitment" onClick={() => setComposing(true)} disabled={!producer || producer.kind === "own"}><FileSignature /></Button>
        <Input aria-label="Message" value={text} onChange={e => setText(e.target.value)} placeholder="Message" className="flex-1" />
        <Button type="submit" size="icon" aria-label="Send" disabled={!text.trim()}><Send /></Button>
      </form>
      <ShareLocation open={sharing} onClose={() => setSharing(false)} onShare={loc => sendMessage({ threadId: id, from: "me", location: loc })} center={s.user?.home ?? SANDBOX_CENTER} />
      {producer && <NewCommitment open={composing} onClose={() => { setComposing(false); if (offerId) navigate({ to: "/chat/$id", params: { id }, search: {}, replace: true }); }} threadId={id} producer={producer} offerId={offerId} home={s.user?.home} />}
    </AppShell>
  );
}

function ShareLocation({ open, onClose, onShare, center }: { open: boolean; onClose: () => void; onShare: (l: PickedLocation) => void; center: [number, number] }) {
  const [loc, setLoc] = useState<PickedLocation | null>(null);
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle>Share a location</DialogTitle><DialogDescription>Search an address or tap the map.</DialogDescription></DialogHeader>
        <LocationPicker value={loc} onChange={setLoc} center={center} />
        <Button disabled={!loc} onClick={() => { if (loc) { onShare(loc); setLoc(null); onClose(); } }}>Share</Button>
      </DialogContent>
    </Dialog>
  );
}

type ProducerLite = ReturnType<typeof useProducers>[number];
function NewCommitment({ open, onClose, threadId, producer, offerId, home }: { open: boolean; onClose: () => void; threadId: string; producer: ProducerLite; offerId: string | undefined; home: [number, number] | undefined }) {
  const offer = producer.offers.find(o => o.id === offerId) ?? producer.offers[0];
  const [item, setItem] = useState(offer?.name ?? "");
  const [quantityText, setQuantityText] = useState("1");
  const qty = Number(quantityText);
  const [price, setPrice] = useState(offer?.price ?? 10);
  const [when, setWhen] = useState(() => new Date(Date.now() + 3_600_000 - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));
  const [fulfilment, setFulfilment] = useState<Fulfilment>(offer?.fulfilment ?? "pickup");
  const [pickup, setPickup] = useState<PickedLocation | null>({ position: producer.position, label: producer.name });
  const [dropoff, setDropoff] = useState<PickedLocation | null>(home ? { position: home, label: "Your home" } : null);
  useEffect(() => { if (open && offer) { setItem(offer.name); setPrice(offer.price); setFulfilment(offer.fulfilment); } }, [open, offer]);
  const valid = item.trim() && Number.isInteger(qty) && qty >= 1 && price > 0 && (fulfilment === "pickup" || (pickup && dropoff));
  function submit() {
    if (!valid) return;
    proposeCommitment({ threadId, producerId: producer.id, sellerName: producer.name, item: item.trim(), quantity: qty, unitPrice: price, scheduledFor: new Date(when).getTime(), fulfilment, pickup: fulfilment === "delivery" ? pickup?.position : undefined, dropoff: fulfilment === "delivery" ? dropoff?.position : undefined });
    onClose();
  }
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto rounded-lg">
        <DialogHeader><DialogTitle>New commitment</DialogTitle><DialogDescription>Funds are held in sandbox escrow once {producer.name} accepts.</DialogDescription></DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5"><Label htmlFor="item">Item</Label><Input id="item" value={item} onChange={e => setItem(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5"><Label htmlFor="qty">Quantity</Label><Input id="qty" type="number" inputMode="numeric" min={1} step={1} value={quantityText} onChange={e => setQuantityText(e.target.value)} /></div>
            <div className="flex flex-col gap-1.5"><Label htmlFor="price">Unit price (₹)</Label><Input id="price" type="number" min={0.5} step={0.5} value={price} onChange={e => setPrice(Number(e.target.value))} /></div>
          </div>
          <div className="flex flex-col gap-1.5"><Label htmlFor="when">Scheduled for</Label><Input id="when" type="datetime-local" value={when} onChange={e => setWhen(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-2">{(["pickup", "delivery"] as const).map(f => <Button key={f} type="button" variant={fulfilment === f ? "default" : "outline"} onClick={() => setFulfilment(f)}>{f === "pickup" ? "Pickup / in person" : "Delivery / ride"}</Button>)}</div>
          {fulfilment === "delivery" && <>
            <Label>Pickup point</Label><LocationPicker value={pickup} onChange={setPickup} center={producer.position} label="Pickup point" />
            <Label>Drop-off point</Label><LocationPicker value={dropoff} onChange={setDropoff} center={home ?? SANDBOX_CENTER} label="Drop-off point" />
          </>}
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm"><span>Total</span><span className="text-lg font-semibold">{formatPrice(Math.round(qty * price * 100) / 100)}</span></div>
          <Button disabled={!valid} onClick={submit}>Send commitment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const statusLabel: Record<Commitment["status"], string> = { proposed: "Awaiting seller", countered: "Counter offer", accepted: "Accepted · in escrow", delivered: "Delivered", completed: "Completed", declined: "Declined", disputed: "Disputed · escrow frozen", refunded: "Refunded" };
function CommitmentCard({ c }: { c: Commitment }) {
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between gap-2"><p className="flex items-center gap-1 font-semibold"><FileSignature className="h-4 w-4 text-primary" />Commitment</p><span className="rounded-full bg-muted px-2 py-0.5 text-[11px]">{statusLabel[c.status]}</span></div>
      <p className="mt-2">{c.quantity} × {c.item}</p>
      <p className="text-xs text-muted-foreground">{new Date(c.scheduledFor).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })} · {c.fulfilment === "delivery" ? "Delivery" : "Pickup"}</p>
      <p className="mt-1 text-base font-semibold">{formatPrice(c.total)}{c.status === "countered" && c.counterTotal !== undefined && <span className="ml-2 text-sm font-normal text-primary">→ {formatPrice(c.counterTotal)}</span>}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {c.status === "proposed" && <><p className="w-full text-[11px] text-muted-foreground">Seller response (Sandbox simulation)</p>
          <Button size="sm" onClick={() => act(c.id, { type: "accept" })}>Accept</Button>
          <Button size="sm" variant="outline" onClick={() => act(c.id, { type: "counter", total: Math.round(c.total * 1.1 * 100) / 100 })}>Counter +10%</Button>
          <Button size="sm" variant="ghost" onClick={() => act(c.id, { type: "decline" })}>Decline</Button></>}
        {c.status === "countered" && <><Button size="sm" onClick={() => act(c.id, { type: "acceptCounter" })}>Accept counter</Button><Button size="sm" variant="ghost" onClick={() => act(c.id, { type: "decline" })}>Decline</Button></>}
        {c.status === "accepted" && c.fulfilment === "delivery" && <Button size="sm" asChild><Link to="/track/$id" params={{ id: c.id }}><Navigation />Track</Link></Button>}
        {c.status === "accepted" && c.fulfilment === "pickup" && <Button size="sm" onClick={() => act(c.id, { type: "complete" })}>Mark completed</Button>}
        {c.status === "delivered" && <Button size="sm" onClick={() => act(c.id, { type: "complete" })}>Confirm & release</Button>}
        {(c.status === "accepted" || c.status === "delivered") && <Button size="sm" variant="outline" onClick={() => act(c.id, { type: "dispute", reason: "Raised from chat" })}>Dispute</Button>}
        {c.status === "disputed" && <><Button size="sm" onClick={() => act(c.id, { type: "resolve" })}>Resolve · release</Button><Button size="sm" variant="outline" onClick={() => act(c.id, { type: "escalate" })}>Escalate · refund</Button></>}
      </div>
    </div>
  );
}
