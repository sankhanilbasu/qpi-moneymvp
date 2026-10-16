import { createFileRoute } from "@tanstack/react-router";
import { FileSignature } from "lucide-react";
import { AppShell, Card } from "@/components/AppShell";

export const Route = createFileRoute("/chat")({
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

const threads = [
  { who: "Copperleaf Farm", last: "Commitment: 12 eggs weekly · signed", time: "2m", commit: true },
  { who: "Riverside Bakery", last: "Can you deliver Saturday?", time: "1h", commit: false },
  { who: "Atlas Repair Co.", last: "Commitment: screen repair · pending", time: "Yesterday", commit: true },
];

function Chat() {
  return (
    <AppShell title="Chat">
      <Card className="mb-4 bg-accent">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live ledger</p>
        <p className="mt-1 text-2xl font-semibold">3 active commitments</p>
      </Card>
      <div className="flex flex-col divide-y divide-border">
        {threads.map((t) => (
          <div key={t.who} className="flex items-center gap-3 py-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted font-semibold text-primary">{t.who[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-between">
                <p className="font-medium">{t.who}</p>
                <span className="text-xs text-muted-foreground">{t.time}</span>
              </div>
              <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                {t.commit && <FileSignature className="h-3.5 w-3.5 shrink-0 text-primary" />}
                {t.last}
              </p>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
