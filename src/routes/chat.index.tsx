import { createFileRoute, Link } from "@tanstack/react-router";
import { FileSignature, MapPin } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { isActive } from "@/lib/commitments";
import { formatPrice } from "@/lib/discovery";
import { useSandbox } from "@/lib/sandbox-store";

export const Route = createFileRoute("/chat/")({
  head: () => ({
    meta: [
      { title: "Chat — QPi.money" },
      { name: "description", content: "Live ledger and conversational commitments." },
      { property: "og:title", content: "Chat — QPi.money" },
      { property: "og:description", content: "Live ledger and conversational commitments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Chat,
});

const timeAgo = (at: number) => { const m = Math.round((Date.now() - at) / 60000); return m < 1 ? "now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`; };

function Chat() {
  const { threads, messages, commitments } = useSandbox();
  const active = commitments.filter(isActive), completed = commitments.filter(c => c.status === "completed"), disputed = commitments.filter(c => c.status === "disputed");
  return (
    <AppShell title="Chat">
      <Card className="mb-4 bg-accent">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live ledger</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[["Active", active.length], ["Completed", completed.length], ["Disputed", disputed.length]].map(([l, n]) => <div key={l}><p className="text-2xl font-semibold">{n}</p><p className="text-[11px] text-muted-foreground">{l}</p></div>)}
        </div>
        {active.length > 0 && <p className="mt-2 text-xs text-muted-foreground">{formatPrice(active.reduce((s, c) => s + c.total, 0))} in active commitments</p>}
      </Card>
      {!threads.length && <div className="flex flex-col items-center gap-2 py-12 text-center"><p className="text-sm text-muted-foreground">No conversations yet. Request an offer to start one.</p><Button asChild variant="link"><Link to="/discover">Browse Discover</Link></Button></div>}
      <div className="flex flex-col divide-y divide-border">
        {threads.map(t => {
          const last = [...messages].reverse().find(m => m.threadId === t.id);
          const commitment = last?.commitmentId ? commitments.find(c => c.id === last.commitmentId) : undefined;
          const preview = commitment ? `Commitment: ${commitment.item} · ${commitment.status}` : last?.location ? "Shared a location" : last?.text ?? "";
          return (
            <Link key={t.id} to="/chat/$id" params={{ id: t.id }} className="flex items-center gap-3 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted font-semibold text-primary">{t.producerName[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between"><p className="font-medium">{t.producerName}</p><span className="text-xs text-muted-foreground">{last ? timeAgo(last.at) : ""}</span></div>
                <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">{commitment && <FileSignature className="h-3.5 w-3.5 shrink-0 text-primary" />}{last?.location && <MapPin className="h-3.5 w-3.5 shrink-0" />}{preview}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}
