import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Lock, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, Card } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/discovery";
import { heldTotal } from "@/lib/escrow";
import { topUpWallet, useSandbox } from "@/lib/sandbox-store";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — QPi.money" },
      { name: "description", content: "Sandbox wallet balance, escrow holds and transaction history." },
      { property: "og:title", content: "Wallet — QPi.money" },
      { property: "og:description", content: "Sandbox wallet balance, escrow holds and transaction history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

const icons = { topup: Plus, hold: Lock, release: ArrowUpRight, refund: ArrowDownLeft };

function WalletPage() {
  const navigate = useNavigate();
  const { wallet } = useSandbox();
  return (
    <AppShell title="Wallet" back={() => navigate({ to: "/profile" })}>
      <Card className="bg-gradient-copper text-primary-foreground">
        <p className="text-sm opacity-90">Available · Sandbox funds</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">{formatPrice(wallet.balance)}</p>
        <p className="text-xs opacity-80">{formatPrice(heldTotal(wallet))} held in escrow</p>
      </Card>
      <Button className="mt-3 h-11 w-full rounded-xl" variant="outline" onClick={() => { topUpWallet(1000); toast.success("Added ₹1,000 sandbox funds"); }}><Plus />Top up ₹1,000 (Sandbox)</Button>
      <h2 className="mb-2 mt-5 text-sm font-semibold text-muted-foreground">History</h2>
      {!wallet.ledger.length && <p className="py-8 text-center text-sm text-muted-foreground">No transactions yet.</p>}
      <ul className="divide-y divide-border">
        {wallet.ledger.map(e => { const Icon = icons[e.kind]; return (
          <li key={e.id} className="flex items-center gap-3 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-muted"><Icon className="h-4 w-4 text-primary" /></span>
            <div className="flex-1"><p className="text-sm font-medium">{e.note}</p><p className="text-xs text-muted-foreground">{new Date(e.at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</p></div>
            <span className="text-sm font-semibold tabular-nums">{e.kind === "topup" || e.kind === "refund" ? "+" : e.kind === "hold" ? "−" : ""}{formatPrice(e.amount)}</span>
          </li>
        ); })}
      </ul>
    </AppShell>
  );
}
