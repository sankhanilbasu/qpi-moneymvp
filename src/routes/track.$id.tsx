import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { LazyMap } from "@/components/maps/LazyMap";
import { formatPrice } from "@/lib/discovery";
import { etaMinutes, fetchRoute, legFraction, pointAlong, tripProgress, tripStage, type LatLng, type TripStage } from "@/lib/geo";
import { actOnCommitment, useSandbox } from "@/lib/sandbox-store";

export const Route = createFileRoute("/track/$id")({
  head: () => ({
    meta: [
      { title: "Live tracking — QPi.money" },
      { name: "description", content: "Follow your courier, food delivery or ride on the map." },
      { property: "og:title", content: "Live tracking — QPi.money" },
      { property: "og:description", content: "Follow your courier, food delivery or ride on the map." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Track,
});

const steps: { stage: TripStage; label: string }[] = [{ stage: "accepted", label: "Accepted" }, { stage: "picked_up", label: "Picked up" }, { stage: "on_the_way", label: "On the way" }, { stage: "arrived", label: "Arrived" }];

function Track() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { commitments } = useSandbox();
  const c = commitments.find(x => x.id === id);
  const [route, setRoute] = useState<{ path: LatLng[]; minutes: number; road: boolean } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (c?.pickup && c.dropoff) void fetchRoute(c.pickup, c.dropoff).then(setRoute); }, [c?.pickup?.[0], c?.pickup?.[1], c?.dropoff?.[0], c?.dropoff?.[1]]);

  const progress = c?.acceptedAt ? (c.status === "accepted" ? tripProgress(c.acceptedAt, now) : 1) : 0;
  const stage = tripStage(progress);
  const courier = useMemo<LatLng | undefined>(() => (route ? pointAlong(route.path, legFraction(progress)) : c?.pickup), [route, progress, c?.pickup]);

  if (!c || !c.pickup || !c.dropoff) return <AppShell title="Tracking" back={() => navigate({ to: "/chat" })}><p className="text-sm text-muted-foreground">Nothing to track for this commitment.</p></AppShell>;
  const markers = [{ id: "a", position: c.pickup, label: "Pickup", tone: "pickup" as const }, { id: "b", position: c.dropoff, label: "Drop-off", tone: "dropoff" as const }, ...(courier ? [{ id: "courier", position: courier, label: `${c.sellerName} courier`, tone: "courier" as const }] : [])];
  const idx = steps.findIndex(s => s.stage === stage);
  function confirm() {
    try { actOnCommitment(c!.id, { type: "deliver" }); actOnCommitment(c!.id, { type: "complete" }); toast.success("Delivered · escrow released"); }
    catch (e) { toast.error((e as Error).message); }
  }
  return (
    <AppShell title="Live tracking" back={() => navigate({ to: "/chat/$id", params: { id: c.threadId } })}>
      <LazyMap className="h-72" center={c.pickup} markers={markers} path={route?.path} fit />
      <p className="mt-1 text-[11px] text-muted-foreground">Simulated movement (Sandbox){route && !route.road ? " · straight-line route" : ""}</p>
      <Card className="mt-3">
        <div className="flex items-baseline justify-between"><p className="font-semibold">{c.item}</p><p className="text-sm text-muted-foreground">{c.sellerName}</p></div>
        <p className="mt-1 text-2xl font-semibold">{c.status !== "accepted" ? "Delivered" : stage === "arrived" ? "Arrived" : `${etaMinutes(progress, route?.minutes ?? 10)} min`}</p>
        <ol className="mt-4 grid grid-cols-4 gap-1 text-center text-[11px]">
          {steps.map((s, i) => <li key={s.stage} className="flex flex-col items-center gap-1"><span className={`grid h-6 w-6 place-items-center rounded-full ${i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i <= idx ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>{s.label}</li>)}
        </ol>
      </Card>
      {c.status === "accepted" && <Button className="mt-4 h-12 w-full rounded-xl" disabled={stage !== "arrived"} onClick={confirm}>{stage === "arrived" ? `Confirm delivery · release ${formatPrice(c.total)}` : "Waiting for arrival…"}</Button>}
      {c.status !== "accepted" && <Button asChild variant="outline" className="mt-4 h-12 w-full rounded-xl"><Link to="/chat/$id" params={{ id: c.threadId }}>Back to conversation</Link></Button>}
    </AppShell>
  );
}
